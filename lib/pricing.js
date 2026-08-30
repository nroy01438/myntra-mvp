/**
 * Purely presentational discount display — products.json only carries a
 * single `price` (no MRP/discount fields), so a deterministic discount
 * percentage is derived from the product id, giving every product a
 * stable strikethrough-MRP + discount% line (matching real e-commerce
 * listing UI) without inventing per-product data that would need
 * maintaining.
 */
export function getDiscountPct(id) {
  let hash = 0;
  for (const ch of id) hash += ch.charCodeAt(0);
  return 10 + (hash % 41); // 10-50%
}

export function getMrp(price, id) {
  const discountPct = getDiscountPct(id);
  return Math.round(price / (1 - discountPct / 100) / 10) * 10;
}
