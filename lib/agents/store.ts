"use client";

import { create } from "zustand";
import { createEmptyNetworkState, reoptimizeAfterShock, runSyntheticNetwork, runUploadedNetwork } from "@/lib/agents/orchestrator";
import { parsePaymentCsv } from "@/lib/simulation/csv";
import type { AgentName, NetworkState, ShockScenario } from "@/lib/types";

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

type NettStore = NetworkState & {
  transactionPreset: number;
  selectedShock: ShockScenario;
  error: string | null;
  setTransactionPreset: (count: number) => void;
  setSelectedShock: (scenario: ShockScenario) => void;
  runNetwork: () => Promise<void>;
  introduceShock: () => Promise<void>;
  uploadCsv: (csv: string) => Promise<void>;
};

async function animateAgents(set: (partial: Partial<NettStore>) => void, agents: AgentName[]) {
  for (const activeAgent of agents) {
    set({ activeAgent });
    await wait(120);
  }
}

export const useNettStore = create<NettStore>((set, get) => ({
  ...createEmptyNetworkState(),
  transactionPreset: 100_000,
  selectedShock: "php-liquidity",
  error: null,
  setTransactionPreset: (transactionPreset) => set({ transactionPreset }),
  setSelectedShock: (selectedShock) => set({ selectedShock }),
  runNetwork: async () => {
    set({ simulationStatus: "processing", error: null, shockComparison: null });
    await animateAgents(set, ["orchestrator", "matching", "netting", "liquidity", "routing", "orchestrator"]);
    const result = runSyntheticNetwork(get().transactionPreset, 2047);
    set({ ...result, transactionPreset: get().transactionPreset, selectedShock: get().selectedShock, error: null });
  },
  introduceShock: async () => {
    if (get().simulationStatus !== "optimized" || get().paymentIntents.length === 0) return;
    const snapshot = get();
    set({ simulationStatus: "shock", activeAgent: "liquidity", error: null });
    await wait(180);
    set({ simulationStatus: "reoptimizing" });
    await animateAgents(set, ["orchestrator", "matching", "netting", "liquidity", "routing", "orchestrator"]);
    const result = reoptimizeAfterShock(snapshot, get().selectedShock);
    set({ ...result, transactionPreset: get().transactionPreset, selectedShock: get().selectedShock, error: null });
  },
  uploadCsv: async (csv) => {
    try {
      const payments = parsePaymentCsv(csv);
      set({ simulationStatus: "processing", error: null, shockComparison: null });
      await animateAgents(set, ["orchestrator", "matching", "netting", "liquidity", "routing"]);
      const result = runUploadedNetwork(payments);
      set({ ...result, transactionPreset: get().transactionPreset, selectedShock: get().selectedShock, error: null });
    } catch (error) {
      set({ simulationStatus: "idle", activeAgent: null, error: error instanceof Error ? error.message : "CSV processing failed." });
    }
  },
}));
