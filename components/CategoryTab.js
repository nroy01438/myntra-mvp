"use client";

import { useWishlist } from "@/lib/WishlistContext";
import Card from "@/components/Card";

/**
 * A real category listing screen — reached by clicking a category tile on
 * Home or a category link in the nav (both go through the same
 * onCategoryClick handler in app/page.js). This is a genuine screen
 * transition, not an in-place filter on Home.
 */
export default function CategoryTab({ category, onBack }) {
  const { catalog, wishlistIds, heartTap, addToCart } = useWishlist();

  const items = catalog.filter((p) => category.categories.includes(p.category));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">
      <button
        onClick={onBack}
        className="text-xs font-semibold text-neutral-500 transition hover:text-coral-500"
      >
        ← Back to Home
      </button>
      <h1 className="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
        {category.label}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-400">
          No items in this category in our demo catalog yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((product) => (
            <Card
              key={product.id}
              product={product}
              inWishlist={wishlistIds.includes(product.id)}
              onToggleWishlist={heartTap}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
