import { describe, expect, it } from "vitest";
import { matchOpposingFlows } from "@/lib/clearing/matching";
import { payment } from "./fixtures";

describe("opposing flow matching", () => {
  it("leaves the specified $200 sanity-case residual", () => {
    const result = matchOpposingFlows([
      payment("A", "USD", "PHP", 1_000),
      payment("B", "PHP", "USD", 800),
    ]);
    expect(result.matchedVolume).toBe(1_600);
    expect(result.residualFlows).toEqual([{ sourceCurrency: "USD", destinationCurrency: "PHP", amount: 200 }]);
  });
});
