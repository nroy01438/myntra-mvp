/**
 * Lightweight, non-monetary gamification: a return-streak and a
 * decisiveness "identity" tier. No login exists in this MVP, so the streak
 * is the app's one piece of state that survives a refresh — persisted to
 * localStorage, per-browser rather than per-account (see README "known
 * limitations"). Deliberately no coupon/discount tie-in: the whole point of
 * Wishlist Reset is a genuine declutter tool, not a discount funnel, so the
 * reward stays identity/progress-based (streaks, a decisiveness badge)
 * rather than monetary.
 */

const STORAGE_KEY = "wishlistReset:gamification:v1";

const DEFAULT_STATE = {
  currentStreak: 0,
  longestStreak: 0,
  lastResetDay: null, // "YYYY-MM-DD", local calendar day of the last completed reset
  totalResets: 0,
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

// Called once per completed reset session. A second reset completed on the
// same calendar day doesn't extend the streak (that would make the streak
// trivial to farm in one sitting) — it only counts once real return visits,
// one calendar day apart, happen.
export function recordResetCompletion() {
  const state = getGamificationState();
  const today = todayKey();

  let next;
  if (state.lastResetDay === today) {
    next = { ...state, totalResets: state.totalResets + 1 };
  } else {
    const gap = state.lastResetDay ? daysBetween(state.lastResetDay, today) : null;
    const currentStreak = gap === 1 ? state.currentStreak + 1 : 1;
    next = {
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastResetDay: today,
      totalResets: state.totalResets + 1,
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
