/**
 * Persistent, always-visible disclaimer badge: this is an unaffiliated
 * concept prototype for a product-management case study, not a real Myntra
 * product. Rendered in the root layout so it appears on every screen.
 */
export default function DisclaimerBadge() {
  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-full border border-coral-200 bg-white/95 px-4 py-2 text-center text-[11px] font-medium leading-tight text-neutral-500 shadow-lg backdrop-blur sm:w-auto">
        Unaffiliated concept prototype — case study demo, not affiliated with Myntra or Myntra Designs Pvt Ltd.
      </div>
  );
}
