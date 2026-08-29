# myntra — Wishlist Reset (unaffiliated concept prototype)

> This is an **unaffiliated concept prototype**, not a real Myntra product —
> it uses Myntra's name and brand color directly (matching the approach taken
> on an earlier "Blinkit clone" case study), and carries a persistent
> disclaimer badge on every screen for exactly that reason. Not affiliated
> with or endorsed by Myntra or Myntra Designs Pvt Ltd.

Myntra research found the wishlist itself is the bottleneck to purchase:
saved items don't carry any signal about which ones reflect real intent
versus idle browsing, and clutter buries the ones worth acting on.
**Wishlist Reset** combines the user's own stated reason for saving an item
with a simulated crowd-behavior signal to produce one clear verdict per
item — then walks the user through a fast guided session to actually clear
their wishlist down to what matters, without any monetary incentive.

## How it works

There's a single route (`/`), but `app/page.js` runs its own lightweight
view router (`home` / `category` / `wishlist` / `cart` / `profile`) so every
click is a real navigation — no in-place filtering standing in for a
screen. Opening it drops you straight into **Home** as the landing screen.
A persistent top nav (wordmark, category links, search bar, and a
Profile / Wishlist / Bag icon strip on the right, styled after a typical
Indian fashion e-commerce desktop layout) sits above the content and never
unmounts. Every nav item actually goes somewhere: the wordmark returns to
Home, category links and Home's tiles both open that category's own
listing screen, and Profile/Wishlist/Bag each switch straight to their
screen.

**Shared state** (`lib/WishlistContext.js`) is a single client-side model:
a static `catalog` (all 18 products, each with real LLM-derived
`crowdStats`), a toggleable `wishlistIds` set (which catalog items are
currently saved — seeded with 5 (`DEFAULT_WISHLIST_IDS`, deliberately
picked so all four verdict types are reachable depending on the reason you
pick), not the full catalog, but a normal add/remove set from then on),
and a `cart`. Because every catalog product already carries real
crowdStats, anything added to the wishlist from Home runs through the
**exact same** deterministic verdict matrix and LLM reasoning as the
original 5 — there's no special-casing for "new" vs. "seed" products.

- **Home** (`components/HomeTab.js`) — the landing screen: a promo banner,
  a "shop by category" tile grid, then the full catalog grid. Heart a
  product to add/remove it from the wishlist; "Add to Cart" adds it
  directly, skipping the wishlist entirely (a normal e-commerce shortcut).
- **Category** (`components/CategoryTab.js`) — a real listing screen for
  one category, reached by clicking a Home tile or a top-nav category link
  (Men/Women/GenZ — see `lib/categoryNav.js`, mapped to this demo's actual
  product categories; Kids/Home/Beauty/Studio were dropped from the nav
  rather than left pointing at an empty category with no matching
  products). A "← Back to Home" link returns to the landing screen.
- **Wishlist** (`components/WishlistTab.js`) — its own screen, reached by
  clicking the nav's Wishlist icon directly (just like Profile/Bag — no
  drawer in the way). Clicking it always shows the grid, even if a reset
  session or the summary was already in progress there (a `gridRequested`
  flag in context forces this, since the component doesn't remount when
  the icon is clicked while already on the wishlist screen). Whenever
  there's something to reset, a small "✨ Reset Now" pill floats directly
  beneath the icon itself (not a generic button floating over the page
  content) — a shortcut straight into the reset session, hidden once
  you're already on the Wishlist screen. The screen itself is a
  `grid → session → summary` state machine, all in place (no further route
  change):
  1. **Grid** — every wishlisted item, no verdicts yet (proves the clutter
     problem before the tool solves it), with the "Begin Reset" button
     right there. Each card's heart also lets you unwishlist directly,
     without a full reset session.
  2. **Reset session** — "Begin Reset" morphs the grid in place into a
     one-at-a-time session (an overlay bounded to the content area only —
     the shell doesn't move). Tap why you saved it (Love it / For an event /
     Just browsing / Waiting for a deal — or press 1-4 on a keyboard). The
     deterministic rule matrix (`/lib/verdictMatrix.js`, pure function, no
     LLM involved in the decision) combines that reason with the item's
     crowd-behavior stats into one verdict: **buy / keep / remove /
     disagreement**. An LLM call (`/app/api/reasoning`) then writes a short
     explanation of *that* verdict using the item's real numbers — each
     verdict gets its own voice (`buy` is written to build genuine desire,
     not recite a stat; `keep`/`remove` are reassuring/guilt-free; the
     prompt explicitly varies each one's opening so cards don't all read the
     same), and disagreement cases get a longer explanation referencing
     actual review snippets. You act with Buy Now / Keep / Remove buttons
     (or R/K/B, or the arrow keys), or swipe (left = remove, right = buy —
     a two-direction horizontal swipe, with a "Remove"/"Buy" tint that
     follows your drag) — all equally valid. **Buy Now** adds the item to
     the cart and removes it from the wishlist; **Remove** just removes it;
     **Keep** leaves it in the wishlist for next time. **↩ Undo last** is
     always available (session and summary alike) if you change your mind
     about the item you just acted on, and the session calls out momentum
     at the halfway point and on the last item.
  3. **Summary** — once the session's queue is empty, the same screen
     morphs again into the summary: tallies bought/kept/removed from *that*
     session and a genuine "your wishlist just got X% more useful" stat
     ((bought + kept) / original count), with a donut breakdown. "Done"
     returns to the (now smaller) grid; "Start Another Session" does the
     same.
