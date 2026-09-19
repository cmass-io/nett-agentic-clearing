import { describe, expect, it } from "vitest";
import { reoptimizeAfterShock, runSyntheticNetwork } from "@/lib/agents/orchestrator";

describe("autonomous shock recovery", () => {
  it("produces a valid new plan after a PHP liquidity crisis", () => {
    const initial = runSyntheticNetwork(10_000, 2047);
    const recovered = reoptimizeAfterShock(initial, "php-liquidity");
    expect(initial.metrics.validPlan).toBe(true);
    expect(recovered.metrics.validPlan).toBe(true);
    expect(recovered.marketConditions.shockScenario).toBe("php-liquidity");
    expect(recovered.shockComparison?.additionalCost).toBeGreaterThanOrEqual(0);
    expect(recovered.agentEvents[0]?.action).toBe("Detect market shock");
  });
});
