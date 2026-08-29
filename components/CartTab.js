"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import ProductThumb from "@/components/ProductThumb";

/**
 * Cart screen. Real state (items added via "Buy Now" in a reset session, or
 * "Add to Cart" from Home) but "Checkout" is a simulated confirmation only —
 * no real payment or order backend, documented in the README.
 */
export default function CartTab() {
  const { cart, removeFromCart, clearCart } = useWishlist();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function handleCheckout() {
    setOrderPlaced(true);
    clearCart();
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-20 text-center">
        <span className="text-4xl">🎉</span>
        <h1 className="mt-3 text-xl font-extrabold text-neutral-900">Order placed!</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This is a simulated checkout for the case study demo — no real payment
          or order was processed.
        </p>
        <button
          onClick={() => setOrderPlaced(false)}
          className="mt-6 rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-5xl pb-6 pt-4">
        <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-16 text-center">
          <span className="text-4xl">🛒</span>
          <h1 className="mt-3 text-xl font-extrabold text-neutral-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Items you buy from a wishlist reset session, or add directly from
            Home, will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-6 pt-4 sm:px-6">
      <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Cart</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {cart.length} item{cart.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-5 space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
          >
            <ProductThumb
              category={item.category}
              seed={item.id}
              size="sm"
              className="h-20 w-16 shrink-0 overflow-hidden rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {item.brand}
              </p>
              <h3 className="truncate text-sm font-medium text-neutral-800">{item.name}</h3>
              <p className="mt-1 text-sm font-bold text-neutral-900">
                ₹{item.price.toLocaleString("en-IN")}{" "}
                {item.qty > 1 && (
                  <span className="font-normal text-neutral-400">× {item.qty}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <span className="text-sm font-semibold text-neutral-600">Total</span>
        <span className="text-lg font-extrabold text-neutral-900">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-4 w-full rounded-full bg-coral-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
      >
        Checkout
      </button>
    </div>
  );
}
