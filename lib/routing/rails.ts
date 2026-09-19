import { CURRENCIES, type SettlementRail } from "@/lib/types";

export function createSettlementRails(): SettlementRail[] {
  const rails: SettlementRail[] = [];
  for (const sourceCurrency of CURRENCIES) {
    for (const destinationCurrency of CURRENCIES) {
      if (sourceCurrency === destinationCurrency) continue;
      rails.push({
        id: `CLEAR-${sourceCurrency}-${destinationCurrency}`, sourceCurrency, destinationCurrency,
        costBps: 1.2, fixedCost: 18, settlementTimeSeconds: 75, capacity: 500_000_000,
        available: true, riskScore: 1.4, tier: "standard", liquidityMultiplier: 1,
      });
      rails.push({
        id: `FLEX-${sourceCurrency}-${destinationCurrency}`, sourceCurrency, destinationCurrency,
        costBps: 5.4, fixedCost: 32, settlementTimeSeconds: 145, capacity: 2_500_000_000,
        available: true, riskScore: 2.1, tier: "liquidity-saver", liquidityMultiplier: 0.02,
      });
    }
  }
  return rails;
}
