import type { Currency, LiquidityPool, MarketConditions, SettlementDemand, SettlementRail, SettlementRoute } from "@/lib/types";
import { checkLiquidity, reserveLiquidity } from "@/lib/liquidity/pools";

type Candidate = { currency: Currency; score: number; path: SettlementRail[] };
const edgeScore = (rail: SettlementRail, market: MarketConditions) =>
  rail.costBps * market.fxCostMultiplier + rail.settlementTimeSeconds / 600 + rail.riskScore * 0.35;

function findPath(demand: SettlementDemand, rails: SettlementRail[], pools: LiquidityPool[], market: MarketConditions, capacityUsed: Map<string, number>): SettlementRail[] | null {
  const queue: Candidate[] = [{ currency: demand.sourceCurrency, score: 0, path: [] }];
  const best = new Map<Currency, number>([[demand.sourceCurrency, 0]]);
  while (queue.length > 0) {
    queue.sort((a, b) => a.score - b.score);
    const current = queue.shift()!;
    if (current.currency === demand.destinationCurrency) return current.path;
    for (const rail of rails) {
      if (rail.sourceCurrency !== current.currency || !rail.available) continue;
      if (rail.capacity - (capacityUsed.get(rail.id) ?? 0) + 0.005 < demand.amount) continue;
      const pool = pools.find((item) => item.currency === rail.sourceCurrency);
      if (!pool || !checkLiquidity(pool, demand.amount * rail.liquidityMultiplier)) continue;
      const score = current.score + edgeScore(rail, market);
      if (score >= (best.get(rail.destinationCurrency) ?? Number.POSITIVE_INFINITY)) continue;
      best.set(rail.destinationCurrency, score);
      queue.push({ currency: rail.destinationCurrency, score, path: [...current.path, rail] });
    }
  }
  return null;
}

export function optimizeSettlementRoutes(demands: SettlementDemand[], rails: SettlementRail[], liquidityPools: LiquidityPool[], market: MarketConditions): { routes: SettlementRoute[]; pools: LiquidityPool[]; shortfalls: string[] } {
  const pools = liquidityPools.map((pool) => ({ ...pool, reserved: 0 }));
  const capacityUsed = new Map<string, number>();
  const routes: SettlementRoute[] = [];
  const shortfalls: string[] = [];
  for (const demand of [...demands].sort((a, b) => b.amount - a.amount)) {
    const path = findPath(demand, rails, pools, market, capacityUsed);
    if (!path) {
      shortfalls.push(`No eligible route for ${demand.sourceCurrency}->${demand.destinationCurrency} ${demand.amount.toFixed(0)}`);
      routes.push({ id: `ROUTE-${demand.id}`, sourceCurrency: demand.sourceCurrency, destinationCurrency: demand.destinationCurrency, amount: demand.amount, path: [], railIds: [], modeledCost: 0, settlementTimeSeconds: 0, riskScore: 0, liquidityUsed: 0, valid: false, reason: "All paths exceeded liquidity, availability, or capacity constraints." });
      continue;
    }
    let modeledCost = 0;
    let settlementTimeSeconds = 0;
    let riskScore = 0;
    let liquidityUsed = 0;
    for (const rail of path) {
      const use = demand.amount * rail.liquidityMultiplier;
      const index = pools.findIndex((pool) => pool.currency === rail.sourceCurrency);
      pools[index] = reserveLiquidity(pools[index]!, use);
      capacityUsed.set(rail.id, (capacityUsed.get(rail.id) ?? 0) + demand.amount);
      modeledCost += demand.amount * (rail.costBps * market.fxCostMultiplier / 10_000) + rail.fixedCost;
      settlementTimeSeconds += rail.settlementTimeSeconds;
      riskScore = Math.max(riskScore, rail.riskScore);
      liquidityUsed += use;
    }
    const usedFlexibleRail = path.some((rail) => rail.tier === "liquidity-saver");
    routes.push({
      id: `ROUTE-${demand.id}`, sourceCurrency: demand.sourceCurrency, destinationCurrency: demand.destinationCurrency,
      amount: demand.amount, path: [demand.sourceCurrency, ...path.map((rail) => rail.destinationCurrency)],
      railIds: path.map((rail) => rail.id), modeledCost, settlementTimeSeconds, riskScore, liquidityUsed, valid: true,
      reason: usedFlexibleRail
        ? "Selected liquidity-saver capacity because the lower-cost standard path could not satisfy current liquidity or capacity constraints."
        : "Selected the lowest weighted-cost available path within liquidity, capacity, time, and risk constraints.",
    });
  }
  return { routes, pools, shortfalls };
}
