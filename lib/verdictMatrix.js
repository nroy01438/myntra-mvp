/**
 * Deterministic verdict matrix.
 *
 * This is the core rule engine for Wishlist Reset. Given the user's stated
 * reason for saving an item and the item's derived crowd-behavior stats, it
 * returns exactly one verdict. The LLM is NEVER involved in this decision —
 * it only narrates the verdict afterwards (see /app/api/reasoning).
 *
 * verdict is one of: "buy" | "keep" | "remove" | "disagreement"
 */

export const REASONS = {
  LOVE_IT: "love_it",
  FOR_EVENT: "for_event",
  JUST_BROWSING: "just_browsing",
  WAITING_FOR_DEAL: "waiting_for_deal",
};

export const REASON_LABELS = {
  [REASONS.LOVE_IT]: "Love it",
  [REASONS.FOR_EVENT]: "For an event",
  [REASONS.JUST_BROWSING]: "Just browsing",
  [REASONS.WAITING_FOR_DEAL]: "Waiting for a deal",
};

/**
 * @param {string} reason - one of REASONS
 * @param {object} crowdStats - { buyThroughRate, churnRate, priceDropFrequency, stockLevel }
 * @returns {{ verdict: "buy"|"keep"|"remove"|"disagreement", headline: string, case: string }}
 */
export function getVerdict(reason, crowdStats) {
  const { buyThroughRate, churnRate, priceDropFrequency, stockLevel } = crowdStats;

  switch (reason) {
    case REASONS.JUST_BROWSING: {
      if (churnRate > 60) {
        return { verdict: "remove", headline: "Let it go", case: "just_browsing_high_churn" };
      }
      return {
        verdict: "keep",
        headline: "No rush, but worth another look",
        case: "just_browsing_low_churn",
      };
    }

    case REASONS.WAITING_FOR_DEAL: {
      if (priceDropFrequency === "frequent") {
        return {
          verdict: "keep",
          headline: "Keep watching — deals happen often on this one",
          case: "waiting_for_deal_frequent",
        };
      }
      return {
        verdict: "buy",
        headline: "This one rarely goes on sale — worth buying now",
        case: "waiting_for_deal_rare",
      };
    }

    case REASONS.FOR_EVENT: {
      if (stockLevel === "low") {
        return {
          verdict: "buy",
          headline: "Decide soon — this won't wait for your event",
          case: "for_event_low_stock",
        };
      }
      return {
        verdict: "keep",
        headline: "You've got time, but don't forget this one",
        case: "for_event_ample_stock",
      };
    }

    case REASONS.LOVE_IT: {
      if (buyThroughRate > 60) {
        return { verdict: "buy", headline: "Buy it — this one's real", case: "love_it_high_bt" };
      }
      return {
        verdict: "disagreement",
        headline: "Worth a second look",
        case: "love_it_low_bt",
      };
    }

    default:
      throw new Error(`Unknown reason: ${reason}`);
  }
}
