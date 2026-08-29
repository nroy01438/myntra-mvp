/**
 * Persistent, always-visible disclaimer badge required by the IP boundary:
 * this is a case-study prototype, original branding, not affiliated with or
 * endorsed by Myntra. Rendered in the root layout so it appears on every
 * screen.
 */
export default function DisclaimerBadge() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-full border border-coral-200 bg-white/95 px-4 py-2 text-center text-[11px] font-medium leading-tight text-neutral-500 shadow-lg backdrop-blur sm:w-auto">
        Myntra-style prototype — case study demo, not affiliated with or endorsed by Myntra
      </div>
  );
}
