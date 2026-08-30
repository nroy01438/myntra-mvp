"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { getRank, getNextRank } from "@/lib/gamification";
import { ProfileIcon } from "@/components/icons";

/**
 * The Profile nav icon. Clicking it navigates to Profile, same as always;
 * hovering it (desktop) surfaces a popover with the shopper's rank, points,
 * and progress to the next rank — the gamification detail lives here
 * (against the identity it names), rather than competing for space on the
 * Home feed with a standalone banner.
 */
export default function ProfileHoverCard({ onNavigate }) {
  const [hovered, setHovered] = useState(false);
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
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        data-testid="nav-profile"
        onClick={onNavigate}
        className="flex flex-col items-center gap-0.5 px-1 text-neutral-600 transition hover:text-coral-500"
      >
        <span className="relative">
          <ProfileIcon className="h-5 w-5" />
          {gamificationState.totalPoints > 0 && (
            <span
              className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] shadow-sm ring-1 ring-neutral-100"
              aria-hidden
            >
              {rank.icon}
            </span>
          )}
        </span>
        <span className="hidden text-[11px] font-medium sm:inline">Profile</span>
      </button>

      <div
        className={`absolute right-0 top-full z-30 mt-2 w-60 origin-top-right rounded-2xl border border-neutral-100 bg-white p-3.5 shadow-xl transition ${
          hovered ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-50 text-xl">
            {rank.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-neutral-900">{rank.label}</p>
            <p className="text-xs text-neutral-500">{gamificationState.totalPoints} points</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-coral-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {nextRank ? (
          <p className="mt-1.5 text-[11px] text-neutral-400">
            {nextRank.min - gamificationState.totalPoints} pts to {nextRank.icon} {nextRank.label}
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] font-semibold text-coral-500">
            🏆 Highest rank reached
          </p>
        )}
      </div>
    </div>
  );
}
