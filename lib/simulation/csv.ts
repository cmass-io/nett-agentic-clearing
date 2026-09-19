import { CURRENCIES, type Currency, type PaymentIntent } from "@/lib/types";

const REQUIRED = ["source_country", "destination_country", "source_currency", "destination_currency", "amount", "timestamp"];

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]!;
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(value.trim()); value = ""; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

function asCurrency(value: string): Currency {
  const normalized = value.toUpperCase() as Currency;
  if (!CURRENCIES.includes(normalized)) throw new Error(`Unsupported currency: ${value}`);
  return normalized;
}

export function parsePaymentCsv(csv: string): PaymentIntent[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV must include a header and at least one payment row.");
  const headers = splitCsvLine(lines[0]!).map((header) => header.toLowerCase());
  const missing = REQUIRED.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}`);
  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
    const sourceCurrency = asCurrency(row.source_currency);
    const destinationCurrency = asCurrency(row.destination_currency);
    if (sourceCurrency === destinationCurrency) throw new Error(`Row ${index + 2}: source and destination currencies must differ.`);
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Row ${index + 2}: amount must be positive.`);
    const timestamp = Date.parse(row.timestamp);
    if (!Number.isFinite(timestamp)) throw new Error(`Row ${index + 2}: invalid timestamp.`);
    return {
      id: row.id || `CSV-${String(index + 1).padStart(6, "0")}`, sourceCountry: row.source_country,
      destinationCountry: row.destination_country, sourceCurrency, destinationCurrency,
      sourceInstitution: row.source_institution || "Uploaded Sender", destinationInstitution: row.destination_institution || "Uploaded Receiver",
      amount, timestamp, priority: row.priority === "priority" ? "priority" : "standard", status: "pending" as const,
      maxSettlementTimeMinutes: Number(row.max_settlement_time_minutes) || 120,
    };
  });
}
