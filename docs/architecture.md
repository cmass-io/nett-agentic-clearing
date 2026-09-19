# Architecture

NETT is a single Next.js App Router application with an in-memory shared state. This choice keeps the live demo reliable while preserving clear production seams.

## Execution path

1. `generator.ts` creates reproducible payment intents with Mulberry32 and seed `2047`, or `csv.ts` validates uploaded rows.
2. `matching.ts` aggregates directed currency corridors and offsets reciprocal flows.
3. `netting.ts` calculates signed currency positions, verifies conservation, and creates positive-to-negative settlement demands.
4. `pools.ts` checks deployable balances above currency reserve floors.
5. `optimizer.ts` uses weighted deterministic shortest-path search across modeled rails. Unavailable, over-capacity, or under-funded edges are excluded before scoring.
6. `orchestrator.ts` records decisions and validates that valid route totals equal calculated external settlement.
7. `store.ts` publishes the same state to the dashboard, agent network, and economics analysis.

## Invariants

- Source and destination currencies differ.
- Payment amounts are positive USD-equivalent reporting values.
- Net currency positions sum to zero within one cent.
- A reservation never breaches a pool reserve floor.
- A route never uses an unavailable or over-capacity rail.
- A valid plan covers every external settlement demand exactly within one cent.

## Production extension points

Persistence can replace Zustand state; ingestion can move behind authenticated APIs; rail and liquidity inputs can come from approved institution adapters; the objective can add compliance and counterparty policies. An LLM may recommend the next orchestration action or narrate the state, but calculation and validation should remain deterministic.
