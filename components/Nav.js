import Link from "next/link";

/**
 * Top navigation. This is an unaffiliated concept prototype styled after
 * Myntra's own storefront (name + brand color used directly, matching the
 * approach taken on the earlier Blinkit clone case study) — see the
 * persistent disclaimer badge on every screen.
 */
export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-coral-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-2xl font-black italic tracking-tight text-coral-500">
            Myntra
          </span>
        </Link>
        <span className="hidden text-sm font-medium text-neutral-500 sm:inline">
          Wishlist Reset
        </span>
      </div>
    </header>
  );
}
