export const CURRENCIES = [
  "USD", "EUR", "GBP", "PHP", "MXN", "INR", "JPY", "CAD", "BRL", "SGD",
] as const;

export type Currency = (typeof CURRENCIES)[number];
export type AgentName = "orchestrator" | "matching" | "netting" | "liquidity" | "routing";
export type SimulationStatus = "idle" | "processing" | "optimized" | "shock" | "reoptimizing";
export type ShockScenario = "php-liquidity" | "usd-php-rail" | "fx-spike" | "institution-capacity";

export interface PaymentIntent {
  id: string;
  sourceCountry: string;
  destinationCountry: string;
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  sourceInstitution: string;
  destinationInstitution: string;
  amount: number;
  timestamp: number;
  priority: "standard" | "priority";
  status: "pending" | "matched" | "netted" | "routed" | "settled";
  maxSettlementTimeMinutes: number;
}

export interface CurrencyPosition {
  currency: Currency;
  outgoing: number;
  incoming: number;
  netAmount: number;
}

export interface LiquidityPool {
  currency: Currency;
  available: number;
  reserved: number;
  reserveFloor: number;
}

export interface Match {
  id: string;
  currencyA: Currency;
  currencyB: Currency;
  aToB: number;
  bToA: number;
  matchedAmount: number;
}

export interface ResidualFlow {
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  amount: number;
}

export interface SettlementDemand extends ResidualFlow {
  id: string;
}

export interface SettlementRail {
  id: string;
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  costBps: number;
  fixedCost: number;
  settlementTimeSeconds: number;
  capacity: number;
  available: boolean;
  riskScore: number;
  tier: "standard" | "liquidity-saver";
  liquidityMultiplier: number;
}

export interface SettlementRoute {
  id: string;
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  amount: number;
  path: Currency[];
  railIds: string[];
  modeledCost: number;
  settlementTimeSeconds: number;
  riskScore: number;
  liquidityUsed: number;
  valid: boolean;
  reason: string;
}

export interface AgentEvent {
  timestamp: number;
  agent: AgentName;
  action: string;
  reasoning: string;
  result: string;
  durationMs: number;
}

export interface MarketConditions {
  shockScenario: ShockScenario | null;
  fxCostMultiplier: number;
  unavailableRailIds: string[];
  description: string;
}

export interface NetworkTimings {
  generationMs: number;
  matchingMs: number;
  nettingMs: number;
  liquidityMs: number;
  routingMs: number;
  shockRecoveryMs: number;
  totalMs: number;
}

export interface NetworkMetrics {
  grossObligations: number;
  matchedVolume: number;
  postMatchResidual: number;
  nettedVolume: number;
  externalSettlement: number;
  settlementReductionPct: number;
  modeledSettlementCost: number;
  conservationDelta: number;
  routeCount: number;
  validPlan: boolean;
  transactionCount: number;
  timings: NetworkTimings;
}

export interface ShockComparison {
  scenario: ShockScenario;
  previousSettlement: number;
  newSettlement: number;
  previousCost: number;
  newCost: number;
  additionalCost: number;
  recoveryMs: number;
}

export interface NetworkState {
  paymentIntents: PaymentIntent[];
  currencyPositions: CurrencyPosition[];
  liquidityPools: LiquidityPool[];
  matchedPairs: Match[];
  residualFlows: ResidualFlow[];
  settlementDemands: SettlementDemand[];
  settlementRoutes: SettlementRoute[];
  rails: SettlementRail[];
  agentEvents: AgentEvent[];
  marketConditions: MarketConditions;
  metrics: NetworkMetrics;
  simulationStatus: SimulationStatus;
  activeAgent: AgentName | null;
  shortfalls: string[];
  shockComparison: ShockComparison | null;
  seed: number;
  dataSource: "simulated" | "csv";
}

export interface ModelAssumptions {
  traditionalSettlementBps: number;
  localSettlementBps: number;
  fxCostBps: number;
  liquidityAnnualCostPct: number;
  nettFeePctOfSavings: number;
}
