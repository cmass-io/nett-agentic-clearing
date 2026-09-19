"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileUp, Landmark, SlidersHorizontal, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNettStore } from "@/lib/agents/store";
import { calculateEconomics, DEFAULT_ASSUMPTIONS } from "@/lib/economics/model";
import type { ModelAssumptions } from "@/lib/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const fullUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function AnalysisWorkspace() {
  const metrics = useNettStore((state) => state.metrics);
  const runNetwork = useNettStore((state) => state.runNetwork);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const economics = useMemo(() => calculateEconomics(metrics, assumptions), [metrics, assumptions]);
  const hasRun = metrics.transactionCount > 0;
  const waterfall = [
    { name: "Gross", value: metrics.grossObligations },
    { name: "After matching", value: metrics.postMatchResidual },
    { name: "After netting", value: metrics.externalSettlement },
    { name: "External", value: metrics.externalSettlement },
  ];

  function update(key: keyof ModelAssumptions, value: number) {
    setAssumptions((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="page analysis-page">
      <section className="page-title-row">
        <div><span className="eyebrow"><Sparkles size={13} /> MODELLED ECONOMICS</span><h1>From gross obligations<br />to the buying moment.</h1><p>Every value below is calculated from the active clearing engine and editable assumptions—not a claim about market pricing.</p></div>
        {!hasRun && <button className="primary-button compact" onClick={() => void runNetwork()}>RUN DEFAULT NETWORK <ArrowRight size={16} /></button>}
      </section>

      <section className="analysis-grid">
        <div className="panel waterfall-panel">
          <div className="panel-heading"><div><span className="eyebrow">CAPITAL WATERFALL</span><h2>Obligation compression</h2></div><span className="data-label">ENGINE OUTPUT</span></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={waterfall} margin={{ top: 16, right: 12, left: 2, bottom: 0 }}>
                <CartesianGrid stroke="#183027" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#80988e", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => usd.format(value)} tick={{ fill: "#80988e", fontSize: 10 }} axisLine={false} tickLine={false} width={68} />
                <Tooltip formatter={(value) => fullUsd.format(Number(value))} contentStyle={{ background: "#0b1813", border: "1px solid #244638", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#38f6a3" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="waterfall-steps"><span>Gross obligations</span><ArrowRight /><span>Opposing flow matching</span><ArrowRight /><span>Multilateral netting</span><ArrowRight /><strong>External settlement</strong></div>
        </div>

        <aside className="panel assumptions-panel">
          <div className="panel-heading"><div><span className="eyebrow">EDITABLE INPUTS</span><h2>Model assumptions</h2></div><SlidersHorizontal size={18} /></div>
          {([
            ["traditionalSettlementBps", "Traditional settlement", "bps"],
            ["localSettlementBps", "Local settlement", "bps"],
            ["fxCostBps", "FX execution", "bps"],
            ["liquidityAnnualCostPct", "Liquidity annual cost", "%"],
            ["nettFeePctOfSavings", "NETT fee / savings", "%"],
          ] as const).map(([key, label, suffix]) => (
            <label className="assumption-row" key={key}><span>{label}<small>Modeled assumption</small></span><div><input type="number" min="0" step="0.1" value={assumptions[key]} onChange={(event) => update(key, Number(event.target.value))} /><b>{suffix}</b></div></label>
          ))}
          <button className="text-button reset" onClick={() => setAssumptions(DEFAULT_ASSUMPTIONS)}>Reset assumptions</button>
        </aside>
      </section>

      <section className="roi-section">
        <div className="roi-header"><div><span className="eyebrow">COMMERCIAL CASE</span><h2>Modeled daily cost comparison</h2></div><p>Based on this simulation run and your assumptions.</p></div>
        <div className="roi-grid">
          <article><span>WITHOUT NETT</span><strong>{hasRun ? fullUsd.format(economics.withoutNett) : "—"}</strong><small>Gross transaction-by-transaction model</small></article>
          <article><span>WITH NETT</span><strong>{hasRun ? fullUsd.format(economics.withNett) : "—"}</strong><small>Optimized settlement + NETT fee</small></article>
          <article className="savings"><span>CUSTOMER NET SAVINGS</span><strong>{hasRun ? fullUsd.format(economics.customerNetSavings) : "—"}</strong><small>Gross savings {fullUsd.format(economics.grossSavings)} − fee {fullUsd.format(economics.nettFee)}</small></article>
        </div>
      </section>

      <section className="buying-moment">
        <div className="buying-icon"><Landmark size={28} /></div><div><span className="eyebrow">READY TO TEST YOUR NETWORK?</span><h2>Deploy NETT on Your Payment Network</h2><p>Run historical obligations through the same deterministic pipeline without changing code.</p></div>
        <div className="buying-actions"><Link href="/" className="primary-button compact"><FileUp size={16} /> Upload payment data</Link><a className="secondary-button" href="mailto:integration@nett.example">Request integration</a></div>
      </section>
    </div>
  );
}
