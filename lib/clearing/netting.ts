import { CURRENCIES, type CurrencyPosition, type ResidualFlow, type SettlementDemand } from "@/lib/types";

export function calculateNetPositions(residualFlows: ResidualFlow[]): {
  positions: CurrencyPosition[]; demands: SettlementDemand[]; conservationDelta: number; externalSettlement: number;
} {
  const totals = new Map(CURRENCIES.map((currency) => [currency, { outgoing: 0, incoming: 0 }]));
  for (const flow of residualFlows) {
    totals.get(flow.sourceCurrency)!.outgoing += flow.amount;
    totals.get(flow.destinationCurrency)!.incoming += flow.amount;
  }
  const positions = CURRENCIES.map((currency) => {
    const { outgoing, incoming } = totals.get(currency)!;
    return { currency, outgoing, incoming, netAmount: outgoing - incoming };
  });
  const positives = positions.filter((position) => position.netAmount > 0.005)
    .map((position) => ({ currency: position.currency, remaining: position.netAmount }));
  const negatives = positions.filter((position) => position.netAmount < -0.005)
    .map((position) => ({ currency: position.currency, remaining: -position.netAmount }));
  const demands: SettlementDemand[] = [];
  let sourceIndex = 0;
  let destinationIndex = 0;
  while (sourceIndex < positives.length && destinationIndex < negatives.length) {
    const source = positives[sourceIndex]!;
    const destination = negatives[destinationIndex]!;
    const amount = Math.min(source.remaining, destination.remaining);
    demands.push({ id: `NET-${source.currency}-${destination.currency}-${demands.length + 1}`, sourceCurrency: source.currency, destinationCurrency: destination.currency, amount });
    source.remaining -= amount;
    destination.remaining -= amount;
    if (source.remaining < 0.005) sourceIndex += 1;
    if (destination.remaining < 0.005) destinationIndex += 1;
  }
  const conservationDelta = Math.abs(positions.reduce((sum, position) => sum + position.netAmount, 0));
  const externalSettlement = positions.filter((position) => position.netAmount > 0)
    .reduce((sum, position) => sum + position.netAmount, 0);
  return { positions, demands, conservationDelta, externalSettlement };
}
