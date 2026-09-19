import type { Metadata } from "next";
import { AnalysisWorkspace } from "@/components/dashboard/analysis-workspace";

export const metadata: Metadata = { title: "Economics Analysis" };

export default function AnalysisPage() {
  return <AnalysisWorkspace />;
}
