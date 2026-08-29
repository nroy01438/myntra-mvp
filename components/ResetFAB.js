"use client";

import { useWishlist } from "@/lib/WishlistContext";

/**
 * Always-visible floating action button (not hover-gated) that jumps
 * straight into the reset session from anywhere in the app. Hidden on the
 * Wishlist screen itself (redundant with "Begin Reset" already being
 * there) and once the wishlist is empty.
 */
export default function ResetFAB({ onQuickReset, hidden }) {
  const { wishlistItems } = useWishlist();

  if (hidden || wishlistItems.length === 0) return null;

  return (
    <button
      type="button"
      onClick={onQuickReset}
      className="group fixed bottom-6 right-6 z-40"
    >
      <span
        className="absolute inset-0 animate-ping rounded-full bg-coral-400 opacity-75"
        aria-hidden
      />
      <span className="relative flex items-center gap-2 rounded-full bg-coral-500 px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-coral-300/60 transition group-hover:bg-coral-600 group-active:scale-95">
        <span aria-hidden>✨</span>
        Reset My Wishlist
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1 text-xs">
          {wishlistItems.length}
        </span>
      </span>
    </button>
  );
}
