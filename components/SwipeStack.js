"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { getVerdict, REASONS, REASON_LABELS } from "@/lib/verdictMatrix";
import ProductThumb from "@/components/ProductThumb";

const DRAG_COMMIT_DISTANCE = 120;
const VELOCITY_COMMIT = 500;
const VERTICAL_COMMIT_DISTANCE = 100;

const VERDICT_THEME = {
  buy: {
    label: "Worth buying",
    border: "border-emerald-300",
    glow: "shadow-emerald-200/70",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  keep: {
    label: "Your call",
    border: "border-amber-300",
    glow: "shadow-amber-200/70",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  remove: {
    label: "Probably drop",
    border: "border-rose-300",
    glow: "shadow-rose-200/70",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  disagreement: {
    label: "Your call",
    border: "border-amber-300",
    glow: "shadow-amber-200/70",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
};

const FALLBACK_REASONING = {
  buy: "Other shoppers who saved this mostly went on to buy it — the numbers back you up.",
  keep: "No urgency here, but the data doesn't say to let it go either.",
  remove: "Most people who saved this for the same reason never bought it. Probably time to let it go.",
  disagreement:
    "You love this one, but most people who saved it didn't end up buying — reviews suggest fit might be the reason. Worth a second look before you commit.",
};

function crowdSignalLine(product) {
  const { buyThroughRate, churnRate, priceDropFrequency } = product.crowdStats;
  if (buyThroughRate > 60) return `${buyThroughRate}% of shoppers who saved this went on to buy it`;
  if (churnRate > 60) return `${churnRate}% of shoppers who saved this let it go`;
  if (priceDropFrequency === "frequent") return "Price drops often on this one — no rush";
  return "Steady interest from other shoppers, nothing urgent";
}

// Cold-start items — saved without picking a reason at save time — skip the
// reason layer entirely rather than guessing or backfilling one. Mapped
// onto the matrix's "just browsing" branch, since that's the one branch
// that already depends only on churnRate (a pure crowd signal, no reason
// input needed) — see lib/verdictMatrix.js.
function computeVerdict(product, reason) {
  const effectiveReason = reason || REASONS.JUST_BROWSING;
  return getVerdict(effectiveReason, { ...product.crowdStats, stockLevel: product.stockLevel });
}

/**
 * Pure Tinder-style swipe stack for the reset session. Every card's verdict,
 * crowd-signal line, and reason chip are 100% pre-computed before the card
 * is ever shown — there is no in-session decision step, only a reflexive
 * swipe (or a button that plays the identical fly-off animation).
 *
 * `queue[0]` is the interactive top card; `queue[1]`/`queue[2]` peek behind
 * it to show stack depth. `onCommit(action)` fires once the top card's exit
 * animation finishes — the parent then advances its own queue, which
 * naturally mounts a fresh top-card instance (triggering its entry bounce).
 */
export default function SwipeStack({ queue, savedReasons, onCommit }) {
  const top = queue[0];
  const peek1 = queue[1];
  const peek2 = queue[2];

  if (!top) return null;

  return (
    <div className="relative mx-auto h-[30rem] w-full max-w-sm md:h-[26rem] md:max-w-xl">
      {peek2 && <PeekCard product={peek2} depth={2} />}
      {peek1 && <PeekCard product={peek1} depth={1} />}
      <TopCard
        key={top.id}
        product={top}
        reason={savedReasons[top.id] || null}
        onCommit={onCommit}
      />
    </div>
  );
}

function PeekCard({ product, depth }) {
  const scale = depth === 1 ? 0.95 : 0.9;
  const translateY = depth * 10;
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-md"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        zIndex: 10 - depth,
        opacity: 1 - depth * 0.15,
      }}
      aria-hidden
    >
      <ProductThumb category={product.category} size="lg" className="h-full w-full" />
    </div>
  );
}

function TopCard({ product, reason, onCommit }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const controls = useAnimation();
  const draggedRef = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);

  const verdict = computeVerdict(product, reason);
  const theme = VERDICT_THEME[verdict.verdict] ?? VERDICT_THEME.keep;

  const rightStampOpacity = useTransform(x, [20, 140], [0, 1]);
  const leftStampOpacity = useTransform(x, [-140, -20], [1, 0]);
  const downStampOpacity = useTransform(y, [20, 110], [0, 1]);
  const greenTint = useTransform(x, [20, 200], [0, 0.18]);
  const redTint = useTransform(x, [-200, -20], [0.18, 0]);
  const amberTint = useTransform(y, [20, 200], [0, 0.18]);

  // Reasoning is fetched proactively as soon as this card becomes the top
  // of the stack, decoupled from the glanceable overlay (which stays fully
  // synchronous) — it only ever surfaces inside the optional expand panel.
  useEffect(() => {
    let cancelled = false;
    setReasoning("");
    setIsLoadingReasoning(true);

    fetch("/api/reasoning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product,
        reason: reason || REASONS.JUST_BROWSING,
        verdictCase: verdict.case,
        verdict: verdict.verdict,
        headline: verdict.headline,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("reasoning request failed"))))
      .then((data) => {
        if (!cancelled) setReasoning(data.reasoning || FALLBACK_REASONING[verdict.verdict]);
      })
      .catch(() => {
        if (!cancelled) setReasoning(FALLBACK_REASONING[verdict.verdict]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingReasoning(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  function finish(action) {
    onCommit({
      productId: product.id,
      reason,
      verdict: verdict.verdict,
      action,
      interaction: draggedRef.current ? "swipe" : "button",
    });
  }

  function commit(action) {
    const target =
      action === "buy"
        ? { x: 640, y: -30, rotate: 22, opacity: 0 }
        : action === "remove"
        ? { x: -640, y: -30, rotate: -22, opacity: 0 }
        : { x: 0, y: 520, rotate: 0, opacity: 0 };
    controls
      .start({ ...target, transition: { duration: 0.35, ease: "easeIn" } })
      .then(() => finish(action));
  }

  function handleDragStart() {
    draggedRef.current = false;
  }

  function handleDrag(_, info) {
    if (Math.abs(info.offset.x) > 6 || Math.abs(info.offset.y) > 6) {
      draggedRef.current = true;
    }
  }

  function handleDragEnd(_, info) {
    const { offset, velocity } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    const horizontalCommit =
      absX >= absY && (absX > DRAG_COMMIT_DISTANCE || Math.abs(velocity.x) > VELOCITY_COMMIT);
    const verticalCommit =
      absY > absX &&
      offset.y > 0 &&
      (offset.y > VERTICAL_COMMIT_DISTANCE || velocity.y > VELOCITY_COMMIT);

    if (horizontalCommit) {
      commit(offset.x > 0 ? "buy" : "remove");
    } else if (verticalCommit) {
      commit("keep");
    } else {
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 200, damping: 15 },
      });
    }
  }

  function handleClick() {
    if (draggedRef.current) return;
    setExpanded((prev) => !prev);
  }

  const reasonLabel = reason ? REASON_LABELS[reason] : null;

  return (
    <motion.div
      className={`absolute inset-0 z-20 touch-none select-none overflow-hidden rounded-3xl border-2 bg-white shadow-xl ${theme.border} ${theme.glow}`}
      style={{ x, y, rotate }}
      drag
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      animate={controls}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
    >
      {/* Live directional decision stamps — gesture-colored (universal
          green=right/red=left/amber=down), separate from the verdict-colored
          border above so their meaning never shifts with the item's verdict. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundColor: "rgb(16,185,129)", opacity: greenTint }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundColor: "rgb(244,63,94)", opacity: redTint }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundColor: "rgb(245,158,11)", opacity: amberTint }}
      />

      <motion.span
        style={{ opacity: rightStampOpacity }}
        className="pointer-events-none absolute right-4 top-4 z-20 rotate-12 rounded-full border-4 border-emerald-500 px-3 py-1 text-sm font-black uppercase tracking-wide text-emerald-500"
      >
        Add to Cart
      </motion.span>
      <motion.span
        style={{ opacity: leftStampOpacity }}
        className="pointer-events-none absolute left-4 top-4 z-20 -rotate-12 rounded-full border-4 border-rose-500 px-3 py-1 text-sm font-black uppercase tracking-wide text-rose-500"
      >
        Remove
      </motion.span>
      <motion.span
        style={{ opacity: downStampOpacity }}
        className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border-4 border-amber-500 px-3 py-1 text-sm font-black uppercase tracking-wide text-amber-500"
      >
        Later
      </motion.span>

      <div className="flex h-full flex-col">
        <motion.div
          className="relative h-48 w-full shrink-0 overflow-hidden md:h-56"
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1.02, 1] }}
          transition={{ duration: 0.3 }}
        >
          <ProductThumb category={product.category} size="lg" className="h-full w-full" />
          <span
            className={`absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm backdrop-blur ${theme.border} ${theme.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden />
            {theme.label}
          </span>
          {reasonLabel && (
            <span className="absolute right-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 shadow-sm backdrop-blur">
              Saved: {reasonLabel}
            </span>
          )}
        </motion.div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {product.brand}
            </p>
            <h2 className="mt-0.5 truncate text-lg font-extrabold text-neutral-900">
              {product.name}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-700">{crowdSignalLine(product)}</p>

            {expanded && (
              <div className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3">
                <p className="text-xs font-bold text-neutral-800">{verdict.headline}</p>
                {isLoadingReasoning ? (
                  <div className="space-y-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-200" />
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-neutral-600">{reasoning}</p>
                )}
                {verdict.verdict === "disagreement" && (product.reviews || []).length > 0 && (
                  <div className="space-y-1 border-t border-dashed border-neutral-200 pt-1.5">
                    {product.reviews.slice(0, 2).map((snippet, i) => (
                      <p key={i} className="text-[11px] italic text-neutral-500">
                        &ldquo;{snippet}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!expanded && (
              <p className="mt-2 text-[11px] font-medium text-neutral-400">
                Tap the card for the full reasoning
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                commit("remove");
              }}
              className="rounded-xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-95"
            >
              ✕ Remove
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                commit("keep");
              }}
              className="rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95"
            >
              ↓ Keep for later
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                commit("buy");
              }}
              className="rounded-xl border border-emerald-200 bg-emerald-500 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
