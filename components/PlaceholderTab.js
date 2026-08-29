/**
 * Static stand-in for the Home/Cart/Profile tabs. They're real, clickable
 * tabs in the shell (not dead buttons) — only Wishlist has working logic
 * behind it, per spec.
 */
export default function PlaceholderTab({ label }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="text-3xl">🚧</span>
      <p className="text-sm font-semibold text-neutral-600">{label} isn&apos;t wired up yet</p>
      <p className="max-w-xs text-xs text-neutral-400">
        This case study MVP only builds out the Wishlist tab.
      </p>
    </div>
  );
}
