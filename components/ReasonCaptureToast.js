"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWishlist } from "@/lib/WishlistContext";
import { REASONS } from "@/lib/verdictMatrix";

// Deliberately only 3 of the 4 verdict-matrix reasons are offered here —
// "just browsing" isn't a chip because ignoring/dismissing the toast
// already models it implicitly (see the cold-start comment in
// WishlistTab.js). Picking a chip is one tap; ignoring it is just as valid.
const TOAST_REASONS = [
  { key: REASONS.LOVE_IT, emoji: "❤️", label: "Love it" },
  { key: REASONS.FOR_EVENT, emoji: "📅", label: "For an event" },
  { key: REASONS.WAITING_FOR_DEAL, emoji: "🏷️", label: "Waiting for a deal" },
];

/**
 * Global, non-blocking "why did you save this?" toast. Mounted once in
 * AppShell so it floats above whatever screen is showing. Fires when
 * `heartTap` adds an item to the wishlist, auto-dismisses after 4s if
 * ignored — entirely optional, never blocks the heart action itself.
 */
export default function ReasonCaptureToast() {
  const { pendingToastProduct, chooseReason, dismissToast } = useWishlist();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <AnimatePresence>
        {pendingToastProduct && (
          <motion.div
            key={pendingToastProduct.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-3 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-neutral-900">
                Saved! Why?
              </p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismissToast}
                className="rounded-full p-1 text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-500"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TOAST_REASONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => chooseReason(pendingToastProduct.id, r.key)}
                  className="rounded-full border border-coral-200 bg-coral-50 px-3 py-1.5 text-xs font-semibold text-coral-700 transition hover:bg-coral-100 active:scale-95"
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
