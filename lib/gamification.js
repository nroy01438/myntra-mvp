/**
 * Lightweight, non-monetary gamification: a lifetime points score that rolls
 * up into a named rank. Deliberately NOT a calendar streak — a streak
 * assumes something close to daily engagement, which doesn't fit a wishlist
 * tool at all (most people won't sort their wishlist every day, and
 * shouldn't feel bad for not doing so). Points instead accumulate whenever
 * the tool is actually used, however infrequently, and never expire or
 * reset — every session (even a two-swipe one) makes real, permanent
 * progress toward the next rank.
 *
 * Points are weighted toward the app's actual goal — moving items from
 * wishlist to cart, not just "processing" the wishlist — so a cart-add
 * earns far more than a keep, and a remove (real decluttering) earns more
 * than a keep too:
 *
 *   buy (added to cart)  -> 10 points
 *   remove (decluttered) ->  3 points
 *   keep (deferred)      ->  1 point
 *
 * No login exists in this MVP, so this is the app's one piece of state
 * that persists across a refresh — via localStorage, per-browser rather
 * than per-account (see README "known limitations").
 */

const STORAGE_KEY = "wishlistReset:gamification:v3";

const POINTS_BY_ACTION = { buy: 10, remove: 3, keep: 1 };

export function getPointsForAction(action) {
  return POINTS_BY_ACTION[action] ?? 0;
}

const DEFAULT_STATE = {
  totalPoints: 0,
  totalCartAdds: 0,
  totalActions: 0,
};

export function getGamificationState() {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

// Called once per swipe/tap resolved in a reset session — buy, remove, or
// keep alike — so every action, not just full session completion, makes
// permanent progress.
export function recordAction(action) {
  const state = getGamificationState();
  const next = {
    totalPoints: state.totalPoints + (POINTS_BY_ACTION[action] ?? 0),
    totalCartAdds: state.totalCartAdds + (action === "buy" ? 1 : 0),
    totalActions: state.totalActions + 1,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, etc.) — points just won't persist.
  }
  return next;
}

// Ranks, driven by lifetime points — reachable through steady, infrequent
// use, not a login streak.
export const RANKS = [
  { min: 0, label: "New Sorter", icon: "🌱" },
  { min: 20, label: "Casual Sorter", icon: "🙂" },
  { min: 60, label: "Decisive Shopper", icon: "⚡" },
  { min: 150, label: "Wishlist Master", icon: "🏆" },
];

export function getRank(totalPoints) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalPoints >= r.min) rank = r;
  }
  return rank;
}

export function getNextRank(totalPoints) {
  const current = getRank(totalPoints);
  const index = RANKS.indexOf(current);
  return RANKS[index + 1] ?? null;
}
