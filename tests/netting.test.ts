import { describe, expect, it } from "vitest";
import { calculateNetPositions } from "@/lib/clearing/netting";

describe("multilateral netting", () => {
  it("creates conserved currency positions and compresses a cycle", () => {
    const result = calculateNetPositions([
      { sourceCurrency: "USD", destinationCurrency: "EUR", amount: 500 },
      { sourceCurrency: "EUR", destinationCurrency: "GBP", amount: 400 },
      { sourceCurrency: "GBP", destinationCurrency: "USD", amount: 300 },
    ]);
    expect(result.conservationDelta).toBeLessThan(0.000001);
    expect(result.externalSettlement).toBe(200);
    expect(result.demands.reduce((sum, demand) => sum + demand.amount, 0)).toBe(200);
  });
});
