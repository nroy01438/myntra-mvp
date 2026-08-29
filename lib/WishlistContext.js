"use client";

import { createContext, useContext, useMemo, useState } from "react";
import productsData from "@/data/products.json";

/**
 * Client-side-only session state for the whole Wishlist Reset flow.
 *
 * There is no database and no persistence layer (see README "known
 * limitations" — v1 is fully stateless and nothing survives a page reload).
 * This context is the single source of truth for the current in-browser
 * session: the working wishlist, and the running tally of reasons/verdicts/
 * actions as the user processes each item.
 */

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const originalCount = productsData.length;

  // The working copy of the wishlist for this session. Items are removed
  // from view as the user acts on them during the swipe session.
  const [items, setItems] = useState(productsData);

  // One entry per processed item: { productId, reason, verdict, action, interaction }
  const [results, setResults] = useState([]);

  function recordResult(result) {
    setResults((prev) => [...prev, result]);
  }

  function resetSession() {
    setItems(productsData);
    setResults([]);
  }

  const value = useMemo(
    () => ({
      originalCount,
      items,
      setItems,
      results,
      recordResult,
      resetSession,
    }),
    [originalCount, items, results]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
