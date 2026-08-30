"use client";

import { useWishlist } from "@/lib/WishlistContext";
import { getRank, getNextRank } from "@/lib/gamification";

/**
 * Prominent points/rank badge — the gamification hook made visible right on
 * Home, not tucked away in Profile. A named rank (not a raw point count) is
 * the headline, since a title is more legible at a glance than a number;
 * the progress bar shows how close the next rank is without a trip to
 * Profile. Points, not a calendar streak — see lib/gamification.js for why
 * a streak doesn't fit a wishlist tool people won't open every day.
 */
export default function RankBadge({ onClick }) {
  const { gamificationState } = useWishlist();
  const rank = getRank(gamificationState.totalPoints);
  const nextRank = getNextRank(gamificationState.totalPoints);

  const progressPct = nextRank
    ? Math.min(
        100,
        Math.round(
          ((gamificationState.totalPoints - rank.min) / (nextRank.min - rank.min)) * 100
        )
      )
    : 100;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 text-left shadow-sm transition hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-50 text-2xl">
        {rank.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-extrabold text-neutral-900">{rank.label}</p>
          <p className="shrink-0 text-xs font-semibold text-neutral-500">
            {gamificationState.totalPoints} pts
          </p>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-coral-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextRank && (
          <p className="mt-1 text-[11px] text-neutral-400">
            {nextRank.min - gamificationState.totalPoints} pts to {nextRank.label}
          </p>
        )}
      </div>
    </button>
  );
}
