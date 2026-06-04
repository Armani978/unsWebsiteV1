export type AiFeature =
  | "product-description"
  | "product-search"
  | "shopping-assistant"
  | "inventory-assistant"
  | "reorder-suggestions"
  | "review-summaries";

export function isAiEnabled(feature: AiFeature) {
  const enabled = process.env.OPENAI_API_KEY && process.env.AI_FEATURES_ENABLED === "true";
  return Boolean(enabled || feature === "product-description");
}
