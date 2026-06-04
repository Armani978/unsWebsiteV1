import type { InventoryAdapter } from "../inventory/types";

export const cloverInventoryAdapter: InventoryAdapter = {
  source: "clover",
  async pullProducts() {
    if (process.env.CLOVER_SYNC_ENABLED !== "true") {
      return { skipped: true, reason: "Clover sync is disabled." };
    }

    return { pending: true };
  },
  async pullInventory() {
    if (process.env.CLOVER_SYNC_ENABLED !== "true") {
      return { skipped: true, reason: "Clover sync is disabled." };
    }

    return { pending: true };
  },
  async pushInventoryAdjustment() {
    if (process.env.CLOVER_SYNC_ENABLED !== "true") {
      return;
    }
  },
};
