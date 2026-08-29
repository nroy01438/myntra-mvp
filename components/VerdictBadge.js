const VERDICT_STYLES = {
  buy: {
    label: "Buy",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  keep: {
    label: "Keep",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
  },
  remove: {
    label: "Remove",
    badge: "bg-neutral-200 text-neutral-600 border-neutral-300",
    bar: "bg-neutral-400",
  },
  disagreement: {
    label: "Worth a second look",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    bar: "bg-violet-500",
  },
};

export default function VerdictBadge({ verdict, headline, reasoning, isLoading, reviewSnippets }) {
  const style = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.keep;

  return (
    <div className="w-full rounded-2xl border border-neutral-100 bg-white p-4 text-left shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.bar}`} aria-hidden />
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.badge}`}
        >
          {style.label}
        </span>
      </div>
      <h3 className="mt-2 text-lg font-extrabold text-neutral-900">{headline}</h3>

      {isLoading ? (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs font-medium text-neutral-400">
            Checking what other shoppers actually did with this one…
          </p>
          <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{reasoning}</p>
      )}

      {verdict === "disagreement" && reviewSnippets?.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-dashed border-neutral-200 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            What other reviews say
          </p>
          {reviewSnippets.map((snippet, i) => (
            <p key={i} className="text-xs italic text-neutral-500">
              &ldquo;{snippet}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
