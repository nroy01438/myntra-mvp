import Link from "next/link";
import productsData from "@/data/products.json";

export default function LandingPage() {
  const itemCount = productsData.length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 text-center sm:pt-24">
      <span className="mb-4 rounded-full bg-coral-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-coral-600">
        Wishlist Reset
      </span>

      <h1 className="text-3xl font-extrabold leading-tight text-neutral-900 sm:text-5xl">
        Your wishlist has{" "}
        <span className="text-coral-500">{itemCount} items</span>.
        <br className="hidden sm:block" /> Let&apos;s figure out which ones
        you actually want.
      </h1>

      <p className="mt-5 max-w-xl text-base text-neutral-600 sm:text-lg">
        Most saved items never get bought — not because they weren&apos;t
        worth it, but because nobody ever tells you which ones are. We
        combine why you saved each item with how other shoppers actually
        behaved, so you can clear your wishlist down to what matters in
        minutes.
      </p>

      <Link
        href="/wishlist"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-coral-200 transition hover:bg-coral-600"
      >
        Start Wishlist Reset
        <span aria-hidden>→</span>
      </Link>

      <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <FeatureCard
          title="One tap reason"
          body="Tell us why you saved it — love it, an event, browsing, or waiting for a deal."
        />
        <FeatureCard
          title="Real crowd signal"
          body="We check how other shoppers who saved this item actually behaved."
        />
        <FeatureCard
          title="One clear verdict"
          body="Buy, keep, or remove — with a plain-language reason, no guesswork."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-coral-100 bg-white p-5 text-left shadow-sm">
      <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500">{body}</p>
    </div>
  );
}
