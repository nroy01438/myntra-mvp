import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

/**
 * POST /api/reasoning
 *
 * Takes the ALREADY-DECIDED verdict (from the deterministic matrix in
 * /lib/verdictMatrix.js) plus the item's real data, and asks the LLM to
 * write a short natural-language sentence explaining it. The LLM never
 * chooses the verdict — it only narrates a decision that's already been made.
 *
 * body: { product, reason, verdictCase, verdict, headline }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { product, reason, verdictCase, verdict, headline } = body;

    if (!product || !reason || !verdict) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { crowdStats, sentiment } = product;
    const isDisagreement = verdict === "disagreement";

    const reviewSnippets = isDisagreement
      ? (product.reviews || []).slice(0, 3)
      : [];

    const prompt = `You are writing a short, friendly, direct explanation inside a shopping app called "Wishlist Reset" that helps users decide what to do with items they saved to their wishlist.

The user said their reason for saving this item was: "${reason.replace(/_/g, " ")}".
The app already decided the verdict using fixed rules (you must NOT change or second-guess this verdict, only explain it): "${verdict}" (headline: "${headline}").

Item: ${product.name} (${product.brand}), price ₹${product.price}, category ${product.category}.
Crowd behavior data on this item (from other users who saved it): buyThroughRate=${crowdStats.buyThroughRate}%, churnRate=${crowdStats.churnRate}%, priceDropFrequency=${crowdStats.priceDropFrequency}.
${sentiment ? `Review sentiment signal: ${sentiment.fit_sentiment}, overall score ${sentiment.overall_sentiment_score}.` : ""}

${
  isDisagreement
    ? `This is a DISAGREEMENT case: the user loves this item, but most people who saved it didn't end up buying it. Write a slightly longer (3-4 sentences) "worth a second look" explanation. Reference the actual numbers above, and naturally weave in what these real review snippets suggest without just repeating them verbatim:\n${reviewSnippets
        .map((r, i) => `- "${r}"`)
        .join("\n")}`
    : `Write ONE short, punchy sentence (max 25 words) explaining this verdict using the actual numbers above. Be conversational, not robotic. Do not mention "matrix" or "algorithm" or "rules".`
}

Respond with ONLY the explanation text, no preamble, no quotes around it.`;

    const reasoning = await callLLM(prompt);

    return NextResponse.json({ reasoning: reasoning.trim() });
  } catch (error) {
    console.error("[/api/reasoning] error:", error);
    return NextResponse.json(
      { error: "Failed to generate reasoning", details: error.message },
      { status: 500 }
    );
  }
}
