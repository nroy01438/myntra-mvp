"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { getRank, getNextRank } from "@/lib/gamification";

const STATIC_MENU = ["Orders", "Addresses", "Payment Methods", "Help Center"];

/**
 * Profile screen. The account section is static (no auth in this MVP), but
 * the stats card is real — it summarizes `results`, the lifetime log every
 * reset-session action feeds into `lib/analytics.js`, ties the case study's
 * analytics hook to something visible in the UI. The headline badge is a
 * named rank (lib/gamification.js) driven by lifetime points — not a
 * calendar streak — since a streak assumes near-daily engagement that a
 * wishlist tool doesn't realistically get. Points accrue on every action
 * resolved in a reset session, so the rank can climb from a session that
 * was only partly worked through. Verdict-agreement is kept as a
 * supporting stat, not the thing that names the badge.
 */
export default function ProfileTab() {
  const { results, gamificationState } = useWishlist();
  const [expandedLabel, setExpandedLabel] = useState(null);

  const total = results.length;
  const decisive = results.filter((r) => r.verdict !== "disagreement");
  const agreeing = decisive.filter((r) => r.verdict === r.action);
  const agreementPct =
    decisive.length > 0 ? Math.round((agreeing.length / decisive.length) * 100) : null;

  const rank = getRank(gamificationState.totalPoints);
  const nextRank = getNextRank(gamificationState.totalPoints);

  const buckets = ["buy", "keep", "remove", "disagreement"].map((verdict) => ({
    verdict,
    count: results.filter((r) => r.verdict === verdict).length,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-100 text-lg font-bold text-coral-600">
          G
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-neutral-900">Guest User</h1>
          <p className="text-xs text-neutral-500">No login in this MVP — see README</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-50 text-2xl">
            {rank.icon}
          </span>
          <div>
            <p className="text-base font-extrabold text-neutral-900">{rank.label}</p>
            <p className="text-xs text-neutral-500">
              {gamificationState.totalPoints} points
              {nextRank && (
                <> · {nextRank.min - gamificationState.totalPoints} to {nextRank.label}</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">Your Wishlist Reset stats</h2>
        {total === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Run a reset session and your stats will show up here.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-500">
              {total} item{total !== 1 ? "s" : ""} processed · {gamificationState.totalCartAdds}{" "}
              added to cart
              {agreementPct !== null && <> · {agreementPct}% agreement with the verdict</>}
            </p>
            <div className="mt-3 space-y-1.5">
              {buckets
                .filter((b) => b.count > 0)
                .map((b) => (
                  <div key={b.verdict} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-neutral-600">{b.verdict}</span>
                    <span className="font-bold text-neutral-900">{b.count}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {STATIC_MENU.map((label) => (
          <div key={label}>
            <button
              type="button"
              onClick={() => setExpandedLabel((prev) => (prev === label ? null : label))}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {label}
              <span
                className={`text-neutral-300 transition-transform ${
                  expandedLabel === label ? "rotate-90" : ""
                }`}
                aria-hidden
              >
                ›
              </span>
            </button>
            {expandedLabel === label && (
              <p className="bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
                Not wired up in this case study MVP — only the Wishlist flow has
                real logic behind it.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
