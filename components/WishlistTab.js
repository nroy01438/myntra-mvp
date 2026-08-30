"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import { logEvent } from "@/lib/analytics";
import { REASON_LABELS } from "@/lib/verdictMatrix";
import Card from "@/components/Card";
import SwipeStack from "@/components/SwipeStack";
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
  const [lastCompleted, setLastCompleted] = useState(null); // { product, result, cameFromSummary }

  const {
    wishlistItems,
    wishlistIds,
    toggleWishlist,
    savedReasons,
    addToWishlist,
    removeFromWishlist,
    addToCart,
    removeFromCart,
    recordResult,
    autoResetRequested,
    clearAutoResetRequest,
    gridRequested,
    clearGridRequest,
    recordCartAdd,
    streakState,
  } = useWishlist();

  // In a real deployment, a reset session would be triggered contextually
  // (a sale starting on a saved item, an item going low-stock, the wishlist
  // crossing a size threshold) rather than opened manually via a button —
  // a known simplification for this MVP, where "Begin Reset" is the only
  // entry point.
  function handleBeginReset() {
    setSessionQueue(wishlistItems);
    setSessionOriginal(wishlistItems.length);
    setSessionResults([]);
    setLastCompleted(null);
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

  // Clicking the nav's Wishlist icon directly always means "show me the
  // wishlist" — force back to the grid even if a session/summary was
  // already in progress (this component doesn't remount when the icon is
  // clicked while already on the wishlist screen, so phase would otherwise
  // just sit wherever it was).
  useEffect(() => {
    if (gridRequested) {
      setPhase("grid");
      clearGridRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridRequested]);

  function handleItemComplete(result) {
    logEvent(result);
    recordResult(result);
    setSessionResults((prev) => [...prev, result]);

    const product = sessionQueue[0];
    if (result.action === "buy") {
      addToCart(product);
      removeFromWishlist(product.id);
      // The streak fires here — on the actual wishlist-to-cart conversion —
      // not on finishing the session, so a couple of useful swipes count
      // even if the rest of the list is abandoned unprocessed.
      recordCartAdd();
    } else if (result.action === "remove") {
      removeFromWishlist(product.id);
    }
    // "keep" leaves the product in the wishlist untouched.

    const remaining = sessionQueue.slice(1);
    setSessionQueue(remaining);
    if (remaining.length === 0) {
      setLastCompleted({ product, result, cameFromSummary: true });
      setPhase("summary");
    } else {
      setLastCompleted({ product, result, cameFromSummary: false });
    }
  }

  function handleUndo() {
    if (!lastCompleted) return;
    const { product, result, cameFromSummary } = lastCompleted;

    if (result.action === "buy") {
      removeFromCart(product.id);
      addToWishlist(product.id);
    } else if (result.action === "remove") {
      addToWishlist(product.id);
    }

    setSessionQueue((prev) => [product, ...prev]);
    setSessionResults((prev) => prev.slice(0, -1));
    setLastCompleted(null);
    if (cameFromSummary) setPhase("session");
  }

  return (
    <div className="relative">
      {phase === "session" ? (
        <SessionView
          sessionQueue={sessionQueue}
          sessionOriginal={sessionOriginal}
          savedReasons={savedReasons}
          onComplete={handleItemComplete}
          onClose={onClose}
          canUndo={Boolean(lastCompleted)}
          onUndo={handleUndo}
        />
      ) : phase === "summary" ? (
        <SummaryView
          sessionOriginal={sessionOriginal}
          sessionResults={sessionResults}
          streakState={streakState}
          hasMoreToProcess={wishlistItems.length > 0}
          onDone={onClose}
          onStartAnother={() => (wishlistItems.length > 0 ? handleBeginReset() : setPhase("grid"))}
          onClose={onClose}
          canUndo={Boolean(lastCompleted)}
          onUndo={handleUndo}
        />
      ) : (
        <GridView
          wishlistItems={wishlistItems}
          wishlistIds={wishlistIds}
          savedReasons={savedReasons}
          onUnheart={(product) => toggleWishlist(product.id)}
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

function UndoLink({ onUndo }) {
  return (
    <button
      type="button"
      onClick={onUndo}
      className="whitespace-nowrap text-xs font-semibold text-neutral-400 underline-offset-2 transition hover:text-coral-500 hover:underline"
    >
      ↩ Undo last
    </button>
  );
}

function milestoneMessage(currentIndex, total) {
  if (total < 4) return null;
  const pct = currentIndex / total;
  if (currentIndex === total - 1) return "Last one — almost there! 🙌";
  if (pct >= 0.5 && pct < 0.5 + 1 / total) return "Halfway there! 🎉";
  return null;
}

function GridView({ wishlistItems, wishlistIds, savedReasons, onUnheart, onBeginReset, onClose }) {
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

          <div className="mt-6 grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {wishlistItems.map((product) => (
              <Card
                key={product.id}
                product={product}
                inWishlist={wishlistIds.includes(product.id)}
                onToggleWishlist={onUnheart}
                reasonLabel={
                  savedReasons[product.id] ? REASON_LABELS[savedReasons[product.id]] : null
                }
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

function SessionView({
  sessionQueue,
  sessionOriginal,
  savedReasons,
  onComplete,
  onClose,
  canUndo,
  onUndo,
}) {
  const currentIndex = sessionOriginal - sessionQueue.length;
  const milestone = milestoneMessage(currentIndex, sessionOriginal);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-6 md:max-w-2xl">
      <div className="mb-2 flex w-full items-center gap-3">
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

      <div className="mb-3 flex h-4 w-full items-center justify-between">
        <span className="text-xs font-semibold text-coral-500">{milestone}</span>
        {canUndo && <UndoLink onUndo={onUndo} />}
      </div>

      {sessionQueue.length > 0 ? (
        <SwipeStack queue={sessionQueue} savedReasons={savedReasons} onCommit={onComplete} />
      ) : (
        <p className="pt-16 text-sm text-neutral-500">All done...</p>
      )}
    </div>
  );
}

function SummaryView({
  sessionOriginal,
  sessionResults,
  streakState,
  hasMoreToProcess,
  onDone,
  onStartAnother,
  onClose,
  canUndo,
  onUndo,
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
        streak={streakState}
      />
      <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 px-4 pb-10">
        <div className="flex justify-center gap-3">
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
        {canUndo && <UndoLink onUndo={onUndo} />}
      </div>
    </div>
  );
}
