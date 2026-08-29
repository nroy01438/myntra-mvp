"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import WishlistTab from "@/components/WishlistTab";
import PlaceholderTab from "@/components/PlaceholderTab";

export default function AppRoot() {
  const [activeTab, setActiveTab] = useState("wishlist");

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "wishlist" && <WishlistTab />}
      {activeTab === "home" && <PlaceholderTab label="Home" />}
      {activeTab === "cart" && <PlaceholderTab label="Cart" />}
      {activeTab === "profile" && <PlaceholderTab label="Profile" />}
    </AppShell>
  );
}
