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
  const { requestAutoReset } = useWishlist();
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
    requestAutoReset();
    goWishlist();
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
