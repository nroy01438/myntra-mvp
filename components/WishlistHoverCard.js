"use client";

import { useWishlist } from "@/lib/WishlistContext";
import { HeartIcon } from "@/components/icons";

/**
 * The Wishlist nav icon. Clicking it navigates straight to the Wishlist
 * screen, just like Profile/Bag. Whenever there are items to reset (and
 * we're not already on the Wishlist screen), a small "Reset Now" pill
 * floats directly beneath the icon itself — anchored to Wishlist, not a
 * generic floating button sitting over the page content underneath.
 */
export default function WishlistHoverCard({ onNavigate, onQuickReset, showTrigger }) {
  const { wishlistItems } = useWishlist();

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="nav-wishlist"
        onClick={onNavigate}
        className="flex flex-col items-center gap-0.5 px-1 text-neutral-600 transition hover:text-coral-500"
      >
        <span className="relative">
          <HeartIcon className="h-5 w-5" />
          {wishlistItems.length > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-bold text-white">
              {wishlistItems.length}
            </span>
          )}
        </span>
        <span className="hidden text-[11px] font-medium sm:inline">Wishlist</span>
      </button>

      {showTrigger && wishlistItems.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickReset();
          }}
          className="group absolute right-0 top-full z-30 mt-2"
        >
          <span
            className="absolute inset-0 animate-ping rounded-full bg-coral-400 opacity-75"
            aria-hidden
          />
          <span className="relative block whitespace-nowrap rounded-full bg-coral-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition group-hover:bg-coral-600">
            ✨ Reset Now
          </span>
        </button>
      )}
    </div>
  );
}
