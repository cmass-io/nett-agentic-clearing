"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowDownToLine, ArrowUpRight, CircleDollarSign, Clock3, FileUp, Gauge,
  Play, RotateCw, ShieldCheck, Sparkles, TriangleAlert, Workflow,
} from "lucide-react";
import { useNettStore } from "@/lib/agents/store";
import type { ShockScenario } from "@/lib/types";
import { MetricCard } from "@/components/ui/metric-card";
import { NetworkGraph } from "@/components/charts/network-graph";
import { ActiveAgents } from "@/components/agents/active-agents";
import { PaymentFeed } from "@/components/transactions/payment-feed";
import { DecisionLog } from "@/components/dashboard/decision-log";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("en-US");

const SHOCKS: { value: ShockScenario; label: string }[] = [
  { value: "php-liquidity", label: "PHP Liquidity Crisis" },
  { value: "usd-php-rail", label: "USD→PHP Rail Failure" },
  { value: "fx-spike", label: "FX Cost Spike" },
  { value: "institution-capacity", label: "Institution Capacity Failure" },
];

const GUIDED_STEPS = [
  "Run 100K simulated obligations",
  "Show obligation compression",
  "Trigger PHP liquidity crisis",
  "Validate autonomous recovery",
];

type GuidedDemoStage = "idle" | "running" | "compressed" | "shocking" | "recovered";

const GUIDE_COPY: Record<GuidedDemoStage, string> = {
  idle: "",
  running: "Step 1 of 4 — agents are clearing 100K simulated obligations.",
  compressed: "Step 2 of 4 — external settlement has been compressed. Preparing the market event.",
  shocking: "Step 3 of 4 — PHP liquidity has changed. Agents are autonomously reoptimizing.",
  recovered: "Step 4 of 4 — recovery validated. Open the ROI screen to close the commercial story.",
};

