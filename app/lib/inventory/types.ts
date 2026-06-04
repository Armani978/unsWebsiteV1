export type InventorySource = "internal" | "clover" | "manual" | "vendor" | "ai";

export type InventoryAdapter = {
  source: InventorySource;
  pullProducts(): Promise<unknown>;
  pullInventory(): Promise<unknown>;
  pushInventoryAdjustment(input: {
    productId: string;
    quantityDelta: number;
    reason: string;
    actorId?: string;
  }): Promise<void>;
};
