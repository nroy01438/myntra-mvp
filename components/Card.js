/**
 * Static wishlist grid card — Screen 1 (before state). Deliberately shows no
 * verdict yet; the point of this screen is to visually prove the clutter
 * problem before the reset tool solves it.
 */
export default function Card({ product }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {product.brand}
        </p>
        <h3 className="mt-0.5 truncate text-sm font-medium text-neutral-800">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-bold text-neutral-900">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
