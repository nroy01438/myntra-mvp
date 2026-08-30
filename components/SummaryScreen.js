const SEGMENT_COLORS = {
  bought: "#10b981", // emerald-500
  kept: "#f59e0b", // amber-500
  removed: "#a3a3a3", // neutral-400
};

/**
 * Simple CSS conic-gradient donut — no chart library needed for three
 * segments. Falls back gracefully (renders a neutral ring) when the
 * session had zero items processed.
 */
function Donut({ bought, kept, removed }) {
  const total = bought + kept + removed || 1;
  const boughtPct = (bought / total) * 100;
  const keptPct = (kept / total) * 100;

  const gradient = `conic-gradient(
    ${SEGMENT_COLORS.bought} 0% ${boughtPct}%,
    ${SEGMENT_COLORS.kept} ${boughtPct}% ${boughtPct + keptPct}%,
    ${SEGMENT_COLORS.removed} ${boughtPct + keptPct}% 100%
  )`;

  return (
    <div
      className="relative mx-auto h-32 w-32 shrink-0 rounded-full"
      style={{ background: gradient }}
    >
      <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-xl font-extrabold text-neutral-900">{total}</span>
        <span className="text-[10px] text-neutral-400">reviewed</span>
      </div>
    </div>
  );
}

function Legend({ bought, kept, removed }) {
  const rows = [
    { label: "Added to Bag", value: bought, color: SEGMENT_COLORS.bought },
    { label: "Kept for later", value: kept, color: SEGMENT_COLORS.kept },
    { label: "Removed", value: removed, color: SEGMENT_COLORS.removed },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: row.color }}
            aria-hidden
          />
          <span className="w-28 text-left font-medium text-neutral-600">{row.label}</span>
          <span className="font-bold text-neutral-900">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// The one number that actually matters to the person doing the reset is
// how much closer their bag just got to checkout — not an internal
// funnel breakdown of what happened to every item. That number leads;
// everything else (the per-item tallies, the donut) is supporting detail
// underneath it, not the headline.
export default function SummaryScreen({ originalCount, bought, kept, removed }) {
  const usefulnessPct = originalCount > 0 ? Math.round(((bought + kept) / originalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-md px-4 pt-10 text-center">
      <span className="mb-3 inline-block rounded-full bg-coral-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-coral-600">
        🎉 Reset complete
      </span>

      {bought > 0 ? (
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          <span className="text-emerald-500">{bought}</span> item{bought !== 1 ? "s" : ""}{" "}
          added to your Bag
        </h1>
      ) : (
        <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
          Your wishlist is looking sharper
        </h1>
      )}
      <p className="mt-1 text-sm font-semibold text-coral-500">
        {usefulnessPct}% more useful than when you started
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Of {originalCount} item{originalCount !== 1 ? "s" : ""} — {bought} added to cart,{" "}
        {removed} removed, {kept} kept for later.
      </p>

      <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm sm:flex-row sm:justify-center sm:gap-10">
        <Donut bought={bought} kept={kept} removed={removed} />
        <Legend bought={bought} kept={kept} removed={removed} />
      </div>
    </div>
  );
}
