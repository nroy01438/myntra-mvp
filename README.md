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

There's a single route (`/`). Opening it drops you straight into a
persistent app shell — top bar (wordmark, a visual-only search bar, a real
cart icon with a live count) and a bottom tab bar (Home / Wishlist / Cart /
Profile, Wishlist active by default) — with the wishlist grid as the
immediate content, no marketing page first. Only the content area between
those bars ever changes; the shell itself never unmounts or navigates away,
so it reads as an app already sitting on its Wishlist screen rather than a
website explaining a feature. All four tabs are real, working screens.

**Shared state** (`lib/WishlistContext.js`) is a single client-side model:
a static `catalog` (all 18 products, each with real LLM-derived
`crowdStats`), a toggleable `wishlistIds` set (which catalog items are
currently saved — seeded with all 18 to match the "cluttered wishlist"
premise, but a normal add/remove set from then on), and a `cart`. Because
every catalog product already carries real crowdStats, anything added to
the wishlist from Home runs through the **exact same** deterministic
verdict matrix and LLM reasoning as the original 18 — there's no
special-casing for "new" vs. "seed" products.

- **Home** (`components/HomeTab.js`) — browse the full catalog. Heart a
  product to add/remove it from the wishlist; "Add to Cart" adds it
  directly, skipping the wishlist entirely (a normal e-commerce shortcut).
- **Wishlist** (`components/WishlistTab.js`) — a `grid → session → summary`
  state machine, all in the same screen (no route change anywhere):
  1. **Grid** — every wishlisted item, no verdicts yet (proves the clutter
     problem before the tool solves it). Each card's heart also lets you
     unwishlist directly, without a full reset session.
  2. **Reset session** — "Begin Reset" morphs the grid in place into a
     one-at-a-time session (an overlay bounded to the content area only —
     the shell doesn't move). Tap why you saved it (Love it / For an event /
     Just browsing / Waiting for a deal). The deterministic rule matrix
     (`/lib/verdictMatrix.js`, pure function, no LLM involved in the
     decision) combines that reason with the item's crowd-behavior stats
     into one verdict: **buy / keep / remove / disagreement**. An LLM call
     (`/app/api/reasoning`) then writes a short plain-language sentence
     explaining *that* verdict using the item's real numbers — disagreement
     cases get a longer explanation referencing actual review snippets. You
     act with Buy Now / Keep / Remove buttons, or swipe (left = remove,
     right = buy — a two-direction horizontal swipe, with a "Remove"/"Buy"
     tint that follows your drag) — both are equally valid. **Buy Now**
     adds the item to the cart and removes it from the wishlist; **Remove**
     just removes it; **Keep** leaves it in the wishlist for next time.
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
- **Reset nudge** (`components/ResetNudgeBanner.js`) — shown on Home, Cart,
  and Profile whenever the wishlist isn't empty, so you don't have to
  remember to go check it yourself. One tap jumps to the Wishlist tab and
  auto-starts the reset session immediately (no second click needed).

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
- Product images are placeholders (picsum.photos), not real product
  photography.
- Analytics events are console-logged / in-memory only, not persisted.
- Checkout on the Cart tab is a simulated confirmation only — no real
  payment or order backend.
- Search (top bar) is visual only; Home/Cart/Profile don't persist across
  a refresh like Wishlist doesn't either.

This is an unaffiliated concept prototype for a product-management case
study — not a real Myntra product, and not affiliated with or endorsed by
Myntra or Myntra Designs Pvt Ltd.
