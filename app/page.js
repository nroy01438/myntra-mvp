"use client";

import { useState } from "react";
import { useWishlist } from "@/lib/WishlistContext";
import AppShell from "@/components/AppShell";
import HomeTab from "@/components/HomeTab";
import CartTab from "@/components/CartTab";
import ProfileTab from "@/components/ProfileTab";
import WishlistTab from "@/components/WishlistTab";

export default function AppRoot() {
  const { requestAutoReset } = useWishlist();
  const [view, setView] = useState("home"); // "home" | "profile" | "cart" — the landing screen
  const [activeCategory, setActiveCategory] = useState(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  function handleCategoryClick(category) {
    setView("home");
    setActiveCategory((prev) => (prev?.label === category?.label ? null : category));
  }

  function handleOpenWishlist() {
    setWishlistOpen(true);
  }

  function handleOpenReset() {
    requestAutoReset();
    setWishlistOpen(true);
  }

  return (
    <AppShell
      activeCategory={activeCategory}
      onCategoryClick={handleCategoryClick}
      onProfileClick={() => setView("profile")}
      onCartClick={() => setView("cart")}
      onOpenWishlist={handleOpenWishlist}
      onOpenReset={handleOpenReset}
    >
      {view === "home" && (
        <HomeTab activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
      )}
      {view === "profile" && <ProfileTab onOpenReset={handleOpenReset} />}
      {view === "cart" && <CartTab onOpenReset={handleOpenReset} />}

      {wishlistOpen && <WishlistTab onClose={() => setWishlistOpen(false)} />}
    </AppShell>
  );
}
