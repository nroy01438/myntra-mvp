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
 * The landing screen: a hero banner and category tile grid, styled after a
 * typical Indian fashion e-commerce homepage (original art/copy — no real
 * brand promo codes or photography), followed by the catalog grid.
 * Heart-toggling a product here adds/removes it from the wishlist — since
 * every catalog product already carries real LLM-derived crowdStats,
 * anything added here runs through the exact same deterministic verdict
 * matrix and LLM reasoning in a reset session as the original 18 did.
 */
export default function HomeTab({ activeCategory, onCategoryClick }) {
  const { catalog, wishlistIds, toggleWishlist, addToCart } = useWishlist();

  const filtered =
    activeCategory && activeCategory.categories.length > 0
      ? catalog.filter((p) => activeCategory.categories.includes(p.category))
      : activeCategory
      ? []
      : catalog;

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            {activeCategory ? activeCategory.label : "Just for you"}
          </h2>
          {activeCategory && (
            <button
              onClick={() => onCategoryClick(null)}
              className="text-xs font-semibold text-coral-500"
            >
              Clear filter
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Heart something to save it to your wishlist, or add it to cart directly.
        </p>

        {filtered.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-400">
            No items in this category in our demo catalog yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((product) => (
              <Card
                key={product.id}
                product={product}
                inWishlist={wishlistIds.includes(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
