/**
 * Maps the top-nav category labels to this catalog's actual product
 * categories, so clicking a nav link genuinely filters Home's product grid
 * instead of being a dead link. Categories with no matching products in
 * this 18-item demo catalog still work — they just show an empty state.
 */
export const NAV_CATEGORIES = [
  { label: "Men", categories: ["shirts", "jeans"] },
  { label: "Women", categories: ["dresses", "ethnic_wear"] },
  { label: "Kids", categories: [] },
  { label: "Home", categories: [] },
  { label: "Beauty", categories: [] },
  { label: "GenZ", categories: ["footwear"] },
  { label: "Studio", categories: [] },
];
