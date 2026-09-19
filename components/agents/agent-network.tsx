"use client";

import { Bot, CircleDollarSign, Database, GitCompareArrows, Route, ScanSearch, Sparkles } from "lucide-react";
import { useNettStore } from "@/lib/agents/store";
import type { AgentName } from "@/lib/types";

const AGENT_SPECS = [
  { id: "orchestrator" as AgentName, name: "Orchestrator", icon: Bot, objective: "Fulfill every obligation while minimizing external settlement and modeled cost.", tools: ["getNetworkState", "invokeAgent", "validatePlan"], reads: "All shared state", writes: "Sequence + decision log" },
  { id: "matching" as AgentName, name: "Matching Agent", icon: GitCompareArrows, objective: "Find and offset reciprocal currency flows using real corridor aggregation.", tools: ["aggregateCorridors", "matchOpposingFlows"], reads: "Payment intents", writes: "Matches + residuals" },
  { id: "netting" as AgentName, name: "Netting Agent", icon: ScanSearch, objective: "Resolve conserved multilateral positions and minimum settlement demands.", tools: ["calculatePositions", "validateConservation"], reads: "Residual flows", writes: "Positions + demands" },
  { id: "liquidity" as AgentName, name: "Liquidity Agent", icon: CircleDollarSign, objective: "Protect reserve floors and surface shortfalls before route execution.", tools: ["checkLiquidity", "reserveLiquidity", "identifyShortfalls"], reads: "Demands + pools", writes: "Reservations + alerts" },
  { id: "routing" as AgentName, name: "Routing Agent", icon: Route, objective: "Choose deterministic lowest-weight valid paths under every active constraint.", tools: ["findPath", "scoreRail", "reserveCapacity"], reads: "Demands + rails + pools", writes: "Routes + modeled cost" },
];

export function AgentNetwork() {
  const store = useNettStore();
  const hasRun = store.metrics.transactionCount > 0;
  return (
    <div className="page agents-page">
      <section className="page-title-row"><div><span className="eyebrow"><Sparkles size={13} /> MULTI-AGENT CONTROL PLANE</span><h1>One objective.<br />Five specialized agents.</h1><p>Every agent reads and writes the same inspectable state. No monetary calculation is delegated to an LLM.</p></div>{!hasRun && <button className="primary-button compact" onClick={() => void store.runNetwork()}>RUN DEFAULT NETWORK</button>}</section>
      <section className="agent-card-grid">
        {AGENT_SPECS.map(({ id, name, icon: Icon, objective, tools, reads, writes }) => {
          const latest = [...store.agentEvents].reverse().find((event) => event.agent === id);
          return <article className={`panel agent-card ${store.activeAgent === id ? "working" : ""}`} key={id}>
            <div className="agent-card-head"><span className="agent-card-icon"><Icon size={21} /></span><div><span className="eyebrow">AGENT 0{AGENT_SPECS.findIndex((item) => item.id === id) + 1}</span><h2>{name}</h2></div><span className="agent-state done">{latest ? "COMPLETE" : "READY"}</span></div>
            <p>{objective}</p>
            <div className="tool-chips">{tools.map((tool) => <code key={tool}>{tool}()</code>)}</div>
            <dl><div><dt>MEMORY READS</dt><dd>{reads}</dd></div><div><dt>MEMORY WRITES</dt><dd>{writes}</dd></div><div><dt>LAST DECISION</dt><dd>{latest?.action ?? "Awaiting execution"}</dd></div><div><dt>EXECUTION</dt><dd>{latest ? `${latest.durationMs.toFixed(2)} ms` : "—"}</dd></div></dl>
          </article>;
        })}
      </section>
      <section className="panel memory-inspector">
        <div className="panel-heading"><div><span className="eyebrow">SHARED MEMORY</span><h2>Network state inspector</h2></div><span className="live-chip"><i /> {store.simulationStatus.toUpperCase()}</span></div>
        <div className="memory-grid">
          <div><Database size={18} /><span>PAYMENT INTENTS</span><strong>{store.metrics.transactionCount.toLocaleString()}</strong><small>{store.dataSource.toUpperCase()} source</small></div>
          <div><GitCompareArrows size={18} /><span>MATCHED PAIRS</span><strong>{store.matchedPairs.length}</strong><small>{store.residualFlows.length} residual corridors</small></div>
          <div><ScanSearch size={18} /><span>NET POSITIONS</span><strong>{store.currencyPositions.filter((item) => Math.abs(item.netAmount) > 0.005).length}</strong><small>Δ {store.metrics.conservationDelta.toFixed(6)}</small></div>
          <div><CircleDollarSign size={18} /><span>LIQUIDITY ALERTS</span><strong>{store.shortfalls.length}</strong><small>{store.liquidityPools.filter((pool) => pool.reserved > 0).length} pools reserved</small></div>
          <div><Route size={18} /><span>VALID ROUTES</span><strong>{store.settlementRoutes.filter((route) => route.valid).length}</strong><small>{store.metrics.validPlan ? "Plan validated" : "Awaiting plan"}</small></div>
          <div><Bot size={18} /><span>DECISIONS</span><strong>{store.agentEvents.length}</strong><small>{store.marketConditions.shockScenario ? "1 market event" : "No market events"}</small></div>
        </div>
        <div className="memory-stream"><span>STATE SNAPSHOT</span><code>{JSON.stringify({ status: store.simulationStatus, transactionCount: store.metrics.transactionCount, matchedPairs: store.matchedPairs.length, externalSettlement: Math.round(store.metrics.externalSettlement), validPlan: store.metrics.validPlan, shock: store.marketConditions.shockScenario }, null, 2)}</code></div>
      </section>
    </div>
  );
}
