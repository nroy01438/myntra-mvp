/**
 * callLLM(prompt) — single entry point for every LLM call in this app.
 *
 * Primary: Groq (OpenAI-compatible endpoint), model llama-3.3-70b-versatile.
 * Fallback: Gemini free tier (gemini-1.5-flash), used on any Groq error or
 * HTTP 429 from Groq.
 *
 * Both are free-tier APIs — no paid usage anywhere in this stack. Keys are
 * read from environment variables only; never hardcode real keys.
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// gemini-1.5-flash has been retired; gemini-flash-lite-latest is the current
// free-tier equivalent (and avoids the "thinking" token overhead of the
// full flash models, which can eat the whole output budget on short prompts).
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set");
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
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
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
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

/**
 * @param {string} prompt
 * @returns {Promise<string>} raw text response from whichever provider succeeded
 */
export async function callLLM(prompt) {
  try {
    return await callGroq(prompt);
  } catch (groqError) {
    console.warn("[callLLM] Groq failed, falling back to Gemini:", groqError.message);
    try {
      return await callGemini(prompt);
    } catch (geminiError) {
      console.error("[callLLM] Gemini fallback also failed:", geminiError.message);
      throw new Error(
        `Both LLM providers failed. Groq: ${groqError.message}. Gemini: ${geminiError.message}`
      );
    }
  }
}
