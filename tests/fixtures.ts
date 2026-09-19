import type { Currency, PaymentIntent } from "@/lib/types";

export function payment(id: string, sourceCurrency: Currency, destinationCurrency: Currency, amount: number): PaymentIntent {
  return {
    id, sourceCountry: "US", destinationCountry: "PH", sourceCurrency, destinationCurrency,
    sourceInstitution: "Sender", destinationInstitution: "Receiver", amount,
    timestamp: Date.UTC(2026, 0, 15), priority: "standard", status: "pending", maxSettlementTimeMinutes: 120,
  };
}
