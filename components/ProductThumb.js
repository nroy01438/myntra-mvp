/**
 * Product visual — a category-tinted gradient block with a large
 * clothing-type emoji, per the IP boundary spec ("simple colored blocks
 * with a product-type icon/emoji"). Renders identically everywhere,
 * has zero network dependency (unlike a photo CDN), and reads as clearly
 * clothing-relevant rather than a random stock photo.
 */
const CATEGORY_STYLE = {
  dresses: { emoji: "👗", from: "from-rose-200", to: "to-rose-100" },
  ethnic_wear: { emoji: "🥻", from: "from-amber-200", to: "to-amber-100" },
  shirts: { emoji: "👔", from: "from-sky-200", to: "to-sky-100" },
  jeans: { emoji: "👖", from: "from-indigo-200", to: "to-indigo-100" },
  footwear: { emoji: "👟", from: "from-emerald-200", to: "to-emerald-100" },
};

const DEFAULT_STYLE = { emoji: "🛍️", from: "from-neutral-200", to: "to-neutral-100" };

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

export default function ProductThumb({ category, className = "", size = "md" }) {
  const style = CATEGORY_STYLE[category] ?? DEFAULT_STYLE;

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
