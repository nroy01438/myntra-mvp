"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import WishlistTab from "@/components/WishlistTab";
import HomeTab from "@/components/HomeTab";
import CartTab from "@/components/CartTab";
import ProfileTab from "@/components/ProfileTab";

export default function AppRoot() {
  const [activeTab, setActiveTab] = useState("wishlist");

  function goToWishlist() {
    setActiveTab("wishlist");
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "wishlist" && <WishlistTab />}
      {activeTab === "home" && <HomeTab onNavigateToWishlist={goToWishlist} />}
      {activeTab === "cart" && <CartTab onNavigateToWishlist={goToWishlist} />}
      {activeTab === "profile" && <ProfileTab onNavigateToWishlist={goToWishlist} />}
    </AppShell>
  );
}
