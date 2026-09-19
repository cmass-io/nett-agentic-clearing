import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, detail, icon: Icon, accent = false }: {
  label: string; value: string; detail: string; icon: LucideIcon; accent?: boolean;
}) {
  return (
    <article className={`metric-card ${accent ? "metric-card-accent" : ""}`}>
      <div className="metric-label"><span>{label}</span><Icon size={17} /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
