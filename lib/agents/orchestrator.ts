import { calculateNetPositions } from "@/lib/clearing/netting";
import { matchOpposingFlows } from "@/lib/clearing/matching";
import { createLiquidityPools, identifyShortfalls } from "@/lib/liquidity/pools";
import { createSettlementRails } from "@/lib/routing/rails";
import { optimizeSettlementRoutes } from "@/lib/routing/optimizer";
import { generatePaymentIntents } from "@/lib/simulation/generator";
import type {
  AgentEvent, Currency, LiquidityPool, MarketConditions, NetworkMetrics, NetworkState,
  PaymentIntent, SettlementRail, ShockScenario,
} from "@/lib/types";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export const DEFAULT_MARKET: MarketConditions = {
  shockScenario: null,
  fxCostMultiplier: 1,
  unavailableRailIds: [],
  description: "Normal simulated market conditions",
};

const emptyTimings = () => ({
  generationMs: 0, matchingMs: 0, nettingMs: 0, liquidityMs: 0, routingMs: 0, shockRecoveryMs: 0, totalMs: 0,
});

export function createEmptyNetworkState(): NetworkState {
  return {
    paymentIntents: [], currencyPositions: [], liquidityPools: createLiquidityPools(), matchedPairs: [],
    residualFlows: [], settlementDemands: [], settlementRoutes: [], rails: createSettlementRails(), agentEvents: [],
    marketConditions: DEFAULT_MARKET, metrics: {
      grossObligations: 0, matchedVolume: 0, postMatchResidual: 0, nettedVolume: 0, externalSettlement: 0,
      settlementReductionPct: 0, modeledSettlementCost: 0, conservationDelta: 0, routeCount: 0,
      validPlan: false, transactionCount: 0, timings: emptyTimings(),
    }, simulationStatus: "idle", activeAgent: null, shortfalls: [], shockComparison: null,
    seed: 2047, dataSource: "simulated",
  };
}

function event(agent: AgentEvent["agent"], action: string, reasoning: string, result: string, durationMs: number): AgentEvent {
  return { timestamp: Date.now(), agent, action, reasoning, result, durationMs };
}

function runPipeline(
  payments: PaymentIntent[],
  generationMs: number,
  seed: number,
  dataSource: NetworkState["dataSource"],
  market: MarketConditions,
  rails: SettlementRail[],
  pools: LiquidityPool[],
  shockRecoveryMs = 0,
): NetworkState {
  const totalStart = now();

  const matchingStart = now();
  const matching = matchOpposingFlows(payments);
  const matchingMs = now() - matchingStart;

  const nettingStart = now();
  const netting = calculateNetPositions(matching.residualFlows);
  const nettingMs = now() - nettingStart;

  const liquidityStart = now();
  const requirements: Partial<Record<Currency, number>> = {};
  for (const demand of netting.demands) {
    requirements[demand.sourceCurrency] = (requirements[demand.sourceCurrency] ?? 0) + demand.amount;
  }
  const detectedShortfalls = identifyShortfalls(pools, requirements);
  const liquidityMs = now() - liquidityStart;

  const routingStart = now();
  const routing = optimizeSettlementRoutes(netting.demands, rails, pools, market);
  const routingMs = now() - routingStart;
  const shortfalls = [...detectedShortfalls, ...routing.shortfalls];
  const modeledSettlementCost = routing.routes.reduce((sum, route) => sum + route.modeledCost, 0);
  const postMatchResidual = matching.grossObligations - matching.matchedVolume;
  const nettedVolume = Math.max(0, postMatchResidual - netting.externalSettlement);
  const routedTotal = routing.routes.filter((route) => route.valid).reduce((sum, route) => sum + route.amount, 0);
  const validPlan = routing.routes.every((route) => route.valid)
    && Math.abs(routedTotal - netting.externalSettlement) < 0.01
    && netting.conservationDelta < 0.01;

  const timings = {
    generationMs,
    matchingMs,
    nettingMs,
    liquidityMs,
    routingMs,
    shockRecoveryMs,
    totalMs: now() - totalStart + generationMs,
  };
  const metrics: NetworkMetrics = {
    grossObligations: matching.grossObligations,
    matchedVolume: matching.matchedVolume,
    postMatchResidual,
    nettedVolume,
    externalSettlement: netting.externalSettlement,
    settlementReductionPct: matching.grossObligations > 0
      ? (1 - netting.externalSettlement / matching.grossObligations) * 100 : 0,
    modeledSettlementCost,
    conservationDelta: netting.conservationDelta,
    routeCount: routing.routes.length,
    validPlan,
    transactionCount: payments.length,
    timings,
  };

  const agentEvents: AgentEvent[] = [
    event("orchestrator", "Inspect shared network state", "Start with all obligations and choose deterministic clearing tools in dependency order.", `${payments.length.toLocaleString()} obligations accepted`, 0),
    event("matching", "Match opposing corridors", "Offset reciprocal flows before consuming external liquidity.", `${matching.matchedPairs.length} currency pairs matched; ${matching.matchedVolume.toFixed(0)} gross volume removed`, matchingMs),
    event("netting", "Calculate multilateral positions", "Collapse corridor residuals into conserved currency-level positions.", `${netting.demands.length} settlement demands; conservation delta ${netting.conservationDelta.toFixed(6)}`, nettingMs),
    event("liquidity", "Validate deployable balances", "Test net requirements against available pools and reserve floors.", detectedShortfalls.length ? `${detectedShortfalls.length} standard-liquidity shortfall(s); flexible capacity required` : "All standard liquidity checks passed", liquidityMs),
    event("routing", "Optimize settlement paths", "Minimize weighted cost, time, liquidity consumption, capacity, and risk without LLM arithmetic.", `${routing.routes.filter((route) => route.valid).length}/${routing.routes.length} valid routes; modeled cost ${modeledSettlementCost.toFixed(0)}`, routingMs),
    event("orchestrator", "Validate settlement plan", "Reread shared state and confirm routing coverage plus conservation.", validPlan ? "Objective satisfied: every net obligation has a valid route" : "Exception surfaced: plan requires operator review", 0),
  ];

  return {
    paymentIntents: payments.map((payment) => ({ ...payment, status: validPlan ? "routed" : "netted" })),
    currencyPositions: netting.positions,
    liquidityPools: routing.pools,
    matchedPairs: matching.matchedPairs,
    residualFlows: matching.residualFlows,
    settlementDemands: netting.demands,
    settlementRoutes: routing.routes,
    rails,
    agentEvents,
    marketConditions: market,
    metrics,
    simulationStatus: "optimized",
    activeAgent: null,
    shortfalls,
    shockComparison: null,
    seed,
    dataSource,
  };
}

