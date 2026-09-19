import type { Currency, Match, PaymentIntent, ResidualFlow } from "@/lib/types";

export function matchOpposingFlows(payments: PaymentIntent[]): {
  matchedPairs: Match[]; residualFlows: ResidualFlow[]; matchedVolume: number; grossObligations: number;
} {
  const directed = new Map<string, number>();
  let grossObligations = 0;
  for (const payment of payments) {
    const key = `${payment.sourceCurrency}->${payment.destinationCurrency}`;
    directed.set(key, (directed.get(key) ?? 0) + payment.amount);
    grossObligations += payment.amount;
  }

  const pairs = new Set<string>();
  for (const key of directed.keys()) {
    const [source, destination] = key.split("->") as [Currency, Currency];
    pairs.add([source, destination].sort().join("|"));
  }

  const matchedPairs: Match[] = [];
  const residualFlows: ResidualFlow[] = [];
  let matchedVolume = 0;
  for (const pair of pairs) {
    const [currencyA, currencyB] = pair.split("|") as [Currency, Currency];
    const aToB = directed.get(`${currencyA}->${currencyB}`) ?? 0;
    const bToA = directed.get(`${currencyB}->${currencyA}`) ?? 0;
    const matchedAmount = Math.min(aToB, bToA);
    if (matchedAmount > 0) {
      matchedPairs.push({ id: `MATCH-${currencyA}-${currencyB}`, currencyA, currencyB, aToB, bToA, matchedAmount });
      matchedVolume += matchedAmount * 2;
    }
    const difference = aToB - bToA;
    if (Math.abs(difference) > 0.005) {
      residualFlows.push({
        sourceCurrency: difference > 0 ? currencyA : currencyB,
        destinationCurrency: difference > 0 ? currencyB : currencyA,
        amount: Math.abs(difference),
      });
    }
  }
  return { matchedPairs, residualFlows, matchedVolume, grossObligations };
}
