"use client";

import { useWishlist } from "@/lib/WishlistContext";
import Card from "@/components/Card";
import ResetNudgeBanner from "@/components/ResetNudgeBanner";

/**
 * Browse/discover screen. Heart-toggling a product here adds/removes it
 * from the wishlist — since every catalog product already carries real
 * LLM-derived crowdStats, anything added here runs through the exact same
 * deterministic verdict matrix and LLM reasoning in a reset session as the
 * original 18 did.
 */
export default function HomeTab({ onNavigateToWishlist }) {
  const { catalog, wishlistIds, toggleWishlist, addToCart } = useWishlist();

  return (
    <div className="mx-auto max-w-5xl pb-6 pt-4">
      <ResetNudgeBanner onNavigateToWishlist={onNavigateToWishlist} />

      <div className="px-4 sm:px-6">
        <h1 className="mt-4 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
          Just for you
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Heart something to save it to your wishlist, or add it to cart directly.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {catalog.map((product) => (
            <Card
              key={product.id}
              product={product}
              inWishlist={wishlistIds.includes(product.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
