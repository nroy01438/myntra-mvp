"use client";

import { useWishlist } from "@/lib/WishlistContext";
import { HomeIcon, HeartIcon, CartIcon, ProfileIcon } from "@/components/icons";

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "wishlist", label: "Wishlist", Icon: HeartIcon },
  { id: "cart", label: "Cart", Icon: CartIcon },
  { id: "profile", label: "Profile", Icon: ProfileIcon },
];

/**
 * Persistent bottom tab bar. All four tabs are real and clickable; Home,
 * Cart and Profile all have working (if simple) screens behind them, but
 * only Wishlist runs the case study's core logic.
 */
export default function TabBar({ activeTab, onTabChange }) {
  const { cart } = useWishlist();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            data-testid={`tab-${id}`}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive ? "text-coral-500" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="relative">
              <Icon className="h-5 w-5" fill={isActive && id === "wishlist" ? "currentColor" : "none"} />
              {id === "cart" && cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
