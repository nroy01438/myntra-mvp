"use client";

import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/WishlistContext";
import SummaryScreen from "@/components/SummaryScreen";

export default function SummaryPage() {
  const router = useRouter();
  const { results, originalCount, resetSession } = useWishlist();

  const bought = results.filter((r) => r.action === "buy").length;
  const kept = results.filter((r) => r.action === "keep").length;
  const removed = results.filter((r) => r.action === "remove").length;

  function handleStartAnother() {
    resetSession();
    router.push("/wishlist");
  }

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-sm px-4 pt-24 text-center text-sm text-neutral-500">
        No session to summarize yet.{" "}
        <button
          onClick={() => router.push("/wishlist")}
          className="font-semibold text-coral-500 underline"
        >
          Start a reset
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <SummaryScreen
        originalCount={originalCount}
        bought={bought}
        kept={kept}
        removed={removed}
      />
      <div className="mx-auto mt-8 flex max-w-md justify-center gap-3 px-4">
        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
        >
          Done
        </button>
        <button
          onClick={handleStartAnother}
          className="rounded-full bg-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-coral-200 transition hover:bg-coral-600"
        >
          Start Another Session
        </button>
      </div>
    </div>
  );
}
