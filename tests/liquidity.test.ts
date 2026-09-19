import { describe, expect, it } from "vitest";
import { checkLiquidity, releaseLiquidity, reserveLiquidity } from "@/lib/liquidity/pools";

describe("liquidity controls", () => {
  const pool = { currency: "USD" as const, available: 1_000, reserved: 100, reserveFloor: 200 };
  it("never consumes the reserve floor", () => {
    expect(checkLiquidity(pool, 701)).toBe(false);
    expect(() => reserveLiquidity(pool, 701)).toThrow(/Insufficient USD liquidity/);
  });
  it("reserves and releases valid amounts", () => {
    const reserved = reserveLiquidity(pool, 500);
    expect(reserved.reserved).toBe(600);
    expect(releaseLiquidity(reserved, 250).reserved).toBe(350);
  });
});
