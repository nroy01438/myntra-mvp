"use client";

import DisclaimerBadge from "@/components/DisclaimerBadge";
import TopBar from "@/components/TopBar";
import TabBar from "@/components/TabBar";

/**
 * The persistent app shell: disclaimer banner, top bar, and bottom tab bar
 * never unmount or navigate away — only the content area in between
 * changes. This is what makes the app feel like a real shopping app sitting
 * on its Wishlist screen, rather than a website with separate pages.
 */
export default function AppShell({ activeTab, onTabChange, children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <DisclaimerBadge />
      <TopBar />
      <div className="relative flex-1 overflow-y-auto">{children}</div>
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
