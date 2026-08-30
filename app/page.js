"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import AppShell from "@/components/AppShell";
import HomeTab from "@/components/HomeTab";
import CategoryTab from "@/components/CategoryTab";
import CartTab from "@/components/CartTab";
import ProfileTab from "@/components/ProfileTab";
import WishlistTab from "@/components/WishlistTab";

export default function AppRoot() {
  const { requestAutoReset, requestGrid } = useWishlist();
  // "home" | "category" | "wishlist" | "cart" | "profile"
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);

  function goHome() {
    setView("home");
    setActiveCategory(null);
  }

  function goCategory(category) {
    setActiveCategory(category);
    setView("category");
  }

  function goWishlist() {
    setActiveCategory(null);
    setView("wishlist");
    // Clicking the icon always means "show me the wishlist" — force the
    // grid view even if a session/summary was already in progress there.
    requestGrid();
  }

  function goCart() {
    setActiveCategory(null);
    setView("cart");
  }

  function goProfile() {
    setActiveCategory(null);
    setView("profile");
  }

  function goQuickReset() {
    // Deliberately not goWishlist() — that forces the grid, but this wants
    // the session to start directly regardless of current phase.
    requestAutoReset();
    setActiveCategory(null);
    setView("wishlist");
  }

  return (
    <AppShell
      activeCategory={activeCategory}
      onCategoryClick={goCategory}
      onLogoClick={goHome}
      onProfileClick={goProfile}
      onCartClick={goCart}
      onWishlistClick={goWishlist}
      onQuickReset={goQuickReset}
      currentView={view}
    >
      {view === "home" && <HomeTab onCategoryClick={goCategory} />}
      {view === "category" && <CategoryTab category={activeCategory} onBack={goHome} />}
      {view === "wishlist" && <WishlistTab onClose={goHome} />}
      {view === "cart" && <CartTab />}
      {view === "profile" && <ProfileTab />}
    </AppShell>
  );
}
