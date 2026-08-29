"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getVerdict, REASONS, REASON_LABELS } from "@/lib/verdictMatrix";
import VerdictBadge from "@/components/VerdictBadge";

const REASON_ORDER = [
  REASONS.LOVE_IT,
  REASONS.FOR_EVENT,
  REASONS.JUST_BROWSING,
  REASONS.WAITING_FOR_DEAL,
];

const SWIPE_THRESHOLD = 120;

const FALLBACK_REASONING = {
  buy: "Other shoppers who saved this mostly went on to buy it — the numbers back you up.",
  keep: "No urgency here, but the data doesn't say to let it go either.",
  remove: "Most people who saved this for the same reason never bought it. Probably time to let it go.",
  disagreement:
    "You love this one, but most people who saved it didn't end up buying — reviews suggest fit might be the reason. Worth a second look before you commit.",
};

/**
 * One item, full-screen card. Two internal states:
 * 1. "choosing" — reason chips visible, no verdict yet.
 * 2. "revealed" — verdict shown, Buy/Keep/Remove buttons AND swipe gesture
 *    are both valid ways to act (left=remove, right=buy, up=keep).
 */
export default function SwipeSession({ product, onComplete }) {
  const [reason, setReason] = useState(null);
  const [verdictResult, setVerdictResult] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);

  async function handleReasonTap(selectedReason) {
    if (reason) return; // already chosen for this card
    setReason(selectedReason);

    const stockLevel = product.stockLevel;
    const verdict = getVerdict(selectedReason, { ...product.crowdStats, stockLevel });
    setVerdictResult(verdict);
    setIsLoadingReasoning(true);

    try {
      const res = await fetch("/api/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          reason: selectedReason,
          verdictCase: verdict.case,
          verdict: verdict.verdict,
          headline: verdict.headline,
        }),
      });
      if (!res.ok) throw new Error("reasoning request failed");
      const data = await res.json();
      setReasoning(data.reasoning || FALLBACK_REASONING[verdict.verdict]);
    } catch (err) {
      console.warn("Falling back to canned reasoning:", err.message);
      setReasoning(FALLBACK_REASONING[verdict.verdict]);
    } finally {
      setIsLoadingReasoning(false);
    }
  }

  function finish(action, interaction) {
    onComplete({
      productId: product.id,
      reason,
      verdict: verdictResult.verdict,
      action,
      interaction,
    });
  }

  function handleAction(action) {
    if (!verdictResult) return;
    setExitDirection(action === "buy" ? "right" : action === "remove" ? "left" : "up");
    setTimeout(() => finish(action, "button"), 150);
  }

  function handleDragEnd(_, info) {
    if (!verdictResult) return;
    const { offset } = info;
    if (offset.x > SWIPE_THRESHOLD) {
      setExitDirection("right");
      finish("buy", "swipe");
    } else if (offset.x < -SWIPE_THRESHOLD) {
      setExitDirection("left");
      finish("remove", "swipe");
    } else if (offset.y < -SWIPE_THRESHOLD) {
      setExitDirection("up");
      finish("keep", "swipe");
    }
  }

  const exitAnimation =
    exitDirection === "right"
      ? { x: 500, opacity: 0, rotate: 15 }
      : exitDirection === "left"
      ? { x: -500, opacity: 0, rotate: -15 }
      : exitDirection === "up"
      ? { y: -500, opacity: 0 }
      : {};

  const revealed = Boolean(verdictResult);

  return (
    <motion.div
      className="mx-auto w-full max-w-sm touch-none select-none"
      drag={revealed ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? exitAnimation : { x: 0, y: 0, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-xl">
        <div className="aspect-[4/5] w-full bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {product.brand}
            </p>
            <h2 className="text-lg font-extrabold text-neutral-900">{product.name}</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              ₹{product.price.toLocaleString("en-IN")} ·{" "}
              {product.sizes?.map((s) => s.size).join(", ")}
            </p>
          </div>

          {!revealed ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Why did you save this?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REASON_ORDER.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleReasonTap(r)}
                    className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2.5 text-sm font-semibold text-coral-700 transition hover:bg-coral-100 active:scale-95"
                  >
                    {REASON_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <VerdictBadge
                verdict={verdictResult.verdict}
                headline={verdictResult.headline}
                reasoning={reasoning}
                isLoading={isLoadingReasoning}
                reviewSnippets={
                  verdictResult.verdict === "disagreement"
                    ? (product.reviews || []).slice(0, 3)
                    : []
                }
              />

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleAction("remove")}
                  className="rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 active:scale-95"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleAction("keep")}
                  className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                >
                  Keep
                </button>
                <button
                  onClick={() => handleAction("buy")}
                  className="rounded-xl border border-emerald-200 bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
              <p className="text-center text-[11px] text-neutral-400">
                Or swipe: ← remove · ↑ keep · buy →
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
