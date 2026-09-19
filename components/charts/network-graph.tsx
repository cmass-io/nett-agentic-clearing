"use client";

import { CURRENCIES, type Currency, type Match, type SettlementRoute } from "@/lib/types";

const NODE_POSITIONS: Record<Currency, { x: number; y: number }> = {
  USD: { x: 390, y: 190 }, EUR: { x: 190, y: 100 }, GBP: { x: 85, y: 220 },
  PHP: { x: 690, y: 310 }, MXN: { x: 160, y: 390 }, INR: { x: 570, y: 410 },
  JPY: { x: 720, y: 150 }, CAD: { x: 330, y: 65 }, BRL: { x: 350, y: 430 }, SGD: { x: 555, y: 90 },
};

const DEFAULT_LINKS: [Currency, Currency][] = [
  ["USD", "EUR"], ["USD", "PHP"], ["USD", "MXN"], ["EUR", "GBP"], ["EUR", "INR"],
  ["JPY", "SGD"], ["SGD", "PHP"], ["CAD", "USD"], ["BRL", "USD"], ["INR", "PHP"],
];

function line(source: Currency, destination: Currency) {
  return { from: NODE_POSITIONS[source], to: NODE_POSITIONS[destination] };
}

export function NetworkGraph({ matches, routes, active }: { matches: Match[]; routes: SettlementRoute[]; active: boolean }) {
  const routeEdges = routes.filter((route) => route.valid).flatMap((route) =>
    route.path.slice(0, -1).map((source, index) => ({ source, destination: route.path[index + 1]!, amount: route.amount })),
  ).slice(0, 16);
  const maxAmount = Math.max(1, ...routeEdges.map((edge) => edge.amount));
  const matchEdges = matches.slice(0, 12);

  return (
    <div className="network-graph-wrap">
      <div className="graph-meta"><span><i className="legend-dot gross" /> Matched flow</span><span><i className="legend-dot residual" /> Residual settlement</span></div>
      <svg className="network-graph" viewBox="0 0 800 500" role="img" aria-label="Currency clearing network graph">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="3.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#38f6a3" /></marker>
        </defs>
        {(active ? matchEdges : DEFAULT_LINKS.map(([currencyA, currencyB], index) => ({ currencyA, currencyB, id: String(index) }))).map((match) => {
          const points = line(match.currencyA, match.currencyB);
          return <line key={`m-${match.id}`} x1={points.from.x} y1={points.from.y} x2={points.to.x} y2={points.to.y} className="matched-edge" />;
        })}
        {active && routeEdges.map((edge, index) => {
          const points = line(edge.source, edge.destination);
          return <line key={`${edge.source}-${edge.destination}-${index}`} x1={points.from.x} y1={points.from.y} x2={points.to.x} y2={points.to.y} className="route-edge" strokeWidth={2 + (edge.amount / maxAmount) * 5} markerEnd="url(#arrow)" />;
        })}
        {CURRENCIES.map((currency) => {
          const position = NODE_POSITIONS[currency];
          const highlighted = active && routeEdges.some((edge) => edge.source === currency || edge.destination === currency);
          return (
            <g key={currency} transform={`translate(${position.x},${position.y})`} className={highlighted ? "currency-node active" : "currency-node"}>
              <circle r="30" /><circle className="node-ring" r="37" /><text y="5" textAnchor="middle">{currency}</text>
            </g>
          );
        })}
      </svg>
      {!active && <div className="graph-empty"><strong>Network awaiting obligations</strong><span>Run the clearing cycle to resolve live flows.</span></div>}
    </div>
  );
}
