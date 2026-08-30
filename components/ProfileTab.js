"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { getDecisivenessTier, DECISIVENESS_TIERS } from "@/lib/gamification";

const STATIC_MENU = ["Orders", "Addresses", "Payment Methods", "Help Center"];

/**
 * Profile screen. The account section is static (no auth in this MVP), but
 * the stats card is real — it summarizes `results`, the lifetime log every
 * reset-session action feeds into `lib/analytics.js`, ties the case study's
 * analytics hook to something visible in the UI. The agreement percentage
 * is reframed as a visible "decisiveness" tier/badge (lib/gamification.js)
 * rather than a buried number, and the cart-add streak — the one bit of
 * state that survives a refresh, via localStorage — is shown alongside it.
 * The streak tracks wishlist-to-cart conversions specifically, not reset
 * sessions completed, so it can be nonzero even from a session that was
 * only partly worked through.
 */
export default function ProfileTab() {
  const { results, streakState } = useWishlist();
  const [expandedLabel, setExpandedLabel] = useState(null);

  const total = results.length;
  const decisive = results.filter((r) => r.verdict !== "disagreement");
  const agreeing = decisive.filter((r) => r.verdict === r.action);
  const agreementPct =
    decisive.length > 0 ? Math.round((agreeing.length / decisive.length) * 100) : null;
  const tier = getDecisivenessTier(agreementPct ?? 0);
  const nextTier = DECISIVENESS_TIERS[DECISIVENESS_TIERS.indexOf(tier) + 1];

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

      {(total > 0 || streakState.totalCartAdds > 0) && (
        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral-50 text-2xl">
              {tier.icon}
            </span>
            <div>
              <p className="text-base font-extrabold text-neutral-900">{tier.label}</p>
              <p className="text-xs text-neutral-500">
                {agreementPct !== null
                  ? `${agreementPct}% agreement with the verdict`
                  : "Complete a reset to earn a decisiveness score"}
                {nextTier && agreementPct !== null && (
                  <> · {nextTier.min - agreementPct}% to {nextTier.label}</>
                )}
              </p>
            </div>
          </div>

          {streakState.currentStreak > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <span aria-hidden>🔥</span>
              {streakState.currentStreak}-day streak
              {streakState.longestStreak > streakState.currentStreak && (
                <span className="font-medium text-amber-500">
                  · best: {streakState.longestStreak}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">Your Wishlist Reset stats</h2>
        {total === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Run a reset session and your stats will show up here.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-500">
              {total} item{total !== 1 ? "s" : ""} processed · {streakState.totalCartAdds}{" "}
              added to cart
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
