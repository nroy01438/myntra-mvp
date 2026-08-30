"use client";

import { HeartIcon, CartIcon } from "@/components/icons";
import ProductThumb from "@/components/ProductThumb";

/**
 * Product card used on both the Home (browse) and Wishlist (grid) screens.
 * `onToggleWishlist`/`inWishlist` and `onAddToCart` are optional — pass
 * only what that screen needs. `reasonLabel` is Wishlist-grid-only: the
 * save-time reason captured for this item (if any), shown as a small pill
 * so the reason is visible at a glance, not just inside the reset session.
 */
export default function Card({
  product,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
  reasonLabel,
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-neutral-100">
        <ProductThumb category={product.category} size="md" className="h-full w-full" />
        {reasonLabel !== undefined && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur ${
              reasonLabel
                ? "bg-white/90 text-neutral-600"
                : "bg-white/70 text-neutral-400"
            }`}
          >
            {reasonLabel ? reasonLabel : "No reason saved"}
          </span>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition active:scale-90"
          >
            <HeartIcon
              className={`h-4 w-4 ${inWishlist ? "text-coral-500" : "text-neutral-400"}`}
              fill={inWishlist ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-neutral-800">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-bold text-neutral-900">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <div className="flex-1" />

        {onAddToCart && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-coral-200 bg-coral-50 py-1.5 text-xs font-semibold text-coral-600 transition hover:bg-coral-100 active:scale-95"
          >
            <CartIcon className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