export function runSyntheticNetwork(count = 100_000, seed = 2047): NetworkState {
  const generationStart = now();
  const payments = generatePaymentIntents(count, seed);
  const generationMs = now() - generationStart;
  return runPipeline(payments, generationMs, seed, "simulated", DEFAULT_MARKET, createSettlementRails(), createLiquidityPools());
}

export function runUploadedNetwork(payments: PaymentIntent[]): NetworkState {
  return runPipeline(payments, 0, 0, "csv", DEFAULT_MARKET, createSettlementRails(), createLiquidityPools());
}

function applyShockConditions(state: NetworkState, scenario: ShockScenario): {
  market: MarketConditions; rails: SettlementRail[]; pools: LiquidityPool[];
} {
  let rails = state.rails.map((rail) => ({ ...rail, available: true, capacity: rail.tier === "standard" ? 500_000_000 : 2_500_000_000 }));
  let pools = createLiquidityPools();
  let description = "";
  let fxCostMultiplier = 1;

  if (scenario === "php-liquidity") {
    const phpRequirement = state.settlementDemands
      .filter((demand) => demand.sourceCurrency === "PHP")
      .reduce((sum, demand) => sum + demand.amount, 0);
    pools = pools.map((pool) => pool.currency === "PHP"
      ? { ...pool, available: pool.reserveFloor + Math.max(1_000_000, phpRequirement * 0.035) }
      : pool);
    description = "PHP deployable liquidity reduced below the standard-route requirement.";
  } else if (scenario === "usd-php-rail") {
    rails = rails.map((rail) => rail.tier === "standard"
      && ((rail.sourceCurrency === "USD" && rail.destinationCurrency === "PHP")
        || (rail.sourceCurrency === "PHP" && rail.destinationCurrency === "USD"))
      ? { ...rail, available: false } : rail);
    description = "Primary USD-PHP standard rail marked unavailable.";
  } else if (scenario === "fx-spike") {
    fxCostMultiplier = 2.4;
    description = "Modeled FX execution costs increased 140%.";
  } else {
    rails = rails.map((rail) => rail.tier === "standard" ? { ...rail, capacity: 3_000_000 } : rail);
    description = "Standard institutional rail capacity reduced to $3M per corridor.";
  }

  const market: MarketConditions = {
    shockScenario: scenario,
    fxCostMultiplier,
    unavailableRailIds: rails.filter((rail) => !rail.available).map((rail) => rail.id),
    description,
  };
  return { market, rails, pools };
}

export function reoptimizeAfterShock(state: NetworkState, scenario: ShockScenario): NetworkState {
  const recoveryStart = now();
  const { market, rails, pools } = applyShockConditions(state, scenario);
  const next = runPipeline(state.paymentIntents.map((payment) => ({ ...payment, status: "pending" })), 0, state.seed, state.dataSource, market, rails, pools);
  const recoveryMs = now() - recoveryStart;
  next.metrics.timings.shockRecoveryMs = recoveryMs;
  next.metrics.timings.totalMs += recoveryMs;
  next.agentEvents = [
    event("liquidity", "Detect market shock", "Continuously compare deployable balances and rail health with current net requirements.", market.description, 0),
    event("orchestrator", "Reopen optimization loop", "The shared market state changed, so the existing plan is no longer assumed valid.", "Matching, netting, liquidity, and routing agents reinvoked", 0),
    ...next.agentEvents.slice(1),
  ];
  next.shockComparison = {
    scenario,
    previousSettlement: state.metrics.externalSettlement,
    newSettlement: next.metrics.externalSettlement,
    previousCost: state.metrics.modeledSettlementCost,
    newCost: next.metrics.modeledSettlementCost,
    additionalCost: next.metrics.modeledSettlementCost - state.metrics.modeledSettlementCost,
    recoveryMs,
  };
  return next;
}
