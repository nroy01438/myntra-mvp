"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { HeartIcon } from "@/components/icons";
import ProductThumb from "@/components/ProductThumb";

/**
 * The Wishlist nav icon is a hover trigger (click also toggles it, so it
 * still works on touch devices) — not a standing tab. Hovering shows a
 * quick-preview dropdown; from there, "View Wishlist" or "Reset Now" opens
 * the full wishlist overlay (grid/session/summary), unchanged underneath.
 */
export default function WishlistHoverCard({ onOpenWishlist, onOpenReset }) {
  const { wishlistItems } = useWishlist();
  const [open, setOpen] = useState(false);
  const preview = wishlistItems.slice(0, 3);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        data-testid="nav-wishlist"
        onClick={() => setOpen((o) => !o)}
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

      {open && (
        <div className="absolute right-0 top-full z-30 w-72 max-w-[90vw] rounded-2xl border border-neutral-100 bg-white p-3 shadow-xl">
          {wishlistItems.length === 0 ? (
            <p className="px-1 py-2 text-sm text-neutral-500">
              Your wishlist is empty. Heart something on Home to save it here.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {preview.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <ProductThumb
                      category={item.category}
                      size="sm"
                      className="h-10 w-8 shrink-0 overflow-hidden rounded"
                    />
                    <span className="truncate text-xs font-medium text-neutral-700">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
              {wishlistItems.length > preview.length && (
                <p className="mt-2 px-1 text-xs text-neutral-400">
                  +{wishlistItems.length - preview.length} more
                </p>
              )}
              <div className="mt-3 space-y-1.5">
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenReset();
                  }}
                  className="w-full rounded-full bg-coral-500 py-2 text-xs font-semibold text-white transition hover:bg-coral-600"
                >
                  Reset Now →
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenWishlist();
                  }}
                  className="w-full rounded-full border border-neutral-200 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  View Wishlist
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
