"use client";

import { useWishlist } from "@/lib/WishlistContext";

/**
 * The one contextual reset trigger actually implemented (see the comment
 * next to WISHLIST_RESET_PROMPT_THRESHOLD in WishlistContext.js) — a real
 * deployment would have several (a sale starting, low stock, this size
 * threshold); this is the size-threshold one. Mounted once in AppShell so
 * it can surface over any screen, matching ReasonCaptureToast's pattern.
 */
export default function ThresholdPromptModal({ onReset }) {
  const { showThresholdPrompt, dismissThresholdPrompt } = useWishlist();

  if (!showThresholdPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 pb-6 text-center shadow-2xl">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "linear-gradient(135deg, #ff3f6c, #ff8a9e)" }}
        >
          🔔
        </div>
        <span className="mb-3 inline-block rounded-full bg-coral-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-coral-600">
          Wishlist just hit 10 items
        </span>
        <h2 className="text-xl font-extrabold leading-tight text-neutral-900">
          That&apos;s a lot of maybes piling up
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Let&apos;s turn them into decisions — buy, remove, or keep — in under a minute.
        </p>

        <button
          type="button"
          onClick={() => {
            dismissThresholdPrompt();
            onReset();
          }}
          className="mt-5 w-full rounded-full bg-coral-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-coral-200 transition hover:bg-coral-600 active:scale-95"
        >
          ✨ Reset Now
        </button>
        <button
          type="button"
          onClick={dismissThresholdPrompt}
          className="mt-2 w-full py-1.5 text-[13px] font-semibold text-neutral-400 transition hover:text-neutral-600"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
