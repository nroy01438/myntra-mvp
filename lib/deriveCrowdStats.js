/**
 * Transparent, pure derivation of crowd-behavior stats from LLM-extracted
 * review sentiment. This is the ONLY place these numbers are computed, so
 * every figure shown in the app can be traced back to actual review content.
 *
 * Run once by /scripts/generateCrowdStats.js at data-generation time — the
 * live app never calls this per user session, it just reads the finished
 * numbers out of /data/products.json.
 */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {object} sentiment - { fit_sentiment, negative_fit_mentions, positive_fit_mentions, overall_sentiment_score }
 * @param {object} product - the base product object (needs category)
 * @param {string} stockLevel - "high" | "low" | "out" (representative stock level used for the buyThroughRate stock bonus)
 * @returns {{ buyThroughRate: number, churnRate: number, priceDropFrequency: "frequent"|"rare"|"occasional" }}
 */
export function deriveCrowdStats(sentiment, product, stockLevel) {
  const { fit_sentiment, overall_sentiment_score } = sentiment;

  const stockBonus = stockLevel === "high" ? 5 : 0;
  const buyThroughRate = clamp(
    50 + overall_sentiment_score * 35 + stockBonus,
    5,
    95
  );

  // 12 = "still deciding" residual buffer: the slice of the crowd that
  // neither converted nor churned outright, still sitting on the fence.
  const churnRate = clamp(100 - buyThroughRate - 12, 5, 90);

  let priceDropFrequency;
  const isSeasonalCategory =
    product.category === "ethnic_wear" || product.category === "seasonal";
  const isBasicsOrFootwear =
    product.category === "basics" || product.category === "footwear";

  if (isSeasonalCategory || fit_sentiment === "mixed") {
    priceDropFrequency = "frequent";
  } else if (overall_sentiment_score > 0.5 && isBasicsOrFootwear) {
    priceDropFrequency = "rare";
  } else {
    priceDropFrequency = "occasional";
  }

  return {
    buyThroughRate: Math.round(buyThroughRate),
    churnRate: Math.round(churnRate),
    priceDropFrequency,
  };
}
