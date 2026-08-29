"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/WishlistContext";
import SwipeSession from "@/components/SwipeSession";
import { logEvent } from "@/lib/analytics";

export default function SessionPage() {
  const router = useRouter();
  const { items, setItems, results, recordResult, originalCount } = useWishlist();

  const currentIndex = originalCount - items.length;
  const currentItem = items[0];

  function handleComplete(result) {
    logEvent(result);
    recordResult(result);
    const remaining = items.slice(1);
    setItems(remaining);
    if (remaining.length === 0) {
      router.push("/summary");
    }
  }

  if (!currentItem) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-24 text-center text-sm text-neutral-500">
        All done — heading to your summary...
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 pb-8 pt-6">
      <div className="mb-5 flex w-full items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-coral-500 transition-all"
            style={{ width: `${(currentIndex / originalCount) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-semibold text-neutral-500">
          {currentIndex + 1} of {originalCount}
        </span>
      </div>

      <SwipeSession
        key={currentItem.id}
        product={currentItem}
        onComplete={handleComplete}
      />
    </div>
  );
}
