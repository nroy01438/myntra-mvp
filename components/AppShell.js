"use client";

import { useWishlist } from "@/lib/WishlistContext";
import DisclaimerBadge from "@/components/DisclaimerBadge";
import TopNav from "@/components/TopNav";

/**
 * The persistent app shell: disclaimer banner and top nav never unmount or
 * navigate away — only the content area beneath changes as app/page.js
 * switches views. Every nav item is a real navigation (see TopNav).
 */
export default function AppShell({
  activeCategory,
  onCategoryClick,
  onLogoClick,
  onProfileClick,
  onCartClick,
  onWishlistClick,
  onQuickReset,
  children,
}) {
  const { cart } = useWishlist();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <DisclaimerBadge />
      <TopNav
        activeCategory={activeCategory}
        onCategoryClick={onCategoryClick}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onCartClick={onCartClick}
        onWishlistClick={onWishlistClick}
        onQuickReset={onQuickReset}
        cartCount={cartCount}
      />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
