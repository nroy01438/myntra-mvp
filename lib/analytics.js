/**
 * Lightweight analytics event logger — v1.
 *
 * No backend, no database: events are logged to the console and kept in an
 * in-memory array for the current session only. Nothing persists across page
 * loads (see README "known limitations").
 *
 * This is structured so it's obvious how a real backend would turn it into
 * case-study metrics later, e.g.:
 *   - "% agreement between verdict and user action" = count(action matches
 *     verdict, e.g. verdict="buy" and action="buy") / total events
 *   - "bucket distribution" = group by verdict, count per bucket
 *   - "reason distribution" = group by reason, count per bucket
 */

const events = [];

/**
 * @param {object} event
 * @param {string} event.productId
 * @param {string} event.reason - the tapped reason chip
 * @param {string} event.verdict - "buy" | "keep" | "remove" | "disagreement"
 * @param {string} event.action - "buy" | "keep" | "remove" (the user's actual choice)
 * @param {string} event.interaction - "button" | "swipe"
 */
export function logEvent(event) {
  const enriched = {
    ...event,
    verdictMatchesAction: verdictMatchesAction(event.verdict, event.action),
    timestamp: new Date().toISOString(),
  };
  events.push(enriched);
  // eslint-disable-next-line no-console
  console.log("[analytics]", enriched);
  return enriched;
}

function verdictMatchesAction(verdict, action) {
  // "disagreement" has no single matching action — it's a genuine judgment
  // call left to the user, so it's excluded from the agreement metric.
  if (verdict === "disagreement") return null;
  return verdict === action;
}

export function getSessionEvents() {
  return [...events];
}

export function clearSessionEvents() {
  events.length = 0;
}
