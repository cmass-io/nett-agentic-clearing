import { describe, expect, it } from "vitest";
import { optimizeSettlementRoutes } from "@/lib/routing/optimizer";
import type { MarketConditions, SettlementRail } from "@/lib/types";

const market: MarketConditions = { shockScenario: null, fxCostMultiplier: 1, unavailableRailIds: [], description: "test" };
const pool = (currency: "USD" | "PHP") => ({ currency, available: 5_000, reserved: 0, reserveFloor: 100 });
const rail = (overrides: Partial<SettlementRail> = {}): SettlementRail => ({
  id: "rail", sourceCurrency: "USD", destinationCurrency: "PHP", costBps: 1, fixedCost: 0,
  settlementTimeSeconds: 60, capacity: 2_000, available: true, riskScore: 1,
  tier: "standard", liquidityMultiplier: 1, ...overrides,
});

describe("routing constraints", () => {
  it("does not select an unavailable rail", () => {
    const result = optimizeSettlementRoutes([{ id: "D1", sourceCurrency: "USD", destinationCurrency: "PHP", amount: 1_000 }], [rail({ available: false })], [pool("USD"), pool("PHP")], market);
    expect(result.routes[0]?.valid).toBe(false);
  });
  it("does not select an over-capacity rail", () => {
    const result = optimizeSettlementRoutes([{ id: "D1", sourceCurrency: "USD", destinationCurrency: "PHP", amount: 1_000 }], [rail({ capacity: 999 })], [pool("USD"), pool("PHP")], market);
    expect(result.routes[0]?.valid).toBe(false);
  });
});
