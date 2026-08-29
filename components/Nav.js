import Link from "next/link";

/**
 * Top navigation with the original "Vastraloop" wordmark. Coral/pink accent
 * in the same general family as typical Indian fashion e-commerce apps, but
 * an original text-based mark — not a copy of any real brand's logo.
 */
export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-coral-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-tight text-coral-500">
            Vastra
          </span>
          <span className="text-2xl font-black tracking-tight text-neutral-800">
            loop
          </span>
        </Link>
        <span className="hidden text-sm font-medium text-neutral-500 sm:inline">
          Wishlist Reset
        </span>
      </div>
    </header>
  );
}
