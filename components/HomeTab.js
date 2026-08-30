"use client";

import { useWishlist } from "@/lib/WishlistContext";
import Card from "@/components/Card";
import ProductThumb from "@/components/ProductThumb";
import HeroBanner from "@/components/HeroBanner";

const CATEGORY_TILES = [
  { key: "dresses", label: "Dresses", off: "40-70% OFF" },
  { key: "ethnic_wear", label: "Ethnic Wear", off: "UP TO 60% OFF" },
  { key: "shirts", label: "Shirts", off: "30-70% OFF" },
  { key: "jeans", label: "Jeans", off: "UP TO 50% OFF" },
  { key: "footwear", label: "Footwear", off: "UP TO 60% OFF" },
];

/**
 * The landing screen: a hero banner, category tile grid, and the full
 * catalog. Clicking a category tile is a real navigation to that
 * category's own listing screen (components/CategoryTab.js) — the same
 * handler the top nav's category links use — not an in-place filter here.
 * Heart-toggling a product adds/removes it from the wishlist — since every
 * catalog product already carries real LLM-derived crowdStats, anything
 * added here runs through the exact same deterministic verdict matrix and
 * LLM reasoning in a reset session as the original 18 did.
 */
export default function HomeTab({ onCategoryClick }) {
  const { catalog, wishlistIds, heartTap, addToCart } = useWishlist();

  return (
    <div className="mx-auto max-w-6xl pb-10 pt-4">
      <HeroBanner />

      <div className="mt-6 px-4 sm:px-6">
        <h2 className="text-lg font-bold text-neutral-900">Shop by category</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORY_TILES.map((tile) => (
            <button
              key={tile.key}
              onClick={() =>
                onCategoryClick({ label: tile.label, categories: [tile.key] })
              }
              className="overflow-hidden rounded-xl border border-neutral-100 bg-white text-left shadow-sm transition hover:shadow-md"
            >
              <ProductThumb category={tile.key} size="lg" className="aspect-square w-full" />
              <div className="p-2.5">
                <p className="text-sm font-bold text-neutral-800">{tile.label}</p>
                <p className="text-xs font-semibold text-coral-500">{tile.off}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6">
        <h2 className="text-lg font-bold text-neutral-900">Just for you</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Heart something to save it to your wishlist, or add it to cart directly.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {catalog.map((product) => (
            <Card
              key={product.id}
              product={product}
              inWishlist={wishlistIds.includes(product.id)}
              onToggleWishlist={heartTap}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
