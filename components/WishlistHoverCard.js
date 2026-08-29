"use client";

import { useWishlist } from "@/lib/WishlistContext";
import { HeartIcon } from "@/components/icons";

/**
 * The Wishlist nav icon — clicking it navigates straight to the Wishlist
 * screen, just like Profile/Bag. The reset shortcut itself now lives in
 * the always-visible floating button (components/ResetFAB.js), not here.
 */
export default function WishlistHoverCard({ onNavigate }) {
  const { wishlistItems } = useWishlist();

  return (
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
  );
}
