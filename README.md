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

1. **Landing** — shows the real wishlist count and a CTA into the flow.
2. **Wishlist overview** — a static grid of every saved item, no verdicts
   yet. This is deliberate: it visually proves the clutter problem before
   the tool solves it.
3. **Reset session** — one item at a time. Tap why you saved it (Love it /
   For an event / Just browsing / Waiting for a deal). A deterministic rule
   matrix (`/lib/verdictMatrix.js`, pure function, no LLM involved in the
   decision) combines that reason with the item's crowd-behavior stats into
   one verdict: **buy / keep / remove / disagreement**. An LLM call
   (`/app/api/reasoning`) then writes a short plain-language sentence
   explaining *that* verdict using the item's real numbers — for
   disagreement cases (you love it, but the crowd mostly didn't buy it) it
   writes a longer explanation referencing actual review snippets. You act
   with Buy Now / Keep / Remove buttons, or swipe (left = remove, right =
   buy, up = keep) — both are equally valid.
4. **Summary** — tallies bought/kept/removed from your actual session and
   shows a genuine "your wishlist just got X% more useful" stat
   ((bought + kept) / original count), with a donut breakdown.

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

- No database, no auth — fully stateless. Session state (which items were
  processed, bought, kept, removed) lives only in React context in the
  browser tab and is lost on refresh.
- Product images are placeholders (picsum.photos), not real product
  photography.
- Analytics events are console-logged / in-memory only, not persisted.

This is an unaffiliated concept prototype for a product-management case
study — not a real Myntra product, and not affiliated with or endorsed by
Myntra or Myntra Designs Pvt Ltd.
