/**
 * Lightweight, non-monetary gamification: a return-streak and a
 * decisiveness "identity" tier. No login exists in this MVP, so the streak
 * is the app's one piece of state that survives a refresh — persisted to
 * localStorage, per-browser rather than per-account (see README "known
 * limitations"). Deliberately no coupon/discount tie-in: the whole point of
 * Wishlist Reset is a genuine declutter tool, not a discount funnel, so the
 * reward stays identity/progress-based (streaks, a decisiveness badge)
 * rather than monetary.
 *
 * The streak fires on any wishlist-to-cart conversion (a "buy" swipe/tap),
 * not on finishing an entire reset session. The app's actual goal is
 * getting wishlist items into the cart, not making someone clear their
 * whole list every day — most people never will, and a handful of
 * genuinely useful swipes is a real win even if the session is abandoned
 * half-done. Requiring full completion would reward the wrong behavior
 * (grinding through everything) instead of the one that matters
 * (converting at least one item).
 */

const STORAGE_KEY = "wishlistReset:gamification:v2";

const DEFAULT_STATE = {
  currentStreak: 0,
  longestStreak: 0,
  lastCartAddDay: null, // "YYYY-MM-DD", local calendar day of the last wishlist-to-cart conversion
  totalCartAdds: 0,
};

function todayKey() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function daysBetween(dayA, dayB) {
  return Math.round((new Date(dayB) - new Date(dayA)) / 86400000);
}

export function getGamificationState() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

// Called once per item swiped/tapped into the cart from a reset session —
// not once per session. A second (or fifth) cart-add on the same calendar
// day doesn't extend the streak further (that would make it trivial to
// farm in one sitting) — it only counts once real return visits, one
// calendar day apart, happen. A day with zero cart-adds (session opened
// but everything kept/removed) doesn't extend it either — that's the
// point: the streak tracks conversions, not app opens.
export function recordCartAdd() {
  const state = getGamificationState();
  const today = todayKey();

  let next;
  if (state.lastCartAddDay === today) {
    next = { ...state, totalCartAdds: state.totalCartAdds + 1 };
  } else {
    const gap = state.lastCartAddDay ? daysBetween(state.lastCartAddDay, today) : null;
    const currentStreak = gap === 1 ? state.currentStreak + 1 : 1;
    next = {
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastCartAddDay: today,
      totalCartAdds: state.totalCartAdds + 1,
    };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, etc.) — streak just won't persist.
  }
  return next;
}

// Decisiveness tiers, driven by the existing verdict-agreement stat
// (lib/analytics.js / the Profile tab's "% agreement with verdict") —
// reframed as a visible identity rather than a buried percentage.
export const DECISIVENESS_TIERS = [
  { min: 0, label: "New to Resets", icon: "🌱" },
  { min: 40, label: "Casual Sorter", icon: "🙂" },
  { min: 65, label: "Decisive Shopper", icon: "⚡" },
  { min: 85, label: "Wishlist Master", icon: "🏆" },
];

export function getDecisivenessTier(agreementPct) {
  let tier = DECISIVENESS_TIERS[0];
  for (const t of DECISIVENESS_TIERS) {
    if (agreementPct >= t.min) tier = t;
  }
  return tier;
}
