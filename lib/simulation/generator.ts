import { CURRENCIES, type Currency, type PaymentIntent } from "@/lib/types";

const COUNTRY_BY_CURRENCY: Record<Currency, string[]> = {
  USD: ["US"], EUR: ["DE", "FR", "NL"], GBP: ["GB"], PHP: ["PH"], MXN: ["MX"],
  INR: ["IN"], JPY: ["JP"], CAD: ["CA"], BRL: ["BR"], SGD: ["SG"],
};

const INSTITUTIONS = [
  "AsterPay", "Atlas Remit", "BlueRiver", "Cedar Financial", "FluxPay", "Kite Money",
  "Lumen Treasury", "Northstar", "Orbit Commerce", "Pioneer Payroll", "Relay Markets", "Vertex Bank",
];

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function pickSourceCurrency(random: () => number): Currency {
  if (random() < 0.17) return "PHP";
  return pick(CURRENCIES.filter((currency) => currency !== "PHP"), random);
}

export function generatePaymentIntents(count: number, seed = 2047): PaymentIntent[] {
  const random = mulberry32(seed);
  const baseTimestamp = Date.UTC(2026, 0, 15, 12, 0, 0);
  const payments = new Array<PaymentIntent>(count);

  for (let index = 0; index < count; index += 1) {
    const sourceCurrency = pickSourceCurrency(random);
    let destinationCurrency = pick(CURRENCIES, random);
    while (destinationCurrency === sourceCurrency) destinationCurrency = pick(CURRENCIES, random);

    const sourceInstitution = pick(INSTITUTIONS, random);
    let destinationInstitution = pick(INSTITUTIONS, random);
    while (destinationInstitution === sourceInstitution) destinationInstitution = pick(INSTITUTIONS, random);

    const scale = Math.pow(random(), 2.2);
    const amount = Math.round((750 + scale * 74_250) * 100) / 100;
    const priority = random() < 0.18 ? "priority" : "standard";

    payments[index] = {
      id: `SIM-${seed}-${String(index + 1).padStart(6, "0")}`,
      sourceCountry: pick(COUNTRY_BY_CURRENCY[sourceCurrency], random),
      destinationCountry: pick(COUNTRY_BY_CURRENCY[destinationCurrency], random),
      sourceCurrency,
      destinationCurrency,
      sourceInstitution,
      destinationInstitution,
      amount,
      timestamp: baseTimestamp + Math.floor(random() * 86_400_000),
      priority,
      status: "pending",
      maxSettlementTimeMinutes: priority === "priority" ? 15 : pick([30, 60, 120, 240], random),
    };
  }

  return payments;
}
