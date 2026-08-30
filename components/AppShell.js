"use client";

import { useWishlist } from "@/lib/WishlistContext";
import DisclaimerBadge from "@/components/DisclaimerBadge";
import TopNav from "@/components/TopNav";
import ReasonCaptureToast from "@/components/ReasonCaptureToast";

/**
 * The persistent app shell: disclaimer banner and top nav never unmount or
 * navigate away — only the content area beneath changes as app/page.js
 * switches views. Every nav item is a real navigation (see TopNav). The
 * reset trigger floats directly beneath the nav's Wishlist icon (see
 * WishlistHoverCard) — not a generic button floating over whatever screen
 * is showing — and is hidden on the Wishlist screen itself, where
 * "Begin Reset" is already on-screen.
 */
export default function AppShell({
  activeCategory,
  onCategoryClick,
  onLogoClick,
  onProfileClick,
  onCartClick,
  onWishlistClick,
  onQuickReset,
  currentView,
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
        showResetTrigger={currentView !== "wishlist"}
        cartCount={cartCount}
      />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
      <ReasonCaptureToast />
    </div>
  );
}
