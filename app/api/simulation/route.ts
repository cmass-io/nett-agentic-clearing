import { NextResponse } from "next/server";
import { runSyntheticNetwork } from "@/lib/agents/orchestrator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const count = [10_000, 50_000, 100_000, 250_000].includes(body.count) ? body.count : 100_000;
  return NextResponse.json(runSyntheticNetwork(count, Number(body.seed) || 2047));
}
