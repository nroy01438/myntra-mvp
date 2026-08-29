import { SearchIcon, CartIcon } from "@/components/icons";

/**
 * Persistent top bar: wordmark, a visual-only (non-functional) search bar,
 * and a cart icon. Part of the always-on app shell — never unmounted or
 * navigated away from.
 */
export default function TopBar() {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-coral-100 bg-white px-3 py-2.5 sm:px-5">
      <span className="text-xl font-black italic tracking-tight text-coral-500">
        Myntra
      </span>

      <div className="flex flex-1 items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-400">
        <SearchIcon className="h-4 w-4 shrink-0" />
        <span className="truncate text-sm">Search for products, brands and more</span>
      </div>

      <button
        type="button"
        aria-label="Cart"
        className="relative shrink-0 rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100"
      >
        <CartIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
