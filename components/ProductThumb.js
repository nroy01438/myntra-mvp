"use client";

import { useEffect, useState } from "react";

/**
 * Product visual — a lively, category-relevant stock photo (via LoremFlickr,
 * keyword-tagged so it's actually clothing-relevant rather than a random
 * stock image) with a graceful fallback to a category-tinted emoji block if
 * the photo fails to load (or hasn't loaded yet) — per the IP boundary
 * spec, no real Myntra photography either way. Preloads via a plain JS
 * Image() so a failed load never flashes the browser's broken-image icon;
 * it just stays on the emoji fallback.
 */
const CATEGORY_STYLE = {
  dresses: { emoji: "👗", from: "from-rose-200", to: "to-rose-100", tags: "dress,fashion" },
  ethnic_wear: {
    emoji: "🥻",
    from: "from-amber-200",
    to: "to-amber-100",
    tags: "saree,indianfashion",
  },
  shirts: { emoji: "👔", from: "from-sky-200", to: "to-sky-100", tags: "shirt,mensfashion" },
  jeans: { emoji: "👖", from: "from-indigo-200", to: "to-indigo-100", tags: "jeans,denim" },
  footwear: { emoji: "👟", from: "from-emerald-200", to: "to-emerald-100", tags: "sneakers,shoes" },
};

const DEFAULT_STYLE = {
  emoji: "🛍️",
  from: "from-neutral-200",
  to: "to-neutral-100",
  tags: "fashion",
};

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 100000;
}

export default function ProductThumb({ category, seed, className = "", size = "md" }) {
  const style = CATEGORY_STYLE[category] ?? DEFAULT_STYLE;
  const lock = hashSeed(`${category ?? "default"}-${seed ?? "0"}`);
  const photoUrl = `https://loremflickr.com/500/650/${style.tags}?lock=${lock}`;
  const [photoReady, setPhotoReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => !cancelled && setPhotoReady(true);
    img.onerror = () => !cancelled && setPhotoReady(false);
    img.src = photoUrl;
    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  if (photoReady) {
    return (
      <div
        role="img"
        aria-label=""
        className={`bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${photoUrl})` }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${style.from} ${style.to} ${className}`}
    >
      <span className={`${SIZE_CLASSES[size]} drop-shadow-sm`} aria-hidden>
        {style.emoji}
      </span>
    </div>
  );
}
