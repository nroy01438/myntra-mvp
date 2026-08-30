/**
 * Landing hero — an actual visual (not just text on a gradient), built from
 * layered clothing-icon "artwork" rather than a photo, so it never depends
 * on an external image host and stays inside the IP boundary (no real
 * product photography, original hero art only).
 */
export default function HeroBanner() {
  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-coral-500 to-coral-400 sm:mx-6">
      <div className="flex flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:gap-8 sm:px-10 sm:py-10">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-2xl font-black text-white sm:text-4xl">
            New Season Drop
          </p>
          <p className="mt-1 text-lg font-bold text-coral-50 sm:text-xl">
            Up to 40% off across the catalog
          </p>
          <p className="mt-2 text-xs font-medium text-coral-100 sm:text-sm">
            Case study demo only — not a real offer or coupon code.
          </p>
        </div>
        <div
          className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3"
          aria-hidden
        >
          {["👗", "🥻", "👔", "👖", "👟", "👜"].map((emoji, i) => (
            <div
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 text-2xl backdrop-blur-sm sm:h-16 sm:w-16 sm:text-3xl"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
