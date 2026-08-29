"use client";

import { SearchIcon, ProfileIcon, CartIcon } from "@/components/icons";
import WishlistHoverCard from "@/components/WishlistHoverCard";
import { NAV_CATEGORIES } from "@/lib/categoryNav";

/**
 * Desktop-style top nav, matching a typical Indian fashion e-commerce
 * structure: wordmark, a row of category links, a search bar, and a
 * right-hand icon strip (Profile / Wishlist / Bag) — rather than a mobile
 * app's bottom tab bar. Every item here is a real navigation: the wordmark
 * returns to Home, category links go to that category's own listing
 * screen (the same handler Home's tiles use), Profile/Cart/Wishlist each
 * switch straight to their screen. Wishlist additionally shows a small
 * floating "Reset Now" pill on hover (see WishlistHoverCard) as a shortcut
 * into the reset session — not a preview drawer.
 */
export default function TopNav({
  activeCategory,
  onCategoryClick,
  onLogoClick,
  onProfileClick,
  onCartClick,
  onWishlistClick,
  onQuickReset,
  cartCount,
}) {
  return (
    <div className="shrink-0 border-b border-neutral-200 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <button
          type="button"
          onClick={onLogoClick}
          className="shrink-0 text-2xl font-black italic tracking-tight text-coral-500"
        >
          Myntra
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-400">
          <SearchIcon className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">Search for products, brands and more</span>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            data-testid="nav-profile"
            onClick={onProfileClick}
            className="flex flex-col items-center gap-0.5 px-1 text-neutral-600 transition hover:text-coral-500"
          >
            <ProfileIcon className="h-5 w-5" />
            <span className="hidden text-[11px] font-medium sm:inline">Profile</span>
          </button>

          <WishlistHoverCard onNavigate={onWishlistClick} onQuickReset={onQuickReset} />

          <button
            type="button"
            data-testid="nav-cart"
            onClick={onCartClick}
            className="relative flex flex-col items-center gap-0.5 px-1 text-neutral-600 transition hover:text-coral-500"
          >
            <span className="relative">
              <CartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden text-[11px] font-medium sm:inline">Bag</span>
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-5 overflow-x-auto px-4 pb-2.5 text-xs font-bold uppercase tracking-wide text-neutral-700 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {NAV_CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => onCategoryClick(cat)}
            className={`shrink-0 whitespace-nowrap transition hover:text-coral-500 ${
              activeCategory?.label === cat.label ? "text-coral-500" : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
