"use client";

import { ChevronRight } from "lucide-react";
import type { AgentEvent } from "@/lib/types";

export function DecisionLog({ events }: { events: AgentEvent[] }) {
  return (
    <section className="panel decision-panel">
      <div className="panel-heading"><div><span className="eyebrow">AUDIT TRAIL</span><h2>Decision log</h2></div><span className="mono muted">{events.length} EVENTS</span></div>
      <div className="decision-list">
        {events.length === 0 ? <div className="feed-empty">Agent decisions appear here after execution.</div> : events.slice(-6).reverse().map((item, index) => (
          <details key={`${item.agent}-${item.action}-${index}`}>
            <summary><span className={`agent-dot ${item.agent}`} /><div><b>{item.agent}</b><strong>{item.action}</strong><small>{item.result}</small></div><span className="why">WHY? <ChevronRight size={13} /></span></summary>
            <p>{item.reasoning}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
