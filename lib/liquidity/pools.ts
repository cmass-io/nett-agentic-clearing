import { CURRENCIES, type Currency, type LiquidityPool } from "@/lib/types";

export function createLiquidityPools(): LiquidityPool[] {
  return CURRENCIES.map((currency, index) => ({
    currency,
    available: currency === "PHP" ? 850_000_000 : 1_100_000_000 + index * 35_000_000,
    reserved: 0,
    reserveFloor: currency === "PHP" ? 25_000_000 : 40_000_000,
  }));
}

export function checkLiquidity(pool: LiquidityPool, amount: number): boolean {
  return amount >= 0 && pool.available - pool.reserved - amount >= pool.reserveFloor;
}

export function reserveLiquidity(pool: LiquidityPool, amount: number): LiquidityPool {
  if (!checkLiquidity(pool, amount)) throw new Error(`Insufficient ${pool.currency} liquidity for ${amount.toFixed(2)}`);
  return { ...pool, reserved: pool.reserved + amount };
}

export function releaseLiquidity(pool: LiquidityPool, amount: number): LiquidityPool {
  return { ...pool, reserved: Math.max(0, pool.reserved - amount) };
}

export function identifyShortfalls(pools: LiquidityPool[], requirements: Partial<Record<Currency, number>>): string[] {
  return pools.flatMap((pool) => {
    const required = requirements[pool.currency] ?? 0;
    return checkLiquidity(pool, required) ? [] : [
      `${pool.currency} requires ${required.toFixed(0)} but only ${(pool.available - pool.reserved - pool.reserveFloor).toFixed(0)} is deployable`,
    ];
  });
}
