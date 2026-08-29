/**
 * Persistent, always-visible disclaimer: this is an unaffiliated concept
 * prototype for a product-management case study, not a real Myntra product.
 * Rendered as a slim top banner, above the app shell, on every screen/state
 * — never obscured by the bottom tab bar.
 */
export default function DisclaimerBadge() {
  return (
    <div className="shrink-0 bg-neutral-800 px-3 py-1 text-center text-[10px] font-medium leading-tight text-neutral-200">
      Unaffiliated concept prototype — case study demo, not affiliated with Myntra or Myntra Designs Pvt Ltd.
    </div>
  );
}
