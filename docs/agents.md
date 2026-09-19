# Agent system

The orchestration loop is `observe shared state → select deterministic tool → invoke specialized agent → reread state → continue or surface exception`.

## Orchestrator

Coordinates generation/ingestion, matching, netting, liquidity, routing, and final validation. Its deterministic fallback is always available, so the demo has no model or network dependency.

## Matching agent

Reads payment intents; writes reciprocal matches and residual corridor flows. The matched metric counts the gross obligations removed on both sides.

## Netting agent

Reads residuals; writes currency positions and minimized demands. It explicitly calculates `abs(sum(net positions))` as the conservation delta.

## Liquidity agent

Reads demands and pool balances; writes reservations and alerts. `checkLiquidity`, `reserveLiquidity`, `releaseLiquidity`, and `identifyShortfalls` are pure, tested functions.

## Routing agent

Reads demands, rail attributes, liquidity, capacity, and market conditions. It excludes invalid edges, scores eligible edges by modeled cost/time/risk, and returns a decision reason used by every **WHY?** control.

## Shock response

A shock first changes shared market state. The liquidity agent detects it, the orchestrator reopens the loop, and all clearing stages rerun automatically. Previous/new settlement, previous/new modeled cost, incremental cost, and measured recovery time are retained together.
