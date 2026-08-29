"use client";

import { useWishlist } from "@/lib/WishlistContext";

/**
 * Catchy nudge shown on tabs other than Wishlist, so the user doesn't have
 * to remember to go check their wishlist themselves. One tap jumps straight
 * to the Wishlist tab AND auto-starts the reset session (via
 * requestAutoReset in context) — no extra click once there.
 */
export default function ResetNudgeBanner({ onNavigateToWishlist }) {
  const { wishlistItems, requestAutoReset } = useWishlist();

  if (wishlistItems.length === 0) return null;

  function handleClick() {
    requestAutoReset();
    onNavigateToWishlist();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-coral-200 bg-gradient-to-r from-coral-50 to-coral-100 px-4 py-3 text-left transition hover:from-coral-100 hover:to-coral-200 active:scale-[0.99] sm:mx-5"
    >
      <span className="text-xl" aria-hidden>
        🧹
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-coral-700">
          {wishlistItems.length} items are quietly cluttering your wishlist
        </span>
        <span className="block text-xs text-coral-600">
          Tap to reset it in under a minute — no digging required
        </span>
      </span>
      <span className="text-coral-500" aria-hidden>
        →
      </span>
    </button>
  );
}
