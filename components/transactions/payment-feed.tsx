"use client";

import type { PaymentIntent } from "@/lib/types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PaymentFeed({ payments }: { payments: PaymentIntent[] }) {
  return (
    <section className="panel feed-panel">
      <div className="panel-heading"><div><span className="eyebrow">INGESTION STREAM</span><h2>Payment intents</h2></div><span className="data-label">SIMULATED DATA</span></div>
      <div className="feed-table" role="table" aria-label="Recent payment intents">
        <div className="feed-row feed-head" role="row"><span>ID</span><span>Corridor</span><span>Institution</span><span>USD-eq amount</span><span>Status</span></div>
        {payments.length === 0 ? (
          <div className="feed-empty">No intents ingested. Select a preset and run the network.</div>
        ) : payments.slice(0, 7).map((payment) => (
          <div className="feed-row" role="row" key={payment.id}>
            <span className="mono muted">{payment.id.slice(-10)}</span>
            <span><b>{payment.sourceCurrency}</b><em>→</em><b>{payment.destinationCurrency}</b></span>
            <span className="truncate">{payment.sourceInstitution}</span>
            <span className="mono">{money.format(payment.amount)}</span>
            <span className="status-pill">{payment.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
