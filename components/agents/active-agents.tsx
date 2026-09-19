"use client";

import { Bot, CircleDollarSign, GitCompareArrows, Route, ScanSearch } from "lucide-react";
import type { AgentEvent, AgentName } from "@/lib/types";

const AGENTS = [
  { id: "orchestrator" as AgentName, name: "Orchestrator", icon: Bot },
  { id: "matching" as AgentName, name: "Matching", icon: GitCompareArrows },
  { id: "netting" as AgentName, name: "Netting", icon: ScanSearch },
  { id: "liquidity" as AgentName, name: "Liquidity", icon: CircleDollarSign },
  { id: "routing" as AgentName, name: "Routing", icon: Route },
];

export function ActiveAgents({ events, activeAgent, hasRun }: { events: AgentEvent[]; activeAgent: AgentName | null; hasRun: boolean }) {
  return (
    <section className="panel agent-panel">
      <div className="panel-heading"><div><span className="eyebrow">CONTROL PLANE</span><h2>Active agents</h2></div><span className="live-chip"><i /> LIVE</span></div>
      <div className="agent-list">
        {AGENTS.map(({ id, name, icon: Icon }) => {
          const latest = [...events].reverse().find((item) => item.agent === id);
          const isActive = activeAgent === id;
          return (
            <article className={`agent-row ${isActive ? "working" : ""}`} key={id}>
              <div className="agent-icon"><Icon size={17} /></div>
              <div><strong>{name}</strong><span>{isActive ? "Executing state transition…" : latest?.action ?? "Standing by"}</span></div>
              <span className={`agent-state ${isActive ? "processing" : hasRun ? "done" : "idle"}`}>{isActive ? "RUNNING" : hasRun ? "DONE" : "IDLE"}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
