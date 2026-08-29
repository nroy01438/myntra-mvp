"use client";

import Link from "next/link";
import Card from "@/components/Card";
import { useWishlist } from "@/lib/WishlistContext";

export default function WishlistOverviewPage() {
  const { items } = useWishlist();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
            Your wishlist
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} items saved · Last reviewed: 3 months ago
          </p>
        </div>
        <Link
          href="/session"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600 sm:mt-0"
        >
          Begin Reset
          <span aria-hidden>→</span>
        </Link>
      </div>

      <p className="mt-3 max-w-2xl rounded-xl bg-coral-50 px-4 py-2.5 text-xs text-coral-700 sm:text-sm">
        Dozens of items, no signal on which ones you&apos;ll actually buy.
        That&apos;s the problem Wishlist Reset solves next.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