- **Cart** (`components/CartTab.js`) — real state, lists what you've
  bought/added, remove-line-item, running total, and a **simulated**
  checkout (no real payment/order backend — clearly labeled as such in the
  UI).
- **Profile** (`components/ProfileTab.js`) — no login in this MVP, so the
  account section is static, but the stats card is real: it summarizes the
  lifetime `results` log (the same data `lib/analytics.js` logs per item)
  — items processed, % of the time you agreed with the verdict, and the
  bucket distribution by verdict.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `GROQ_API_KEY` — free tier, no credit card, from https://console.groq.com
   - `GEMINI_API_KEY` — free tier, no credit card, from https://aistudio.google.com/app/apikey
3. `npm run dev` and open http://localhost:3000

`callLLM` (`/lib/llm.js`) tries Groq first (`llama-3.3-70b-versatile`) and
falls back to Gemini (`gemini-flash-lite-latest` — `gemini-1.5-flash` from
earlier drafts of this project has since been retired by Google) on any
Groq error or HTTP 429. Both are free tiers; no paid APIs are used anywhere.

## Regenerating the crowd-stats dataset

`/data/products.json` is generated from `/data/products.base.json` (18
products + raw synthetic reviews, no stats) by a one-time script that calls
the LLM once per product to extract fit sentiment, then derives
`crowdStats` with the transparent formula in `/lib/deriveCrowdStats.js`:

```
buyThroughRate = clamp(50 + overall_sentiment_score * 35 + (stockLevel === "high" ? 5 : 0), 5, 95)
churnRate = clamp(100 - buyThroughRate - 12, 5, 90)
priceDropFrequency = "frequent" if category in [ethnic_wear, seasonal] OR fit_sentiment == "mixed"
                   = "rare" if overall_sentiment_score > 0.5 AND category in [basics, footwear]
                   = "occasional" otherwise
```

Both the raw LLM sentiment extraction and the derived stats are written
back into `products.json`, so every number is traceable to actual review
text. This does **not** run live per user session — the app only ever
reads the finished file.

```bash
node scripts/generateCrowdStats.js
```

The script is resumable — if it's rate-limited partway through (common on
free-tier keys), just re-run it; already-processed products are skipped.

## Analytics hook (v1)

`/lib/analytics.js` logs one event per processed item (`{ productId, reason,
verdict, action, interaction }`) to the console and an in-memory array for
the current session. It's structured so a real backend could later turn it
into case-study metrics without changing the event shape:

- **% agreement between verdict and action** — count where `action`
  matches `verdict` (buy/keep/remove) divided by total events; disagreement
  verdicts are excluded since there's no single "correct" action.
- **Bucket distribution** — group events by `verdict`.
- **Reason distribution** — group events by `reason`.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. Go to https://vercel.com/new and import the repo. Framework preset
   "Next.js" is auto-detected — no extra config needed.
3. Before the first deploy, add the two environment variables under
   **Settings → Environment Variables**: `GROQ_API_KEY` and
   `GEMINI_API_KEY` (same values as your local `.env.local`).
4. Deploy. Vercel's build runs `npm run build` — already verified to pass
   locally.
5. `data/products.json` is committed to the repo, so the deployed app works
   immediately without needing to run the generation script again. Re-run
   `node scripts/generateCrowdStats.js` locally and redeploy only if you
   want to regenerate the dataset.

## What's real vs. simulated

- **REAL**: the verdict matrix logic (`/lib/verdictMatrix.js`), the
  sentiment-derivation formula (`/lib/deriveCrowdStats.js`), the
  LLM-generated reasoning sentences, the deployed working UI, the full
  session flow.
- **SIMULATED**: the product catalog and the underlying crowd-behavior data
  source. This MVP derives crowd stats from LLM-extracted sentiment on
  synthetic reviews as a stand-in for real aggregate Myntra user behavior,
  which would require platform access this MVP doesn't have. All review
  text and crowd stats are synthetic/simulated.

## Known limitations (v1)

- No database, no auth — fully stateless. Wishlist membership, cart
  contents, and session results all live only in React context in the
  browser tab and are lost on refresh.
- Product images (`components/ProductThumb.js`) are a category-tinted
  gradient block with a clothing-type emoji, sized modestly rather than
  filling the frame — not real product photography, per the IP boundary
  spec. (An earlier iteration tried a keyword-tagged stock-photo API;
  the results weren't reliably relevant, so this reverted to emoji.)
- The Assistant Google Font stands in for Myntra's actual (licensed)
  webfont — visually close, not the real typeface.
- Analytics events are console-logged / in-memory only, not persisted.
- Checkout on the Cart tab is a simulated confirmation only — no real
  payment or order backend.
- Search (top bar) is visual only; Home/Cart/Profile don't persist across
  a refresh like Wishlist doesn't either.

This is an unaffiliated concept prototype for a product-management case
study — not a real Myntra product, and not affiliated with or endorsed by
Myntra or Myntra Designs Pvt Ltd.
