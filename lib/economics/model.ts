import type { ModelAssumptions, NetworkMetrics } from "@/lib/types";

export const DEFAULT_ASSUMPTIONS: ModelAssumptions = {
  traditionalSettlementBps: 8.5,
  localSettlementBps: 1.2,
  fxCostBps: 3.5,
  liquidityAnnualCostPct: 4.8,
  nettFeePctOfSavings: 12,
};

export function calculateEconomics(metrics: NetworkMetrics, assumptions: ModelAssumptions) {
  const withoutNett = metrics.grossObligations * ((assumptions.traditionalSettlementBps + assumptions.fxCostBps) / 10_000);
  const liquidityCost = metrics.externalSettlement * (assumptions.liquidityAnnualCostPct / 100 / 365);
  const withNettBeforeFee = metrics.externalSettlement * ((assumptions.localSettlementBps + assumptions.fxCostBps) / 10_000)
    + liquidityCost + metrics.modeledSettlementCost;
  const grossSavings = Math.max(0, withoutNett - withNettBeforeFee);
  const nettFee = grossSavings * (assumptions.nettFeePctOfSavings / 100);
  return {
    withoutNett,
    withNett: withNettBeforeFee + nettFee,
    grossSavings,
    nettFee,
    customerNetSavings: grossSavings - nettFee,
  };
}
