"use client";

import { HomeIcon, HeartIcon, CartIcon, ProfileIcon } from "@/components/icons";

const TABS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "wishlist", label: "Wishlist", Icon: HeartIcon },
  { id: "cart", label: "Cart", Icon: CartIcon },
  { id: "profile", label: "Profile", Icon: ProfileIcon },
];

/**
 * Persistent bottom tab bar. Only "wishlist" is functional; the others are
 * still real, clickable tabs (they switch to a lightweight placeholder
 * view) so the shell reads as a genuine app rather than a dead mockup.
 */
export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive ? "text-coral-500" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <Icon className="h-5 w-5" fill={isActive && id === "wishlist" ? "currentColor" : "none"} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
