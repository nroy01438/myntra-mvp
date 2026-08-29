"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { logEvent } from "@/lib/analytics";
import Card from "@/components/Card";
import SwipeSession from "@/components/SwipeSession";
import SummaryScreen from "@/components/SummaryScreen";

/**
 * Everything the Wishlist tab can show, as in-place state — never a route
 * change. "grid" is the default (before) state; "Begin Reset" morphs the
 * same screen into the one-at-a-time session as an overlay bounded to the
 * content area (the app shell around it never moves); finishing the last
 * item morphs it again into the summary overlay. Verdict matrix, LLM
 * reasoning, and crowd-stats logic are untouched — only how the screens are
 * assembled changed.
 */
export default function WishlistTab() {
  const [phase, setPhase] = useState("grid"); // "grid" | "session" | "summary"
  const { items, setItems, results, recordResult, resetSession, originalCount } =
    useWishlist();

  function handleBeginReset() {
    setPhase("session");
  }

  function handleItemComplete(result) {
    logEvent(result);
    recordResult(result);
    const remaining = items.slice(1);
    setItems(remaining);
    if (remaining.length === 0) {
      setPhase("summary");
    }
  }

  function handleStartAnother() {
    resetSession();
    setPhase("grid");
  }

  if (phase === "session") {
    const currentIndex = originalCount - items.length;
    const currentItem = items[0];

    return (
      <div className="absolute inset-0 z-10 overflow-y-auto bg-neutral-50/98 backdrop-blur-sm">
        <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-6">
          <div className="mb-5 flex w-full items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-coral-500 transition-all"
                style={{ width: `${(currentIndex / originalCount) * 100}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-semibold text-neutral-500">
              {currentIndex + 1} of {originalCount}
            </span>
          </div>

          {currentItem ? (
            <SwipeSession
              key={currentItem.id}
              product={currentItem}
              onComplete={handleItemComplete}
            />
          ) : (
            <p className="pt-16 text-sm text-neutral-500">All done...</p>
          )}
        </div>
      </div>
    );
  }

  if (phase === "summary") {
    const bought = results.filter((r) => r.action === "buy").length;
    const kept = results.filter((r) => r.action === "keep").length;
    const removed = results.filter((r) => r.action === "remove").length;

    return (
      <div className="absolute inset-0 z-10 overflow-y-auto bg-neutral-50/98 backdrop-blur-sm">
        <SummaryScreen
          originalCount={originalCount}
          bought={bought}
          kept={kept}
          removed={removed}
        />
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-3 px-4 pb-10">
          <button
            onClick={() => setPhase("grid")}
            className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            Done
          </button>
          <button
            onClick={handleStartAnother}
            className="rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
          >
            Start Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
            Your wishlist
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} items saved · Last reviewed: 3 months ago
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleBeginReset}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600 sm:mt-0"
          >
            Begin Reset
            <span aria-hidden>→</span>
          </button>
        )}
      </div>

      <p className="mt-3 max-w-2xl rounded-xl bg-coral-50 px-4 py-2.5 text-xs text-coral-700 sm:text-sm">
        Dozens of items, no signal on which ones you&apos;ll actually buy.
        That&apos;s the problem Wishlist Reset solves next.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4">
        {items.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
