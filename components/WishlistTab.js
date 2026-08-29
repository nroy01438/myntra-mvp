"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { logEvent } from "@/lib/analytics";
import Card from "@/components/Card";
import SwipeSession from "@/components/SwipeSession";
import SummaryScreen from "@/components/SummaryScreen";

/**
 * The wishlist screen — reached by clicking the nav's Wishlist icon, just
 * like Cart/Profile (app/page.js). "grid" is the default (before) state,
 * showing every saved item with the "Begin Reset" button; that morphs the
 * same screen in place into the one-at-a-time session; finishing the last
 * item morphs it again into the summary. `onClose` returns to Home — always
 * reachable (a close control appears on every phase, not just the grid),
 * so a session never traps the user with no way out.
 *
 * The session queue is local state, snapshotted from the live wishlist when
 * a reset begins — wishlist membership itself lives in context (so Home can
 * add/remove items too). "Buy Now" adds the item to cart and removes it
 * from the wishlist; "Remove" just removes it; "Keep" leaves it in the
 * wishlist for a future session. Verdict matrix, LLM reasoning, and
 * crowd-stats logic are untouched — only how the screens are assembled.
 */
export default function WishlistTab({ onClose }) {
  const [phase, setPhase] = useState("grid"); // "grid" | "session" | "summary"
  const [sessionQueue, setSessionQueue] = useState([]);
  const [sessionOriginal, setSessionOriginal] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);

  const {
    wishlistItems,
    wishlistIds,
    toggleWishlist,
    removeFromWishlist,
    addToCart,
    recordResult,
    autoResetRequested,
    clearAutoResetRequest,
  } = useWishlist();

  function handleBeginReset() {
    setSessionQueue(wishlistItems);
    setSessionOriginal(wishlistItems.length);
    setSessionResults([]);
    setPhase("session");
  }

  // The nav's "Reset Now" hover-card action requests an auto-start reset —
  // honor it as soon as we're mounted on the grid with something to process.
  useEffect(() => {
    if (autoResetRequested && phase === "grid" && wishlistItems.length > 0) {
      handleBeginReset();
      clearAutoResetRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResetRequested, phase]);

  function handleItemComplete(result) {
    logEvent(result);
    recordResult(result);
    setSessionResults((prev) => [...prev, result]);

    const product = sessionQueue[0];
    if (result.action === "buy") {
      addToCart(product);
      removeFromWishlist(product.id);
    } else if (result.action === "remove") {
      removeFromWishlist(product.id);
    }
    // "keep" leaves the product in the wishlist untouched.

    const remaining = sessionQueue.slice(1);
    setSessionQueue(remaining);
    if (remaining.length === 0) {
      setPhase("summary");
    }
  }

  return (
    <div className="relative">
      {phase === "session" ? (
        <SessionView
          sessionQueue={sessionQueue}
          sessionOriginal={sessionOriginal}
          onComplete={handleItemComplete}
          onClose={onClose}
        />
      ) : phase === "summary" ? (
        <SummaryView
          sessionOriginal={sessionOriginal}
          sessionResults={sessionResults}
          hasMoreToProcess={wishlistItems.length > 0}
          onDone={onClose}
          onStartAnother={() => (wishlistItems.length > 0 ? handleBeginReset() : setPhase("grid"))}
          onClose={onClose}
        />
      ) : (
        <GridView
          wishlistItems={wishlistItems}
          wishlistIds={wishlistIds}
          toggleWishlist={toggleWishlist}
          onBeginReset={handleBeginReset}
          onClose={onClose}
        />
      )}
    </div>
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Back to Home"
      className="shrink-0 rounded-full border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition hover:bg-neutral-50"
    >
      ✕
    </button>
  );
}

function GridView({ wishlistItems, wishlistIds, toggleWishlist, onBeginReset, onClose }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
            Your wishlist
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {wishlistItems.length} items saved · Last reviewed: 3 months ago
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      {wishlistItems.length > 0 && (
        <button
          onClick={onBeginReset}
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
        >
          ✨ Begin Reset
          <span aria-hidden>→</span>
        </button>
      )}

      {wishlistItems.length > 0 ? (
        <>
          <p className="mt-3 max-w-2xl rounded-xl bg-coral-50 px-4 py-2.5 text-xs text-coral-700 sm:text-sm">
            {wishlistItems.length} maybes, zero decisions. Let&apos;s turn every one
            into a yes, a no, or a not-yet — in under a minute.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4">
            {wishlistItems.map((product) => (
              <Card
                key={product.id}
                product={product}
                inWishlist={wishlistIds.includes(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-8 text-sm text-neutral-500">
          Your wishlist is empty. Heart something on Home to save it here.
        </p>
      )}
    </div>
  );
}

function SessionView({ sessionQueue, sessionOriginal, onComplete, onClose }) {
  const currentIndex = sessionOriginal - sessionQueue.length;
  const currentItem = sessionQueue[0];

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-6 md:max-w-2xl">
      <div className="mb-5 flex w-full items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-coral-500 transition-all"
            style={{ width: `${(currentIndex / sessionOriginal) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-semibold text-neutral-500">
          {currentIndex + 1} of {sessionOriginal}
        </span>
        <CloseButton onClose={onClose} />
      </div>

      {currentItem ? (
        <SwipeSession key={currentItem.id} product={currentItem} onComplete={onComplete} />
      ) : (
        <p className="pt-16 text-sm text-neutral-500">All done...</p>
      )}
    </div>
  );
}

function SummaryView({
  sessionOriginal,
  sessionResults,
  hasMoreToProcess,
  onDone,
  onStartAnother,
  onClose,
}) {
  const bought = sessionResults.filter((r) => r.action === "buy").length;
  const kept = sessionResults.filter((r) => r.action === "keep").length;
  const removed = sessionResults.filter((r) => r.action === "remove").length;

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <CloseButton onClose={onClose} />
      </div>
      <SummaryScreen
        originalCount={sessionOriginal}
        bought={bought}
        kept={kept}
        removed={removed}
      />
      <div className="mx-auto mt-8 flex max-w-md justify-center gap-3 px-4 pb-10">
        <button
          onClick={onDone}
          className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
        >
          Done
        </button>
        {hasMoreToProcess && (
          <button
            onClick={onStartAnother}
            className="rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
          >
            Keep Going
          </button>
        )}
      </div>
    </div>
  );
}
