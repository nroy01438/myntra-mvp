/**
 * One-time data-generation script.
 *
 * Reads /data/products.base.json (products + raw reviews, no crowd stats),
 * calls the LLM once per product to extract fit sentiment from its reviews,
 * derives crowdStats via the transparent formula in /lib/deriveCrowdStats.js,
 * and writes the enriched catalog — raw sentiment AND derived stats — to
 * /data/products.json.
 *
 * Run with: node scripts/generateCrowdStats.js
 * (loads .env.local itself, no separate dotenv dependency needed)
 *
 * The live app only ever reads the finished /data/products.json — it never
 * re-derives these numbers per user session.
 */

const fs = require("fs");
const path = require("path");

// --- minimal .env.local loader (avoids adding a dotenv dependency) ---
function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}
loadEnvLocal();

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
// gemini-1.5-flash has been retired; gemini-flash-lite-latest is the current
// free-tier equivalent (and avoids the "thinking" token overhead of the
// full flash models, which can eat the whole output budget on short prompts).
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = new Error(`Groq error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
    }),
  });

  if (!res.ok) {
    const err = new Error(`Gemini error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function callLLM(prompt) {
  try {
    return await callGroq(prompt);
  } catch (groqError) {
    console.warn(`  Groq failed (${groqError.message}), falling back to Gemini...`);

    // Free-tier Gemini rate limits are easy to hit when looping over a whole
    // catalog; retry with backoff instead of failing the whole run on a 429.
    const delays = [3000, 8000, 15000];
    let lastError;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return await callGemini(prompt);
      } catch (geminiError) {
        lastError = geminiError;
        if (geminiError.status !== 429 || attempt === delays.length) break;
        console.warn(`  Gemini rate-limited, retrying in ${delays[attempt] / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }
    throw lastError;
  }
}

function buildSentimentPrompt(product) {
  return `You are extracting structured sentiment signal from customer reviews of a fashion e-commerce product, focused specifically on FIT.

Product: ${product.name} (${product.category})
Reviews:
${product.reviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Analyze the fit-related sentiment across these reviews and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this shape:
{
  "fit_sentiment": "positive" | "negative" | "mixed",
  "negative_fit_mentions": <integer count of reviews expressing negative fit/sizing issues>,
  "positive_fit_mentions": <integer count of reviews expressing positive fit/sizing experiences>,
  "overall_sentiment_score": <float from -1.0 (very negative) to 1.0 (very positive)>
}`;
}

function parseSentimentResponse(raw) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  if (
    typeof parsed.fit_sentiment !== "string" ||
    typeof parsed.negative_fit_mentions !== "number" ||
    typeof parsed.positive_fit_mentions !== "number" ||
    typeof parsed.overall_sentiment_score !== "number"
  ) {
    throw new Error("Sentiment response missing required fields");
  }
  return parsed;
}

async function main() {
  const { deriveCrowdStats } = await import("../lib/deriveCrowdStats.js");

  const basePath = path.join(__dirname, "..", "data", "products.base.json");
  const outPath = path.join(__dirname, "..", "data", "products.json");

  const products = JSON.parse(fs.readFileSync(basePath, "utf-8"));

  // Resumable: if products.json already has sentiment/crowdStats for a
  // product from a previous (possibly rate-limited) run, don't re-spend
  // free-tier quota re-processing it.
  let existingById = new Map();
  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    existingById = new Map(existing.map((p) => [p.id, p]));
  }

  const enriched = [];

  for (const product of products) {
    const already = existingById.get(product.id);
    if (already?.sentiment && already?.crowdStats) {
      console.log(`Skipping ${product.id} — ${product.name} (already processed)`);
      enriched.push(already);
      continue;
    }

    process.stdout.write(`Processing ${product.id} — ${product.name}... `);
    const prompt = buildSentimentPrompt(product);

    let sentiment;
    try {
      const raw = await callLLM(prompt);
      sentiment = parseSentimentResponse(raw);
    } catch (err) {
      console.error(`\n  FAILED to get sentiment for ${product.id}: ${err.message}`);
      throw err;
    }

    const crowdStats = deriveCrowdStats(sentiment, product, product.stockLevel);

    enriched.push({
      ...product,
      sentiment,
      crowdStats,
    });

    console.log(
      `sentiment=${sentiment.fit_sentiment} (${sentiment.overall_sentiment_score}) -> buyThroughRate=${crowdStats.buyThroughRate} churnRate=${crowdStats.churnRate} priceDrop=${crowdStats.priceDropFrequency}`
    );

    // Write progress incrementally so a rate-limit failure partway through
    // doesn't lose already-processed products (see resume logic above).
    fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));

    // Be polite to free-tier rate limits.
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));
  console.log(`\nWrote ${enriched.length} products to ${outPath}`);
}

main().catch((err) => {
  console.error("generateCrowdStats failed:", err);
  process.exit(1);
});
