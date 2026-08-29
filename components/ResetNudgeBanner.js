"use client";

import { useWishlist } from "@/lib/WishlistContext";

/**
 * Catchy nudge shown on Home/Profile/Cart, so the user doesn't have to
 * remember to check their wishlist themselves. One tap opens the wishlist
 * overlay and immediately auto-starts the reset session — no extra click.
 */
export default function ResetNudgeBanner({ onOpenReset, className = "" }) {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) return null;

  return (
    <button
      type="button"
      onClick={onOpenReset}
      className={`mt-3 flex items-center gap-3 rounded-2xl border border-coral-200 bg-gradient-to-r from-coral-50 to-coral-100 px-4 py-3 text-left transition hover:from-coral-100 hover:to-coral-200 active:scale-[0.99] ${className}`}
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
