"use client";

import { createContext, useContext, useMemo, useState } from "react";
import productsData from "@/data/products.json";

/**
 * Client-side-only state for the whole app. There is no database and no
 * persistence layer (see README "known limitations" — v1 is fully stateless
 * and nothing survives a page reload).
 *
 * Model:
 * - `catalog` is the full static product list (all 18, with real
 *   LLM-derived crowdStats) — this is what Home browses.
 * - `wishlistIds` is which catalog items are currently saved to the
 *   wishlist. Starts fully seeded (the "18 cluttered items" the case study
 *   opens on) but is a normal toggleable set from here on — adding a
 *   product from Home just adds its id, and since every catalog product
 *   already carries real crowdStats, it runs through the exact same
 *   deterministic verdict matrix + LLM reasoning in a reset session.
 * - `cart` holds items actually bought (via "Buy Now" in a reset session,
 *   or "Add to Cart" from Home), each with a quantity.
 * - `results` is the lifetime log of processed reset-session items (one
 *   entry per item across every session), feeding the Profile tab's stats
 *   and `lib/analytics.js`.
 */

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const catalog = productsData;

  const [wishlistIds, setWishlistIds] = useState(() => catalog.map((p) => p.id));
  const [cart, setCart] = useState([]);
  const [results, setResults] = useState([]);
  const [autoResetRequested, setAutoResetRequested] = useState(false);
  const [gridRequested, setGridRequested] = useState(false);

  const wishlistItems = useMemo(
    () => catalog.filter((p) => wishlistIds.includes(p.id)),
    [catalog, wishlistIds]
  );

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
    }),
    [catalog, wishlistIds, wishlistItems, cart, results, autoResetRequested, gridRequested]
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
