const CATEGORY_ALIASES: Record<string, string> = {
  accessories: "Accessories",
  cbd: "Wellness",
  deals: "Promotions",
  flower: "Wellness",
  glass: "Glassware",
  glassware: "Glassware",
  hemp: "Wellness",
  hookah: "Accessories",
  lighters: "Accessories",
  papers: "Paper Goods",
  "papers & wraps": "Paper Goods",
  thca: "Wellness",
  vape: "Electronics",
  vapes: "Electronics",
  "vapes & e-cigs": "Electronics",
  wraps: "Paper Goods",
};

export function toCloverSafeCategory(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "Uncategorized";

  return CATEGORY_ALIASES[normalized] ?? value.trim();
}
