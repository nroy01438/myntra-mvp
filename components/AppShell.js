"use client";

import { useWishlist } from "@/lib/WishlistContext";
import DisclaimerBadge from "@/components/DisclaimerBadge";
import TopNav from "@/components/TopNav";

/**
 * The persistent app shell: disclaimer banner and top nav never unmount or
 * navigate away — only the content area beneath changes. Wishlist has no
 * standing tab of its own; it's a hover-triggered overlay (see
 * WishlistHoverCard + the wishlistOpen state in app/page.js) that renders
 * on top of whatever view (Home/Profile/Cart) is currently showing.
 */
export default function AppShell({
  activeCategory,
  onCategoryClick,
  onProfileClick,
  onCartClick,
  onOpenWishlist,
  onOpenReset,
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
        onProfileClick={onProfileClick}
        onCartClick={onCartClick}
        onOpenWishlist={onOpenWishlist}
        onOpenReset={onOpenReset}
        cartCount={cartCount}
      />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
