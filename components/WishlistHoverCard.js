"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { HeartIcon } from "@/components/icons";

/**
 * The Wishlist nav icon. Clicking it navigates straight to the Wishlist
 * screen (like Cart/Profile) — no drawer/dropdown in the way. Hovering it
 * (desktop only) additionally surfaces a small floating "Reset Now" pill
 * above the icon, a quick shortcut into the reset session without a full
 * preview drawer.
 */
export default function WishlistHoverCard({ onNavigate, onQuickReset }) {
  const { wishlistItems } = useWishlist();
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering && wishlistItems.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setHovering(false);
            onQuickReset();
          }}
          className="absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-full bg-coral-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-coral-600"
        >
          🧹 Reset Now
        </button>
      )}

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
    </div>
  );
}
