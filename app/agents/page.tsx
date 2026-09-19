import type { Metadata } from "next";
import { AgentNetwork } from "@/components/agents/agent-network";

export const metadata: Metadata = { title: "Agent Network" };

export default function AgentsPage() {
  return <AgentNetwork />;
}
