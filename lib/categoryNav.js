/**
 * Maps the top-nav category labels to this catalog's actual product
 * categories, so clicking a nav link genuinely filters Home's product grid
 * instead of being a dead link. Only labels with real matching products in
 * this 18-item demo catalog are listed — Kids/Home/Beauty/Studio were
 * dropped rather than left pointing at an empty category screen.
 */
export const NAV_CATEGORIES = [
  { label: "Men", categories: ["shirts", "jeans"] },
  { label: "Women", categories: ["dresses", "ethnic_wear"] },
  { label: "GenZ", categories: ["footwear"] },
];
