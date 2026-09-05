"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import productsData from "@/data/products.json";
import { getGamificationState, recordAction as recordGamificationAction } from "@/lib/gamification";

/**
 * Client-side-only state for the whole app. There is no database and no
 * server-side persistence layer (see README "known limitations" — wishlist
 * membership, cart, and session results are still lost on refresh). The one
 * exception is `gamificationState` (lifetime points + rank), which persists
 * to localStorage — per-browser, not per-account, since there's no login.
 * It's a points total, not a calendar streak — see lib/gamification.js for
 * why a streak doesn't fit a wishlist tool. It accumulates on every action
 * resolved in a reset session (buy/remove/keep), not just on finishing the
 * whole session.
 *
 * Model:
 * - `catalog` is the full static product list (all 18, with real
 *   LLM-derived crowdStats) — this is what Home browses.
 * - `wishlistIds` is which catalog items are currently saved to the
 *   wishlist. Starts seeded with a handful of items (DEFAULT_WISHLIST_IDS
 *   below — enough to demo the "cluttered wishlist" premise without
 *   opening on the full catalog) but is a normal toggleable set from here
 *   on — adding a product from Home just adds its id, and since every
 *   catalog product already carries real crowdStats, it runs through the
 *   exact same deterministic verdict matrix + LLM reasoning in a reset
 *   session.
 * - `cart` holds items actually bought (via "Buy Now" in a reset session,
 *   or "Add to Cart" from Home), each with a quantity.
 * - `results` is the lifetime log of processed reset-session items (one
 *   entry per item across every session), feeding the Profile tab's stats
 *   and `lib/analytics.js`.
 */

const WishlistContext = createContext(null);

// A deliberately varied starter wishlist — two items from each of the 5
// catalog categories, reliably hitting every verdict type (buy/keep/remove/
// disagreement) depending on which reason you pick, rather than seeding
// with the entire 18-item catalog. Seeded at exactly the reset-prompt
// threshold (see WISHLIST_RESET_PROMPT_THRESHOLD below) so the contextual
// trigger demoes immediately on first load, instead of requiring several
// heart-taps first.
const DEFAULT_WISHLIST_IDS = [
  "p01", "p02", // dresses
  "p04", "p05", // shirts
  "p07", "p08", // jeans
  "p11", "p12", // ethnic_wear
  "p14", "p16", // footwear
];

// A real deployment would trigger a reset session contextually from several
// signals (a sale starting on a saved item, an item going low-stock, the
// wishlist crossing a size threshold — see the comment in WishlistTab.js).
// This is the one of those triggers actually implemented: crossing this
// many saved items surfaces a one-time "reset now?" prompt, on the honest
// theory that a wishlist this size is exactly when it stops being skimmable
// and starts being a junk drawer.
const WISHLIST_RESET_PROMPT_THRESHOLD = 10;

export function WishlistProvider({ children }) {
  const catalog = productsData;

  const [wishlistIds, setWishlistIds] = useState(() => [...DEFAULT_WISHLIST_IDS]);
  const [cart, setCart] = useState([]);
  const [results, setResults] = useState([]);
  const [autoResetRequested, setAutoResetRequested] = useState(false);
  const [gridRequested, setGridRequested] = useState(false);

  // Save-time intent capture: `savedReasons` maps productId -> reason|null.
  // A missing/null entry means the item was saved without picking a reason
  // (the toast was ignored or dismissed) — this is treated as a cold-start
  // item downstream, never guessed or backfilled.
  const [savedReasons, setSavedReasons] = useState({});
  const [pendingToastProduct, setPendingToastProduct] = useState(null);
  const toastTimerRef = useRef(null);

  // Gamification state starts at defaults (matching SSR, where localStorage
  // isn't available) and is filled in from localStorage right after mount,
  // rather than read during the useState initializer — avoids a hydration
  // mismatch between server- and client-rendered output.
  const [gamificationState, setGamificationState] = useState({
    totalPoints: 0,
    totalCartAdds: 0,
    totalActions: 0,
  });
  useEffect(() => {
    setGamificationState(getGamificationState());
  }, []);

  function recordGamificationEvent(action) {
    const next = recordGamificationAction(action);
    setGamificationState(next);
    return next;
  }

  const wishlistItems = useMemo(
    () => catalog.filter((p) => wishlistIds.includes(p.id)),
    [catalog, wishlistIds]
  );

  // Surfaces once per "crossing" — dismissing it (or resetting below the
  // threshold, e.g. via a session) re-arms it, so growing back up to the
  // threshold later prompts again rather than staying silenced forever.
  const [thresholdPromptDismissed, setThresholdPromptDismissed] = useState(false);
  useEffect(() => {
    if (wishlistItems.length < WISHLIST_RESET_PROMPT_THRESHOLD) {
      setThresholdPromptDismissed(false);
    }
  }, [wishlistItems.length]);
  const showThresholdPrompt =
    wishlistItems.length >= WISHLIST_RESET_PROMPT_THRESHOLD && !thresholdPromptDismissed;

  function dismissThresholdPrompt() {
    setThresholdPromptDismissed(true);
  }

  function addToWishlist(id) {
    setWishlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeFromWishlist(id) {
    setWishlistIds((prev) => prev.filter((x) => x !== id));
  }

  function toggleWishlist(id) {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  function recordResult(result) {
    setResults((prev) => [...prev, result]);
  }

  function requestAutoReset() {
    setAutoResetRequested(true);
  }

  function clearAutoResetRequest() {
    setAutoResetRequested(false);
  }

  // Set when the nav's Wishlist icon is clicked directly (as opposed to the
  // "Reset Now" trigger) — forces the wishlist screen back to its grid
  // view even if a session/summary was already in progress, so clicking
  // Wishlist always means "show me the wishlist," never "stay wherever you
  // were."
  // Tapping the heart on a product card. Un-hearting is instant, no toast.
  // Hearting adds the item AND surfaces the optional, non-blocking
  // "why did you save this?" toast — the reason is captured at save time
  // instead of being asked for later in a reset session, since people
  // forget why they saved something by the time they get around to it.
  function heartTap(product) {
    if (wishlistIds.includes(product.id)) {
      removeFromWishlist(product.id);
      return;
    }
    addToWishlist(product.id);
    triggerReasonToast(product);
  }

  function triggerReasonToast(product) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setPendingToastProduct(product);
    toastTimerRef.current = setTimeout(() => {
      setPendingToastProduct(null);
      toastTimerRef.current = null;
    }, 4000);
  }

  function chooseReason(productId, reason) {
    setSavedReasons((prev) => ({ ...prev, [productId]: reason }));
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setPendingToastProduct(null);
  }

  function dismissToast() {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setPendingToastProduct(null);
  }

  function requestGrid() {
    setGridRequested(true);
  }

  function clearGridRequest() {
    setGridRequested(false);
  }

  const value = useMemo(
    () => ({
      catalog,
      wishlistIds,
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      heartTap,
      savedReasons,
      pendingToastProduct,
      chooseReason,
      dismissToast,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      results,
      recordResult,
      autoResetRequested,
      requestAutoReset,
      clearAutoResetRequest,
      gridRequested,
      requestGrid,
      clearGridRequest,
      gamificationState,
      recordGamificationEvent,
      showThresholdPrompt,
      dismissThresholdPrompt,
    }),
    [
      catalog,
      gamificationState,
      showThresholdPrompt,
      wishlistIds,
      wishlistItems,
      savedReasons,
      pendingToastProduct,
      cart,
      results,
      autoResetRequested,
      gridRequested,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