export function Dashboard() {
  const store = useNettStore();
  const [showUpload, setShowUpload] = useState(false);
  const [guidedStage, setGuidedStage] = useState<GuidedDemoStage>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = store.simulationStatus === "processing" || store.simulationStatus === "shock" || store.simulationStatus === "reoptimizing";
  const guidedInProgress = guidedStage === "running" || guidedStage === "compressed" || guidedStage === "shocking";
  const controlsBusy = isBusy || guidedInProgress;
  const hasRun = store.paymentIntents.length > 0;

  async function onFile(file?: File) {
    if (!file) return;
    setGuidedStage("idle");
    await store.uploadCsv(await file.text());
    setShowUpload(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runNetwork() {
    setGuidedStage("idle");
    await store.runNetwork();
  }

  async function introduceMarketShock() {
    setGuidedStage("idle");
    await store.introduceShock();
  }

  async function runGuidedDemo() {
    if (controlsBusy) return;
    store.setTransactionPreset(100_000);
    store.setSelectedShock("php-liquidity");
    setShowUpload(false);
    setGuidedStage("running");
    await store.runNetwork();
    setGuidedStage("compressed");
    await new Promise((resolve) => window.setTimeout(resolve, 1_150));
    setGuidedStage("shocking");
    await store.introduceShock();
    setGuidedStage("recovered");
  }

  return (
    <div className="page dashboard-page">
      <section className="hero-line">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> GLOBAL OBLIGATION OPTIMIZATION</span>
          <h1>Clear the network.<br /><span>Settle only the difference.</span></h1>
          <p>Specialized agents collectively match, net, validate liquidity, and route cross-border obligations through one auditable shared state.</p>
        </div>
        <div className="run-console">
          <div className="console-row">
            <label>TRANSACTIONS<select value={store.transactionPreset} onChange={(event) => store.setTransactionPreset(Number(event.target.value))} disabled={controlsBusy}>
              {[10_000, 50_000, 100_000, 250_000].map((count) => <option value={count} key={count}>{number.format(count)}</option>)}
            </select></label>
            <label>SCENARIO<select value={store.selectedShock} onChange={(event) => store.setSelectedShock(event.target.value as ShockScenario)} disabled={controlsBusy}>
              {SHOCKS.map((scenario) => <option value={scenario.value} key={scenario.value}>{scenario.label}</option>)}
            </select></label>
          </div>
          <button className="primary-button" onClick={() => void runNetwork()} disabled={controlsBusy}>
            {isBusy && store.simulationStatus === "processing" ? <RotateCw className="spin" size={17} /> : <Play size={17} fill="currentColor" />}
            {isBusy && store.simulationStatus === "processing" ? `RUNNING ${store.activeAgent?.toUpperCase() ?? "NETWORK"}` : "RUN NETWORK"}
          </button>
          <button className="guided-demo-button" onClick={() => void runGuidedDemo()} disabled={controlsBusy}>
            <Sparkles size={15} /> {guidedInProgress ? "GUIDED DEMO RUNNING" : guidedStage === "recovered" ? "RUN GUIDED DEMO AGAIN" : "GUIDED 2-MIN DEMO"}
          </button>
          <button className="text-button" onClick={() => setShowUpload((value) => !value)}><FileUp size={15} /> Upload payment CSV</button>
          {showUpload && <div className="upload-popover">
            <input ref={inputRef} type="file" accept=".csv,text/csv" aria-label="Upload payment CSV" onChange={(event) => void onFile(event.target.files?.[0])} />
            <a href="/sample-payments.csv" download><ArrowDownToLine size={14} /> Download sample CSV</a>
          </div>}
          {store.error && <p className="error-message">{store.error}</p>}
        </div>
      </section>

      {guidedStage !== "idle" && <section className={`guided-demo ${guidedStage}`} aria-live="polite">
        <div className="guide-intro"><span className="eyebrow"><Sparkles size={13} /> JUDGE MODE</span><strong>{GUIDE_COPY[guidedStage]}</strong></div>
        <ol className="guide-steps">
          {GUIDED_STEPS.map((label, index) => {
            const stageIndex = guidedStage === "running" ? 0 : guidedStage === "compressed" ? 1 : guidedStage === "shocking" ? 2 : 3;
            const complete = index < stageIndex || guidedStage === "recovered";
            const current = index === stageIndex && guidedStage !== "recovered";
            return <li className={complete ? "complete" : current ? "current" : ""} key={label}><span>{complete ? "✓" : index + 1}</span>{label}</li>;
          })}
        </ol>
        {guidedStage === "recovered" && <Link className="guide-roi-link" href="/analysis">OPEN ROI ANALYSIS <ArrowUpRight size={15} /></Link>}
      </section>}

      <section className="metric-grid">
        <MetricCard label="Gross obligations" value={hasRun ? usd.format(store.metrics.grossObligations) : "—"} detail={hasRun ? `${number.format(store.metrics.transactionCount)} intents / USD-equivalent` : "Awaiting network run"} icon={Activity} />
        <MetricCard label="Matched / offset" value={hasRun ? usd.format(store.metrics.matchedVolume + store.metrics.nettedVolume) : "—"} detail={hasRun ? `${store.matchedPairs.length} opposing currency pairs` : "Deterministic bilateral + multilateral"} icon={Workflow} />
        <MetricCard label="External settlement" value={hasRun ? usd.format(store.metrics.externalSettlement) : "—"} detail={hasRun ? `${store.metrics.routeCount} optimized settlement routes` : "Constrained routing result"} icon={CircleDollarSign} accent />
        <MetricCard label="Settlement reduction" value={hasRun ? `${store.metrics.settlementReductionPct.toFixed(1)}%` : "—"} detail={hasRun ? `Conservation delta ${store.metrics.conservationDelta.toFixed(6)}` : "Measured, never hard-coded"} icon={Gauge} />
      </section>

      <section className="dashboard-grid">
        <div className="panel graph-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">CLEARING TOPOLOGY</span><h2>Currency network</h2></div>
            <div className="plan-status">{hasRun && <><ShieldCheck size={15} /> {store.metrics.validPlan ? "VALID PLAN" : "REVIEW REQUIRED"}</>}</div>
          </div>
          <NetworkGraph matches={store.matchedPairs} routes={store.settlementRoutes} active={hasRun} />
          {hasRun && <div className="timing-strip">
            <span><b>{store.metrics.timings.generationMs.toFixed(1)}ms</b> Generate</span>
            <span><b>{store.metrics.timings.matchingMs.toFixed(1)}ms</b> Match</span>
            <span><b>{store.metrics.timings.nettingMs.toFixed(1)}ms</b> Net</span>
            <span><b>{store.metrics.timings.routingMs.toFixed(1)}ms</b> Route</span>
            <span><b>{store.metrics.timings.totalMs.toFixed(1)}ms</b> Engine total</span>
          </div>}
        </div>
        <ActiveAgents events={store.agentEvents} activeAgent={store.activeAgent} hasRun={hasRun} />
      </section>

      {hasRun && <section className={`shock-bar ${store.shockComparison ? "shocked" : ""}`}>
        <div className="shock-icon">{store.shockComparison ? <TriangleAlert size={21} /> : <Clock3 size={21} />}</div>
        <div><span className="eyebrow">AUTONOMOUS RESILIENCE TEST</span><strong>{store.shockComparison ? SHOCKS.find((item) => item.value === store.shockComparison?.scenario)?.label : "Plan validated under current market conditions"}</strong><p>{store.shockComparison ? store.marketConditions.description : "Introduce a market event. Agents will detect, coordinate, and produce a new valid plan without further input."}</p></div>
        {store.shockComparison ? <div className="shock-metrics">
          <span>PREVIOUS <b>{usd.format(store.shockComparison.previousSettlement)}</b></span>
          <span>NEW <b>{usd.format(store.shockComparison.newSettlement)}</b></span>
          <span>Δ COST <b>{usd.format(store.shockComparison.additionalCost)}</b></span>
          <span>RECOVERY <b>{store.shockComparison.recoveryMs.toFixed(1)}ms</b></span>
        </div> : <button className="shock-button" onClick={() => void introduceMarketShock()} disabled={controlsBusy}><TriangleAlert size={16} /> INTRODUCE MARKET SHOCK <ArrowUpRight size={15} /></button>}
      </section>}

      <section className="lower-grid">
        <PaymentFeed payments={store.paymentIntents} />
        <DecisionLog events={store.agentEvents} />
      </section>
    </div>
  );
}
