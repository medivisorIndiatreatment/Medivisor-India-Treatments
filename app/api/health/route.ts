// app/api/health/route.ts
// Production diagnostic endpoint.
//
// On Vercel, env vars are NOT read from .env.local, so a common failure mode is
// "works locally, broken in prod" caused by missing variables. This endpoint
// reports, without leaking secrets, which required variables are present and
// whether the Wix CMS is reachable. Hit it after deploy to confirm root cause.

import { NextResponse } from "next/server";
import { isWixConfigured } from "@/lib/config/env";
import { wixServerClient } from "@/lib/wix";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function checkWixReachable(): Promise<{
  configured: boolean;
  reachable: boolean | null;
  error?: string;
  latencyMs?: number;
}> {
  if (!isWixConfigured()) {
    return { configured: false, reachable: null };
  }

  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 8000),
  );

  const started = Date.now();
  try {
    const probe = (async () => {
      // Tiny, cheap query to validate the visitor OAuth token + connectivity.
      const res = await (wixServerClient as any).items
        .query("CityMaster")
        .limit(1)
        .find();
      return res;
    })();

    const result = await Promise.race([probe, timeout]);
    if (result === null) {
      return { configured: true, reachable: false, error: "Wix request timed out (8s)" };
    }
    return {
      configured: true,
      reachable: true,
      latencyMs: Date.now() - started,
    };
  } catch (err: any) {
    return {
      configured: true,
      reachable: false,
      error: err?.message || String(err),
      latencyMs: Date.now() - started,
    };
  }
}

export async function GET() {
  const wix = await checkWixReachable();

  const healthy = wix.configured && wix.reachable === true;

  const body = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    // Keep deployment diagnostics private: this endpoint is publicly reachable
    // and must not expose environment inventory or upstream error details.
  };

  return NextResponse.json(body, {
    status: healthy ? 200 : 200, // always 200 so the body is inspectable
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "https://medivisorindiatreatment.com",
    },
  });
}
