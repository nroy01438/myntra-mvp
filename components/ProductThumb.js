import { CATEGORY_ILLUSTRATIONS, BagIllustration } from "@/components/ClothingIllustrations";

/**
 * Product visual — a category-tinted gradient block with a flat vector
 * garment illustration filling most of the frame, closer to how a real
 * product photo occupies a listing card. Deliberately not a photo: an
 * external photo API (tried in an earlier iteration, LoremFlickr) can't be
 * curated for relevance and produced odd/irrelevant results, and no
 * image-generation tool is available in this environment either. Hand-
 * authored SVG illustrations (components/ClothingIllustrations.js) are the
 * closest achievable stand-in — a real illustration, not a stock photo of
 * an unrelated garment, and no real Myntra photography either way, per the
 * IP boundary spec.
 */
const CATEGORY_STYLE = {
  dresses: { from: "from-rose-300", to: "to-rose-100", tint: "text-rose-600" },
  ethnic_wear: { from: "from-amber-300", to: "to-amber-100", tint: "text-amber-700" },
  shirts: { from: "from-sky-300", to: "to-sky-100", tint: "text-sky-700" },
  jeans: { from: "from-indigo-300", to: "to-indigo-100", tint: "text-indigo-700" },
  footwear: { from: "from-emerald-300", to: "to-emerald-100", tint: "text-emerald-700" },
};

const DEFAULT_STYLE = { from: "from-neutral-300", to: "to-neutral-100", tint: "text-neutral-500" };

const SIZE_CLASSES = {
  sm: "h-3/5 w-3/5",
  md: "h-4/5 w-4/5",
  lg: "h-4/5 w-4/5",
};

export default function ProductThumb({ category, className = "", size = "md" }) {
  const style = CATEGORY_STYLE[category] ?? DEFAULT_STYLE;
  const Illustration = CATEGORY_ILLUSTRATIONS[category] ?? BagIllustration;

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${style.from} ${style.to} ${className}`}
    >
      <Illustration className={`${SIZE_CLASSES[size]} ${style.tint} drop-shadow-sm`} />
    </div>
  );
}
