# Vastraloop — Wishlist Reset (case study MVP)

Myntra research found the wishlist itself is the bottleneck to purchase:
saved items don't carry any signal about which ones reflect real intent
versus idle browsing, and clutter buries the ones worth acting on.
**Wishlist Reset** combines the user's own stated reason for saving an item
with a simulated crowd-behavior signal to produce one clear verdict per
item — then walks the user through a fast guided session to actually clear
their wishlist down to what matters, without any monetary incentive.

> **Build status:** Steps 1, 2, 2b, and 3 (scaffold, dataset, crowd-stat
> derivation, landing + wishlist-overview screens) are complete. Step 4
> (the swipe/verdict session) is paused for design review before continuing,
> per the build plan.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `GROQ_API_KEY` — free tier, no credit card, from https://console.groq.com
   - `GEMINI_API_KEY` — free tier, no credit card, from https://aistudio.google.com/app/apikey
3. `npm run dev` and open http://localhost:3000

## Regenerating the crowd-stats dataset

`/data/products.json` is generated from `/data/products.base.json` (products
+ raw reviews, no stats) by a one-time script that calls the LLM once per
product to extract fit sentiment, then derives `crowdStats` with the
transparent formula in `/lib/deriveCrowdStats.js`. It does **not** run live
per user session.

```bash
node scripts/generateCrowdStats.js
```

The script is resumable — if it's rate-limited partway through (common on
free-tier keys), just re-run it; already-processed products are skipped.

## What's real vs. simulated

- **REAL**: the verdict matrix logic (`/lib/verdictMatrix.js`), the
  sentiment-derivation formula (`/lib/deriveCrowdStats.js`), the
  LLM-generated reasoning sentences, the deployed working UI, the full
  session flow.
- **SIMULATED**: the product catalog and the underlying crowd-behavior data
  source. This MVP derives crowd stats from LLM-extracted sentiment on
  synthetic reviews as a stand-in for real aggregate Myntra user behavior,
  which would require platform access this MVP doesn't have.

## Known limitations (v1)

- No database, no auth — fully stateless. Session state (which items were
  processed, bought, kept, removed) lives only in React context in the
  browser tab and is lost on refresh.
- Product images are placeholders (picsum.photos), not real product
  photography.

This is a prototype for a product-management case study — not affiliated
with or endorsed by Myntra.
