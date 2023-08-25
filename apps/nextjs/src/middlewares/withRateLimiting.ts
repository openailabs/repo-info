// withRateLimiting.ts
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import type { MiddlewareFactory } from "./types";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.cachedFixedWindow(15, "30s"),
  ephemeralCache: new Map(),
  analytics: true,
});

export const withRateLimiting: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const ip = request.ip ?? "127.0.0.1";
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_middleware_${ip}`,
    );
    event.waitUntil(pending);

    let res;
    if (success) {
      res = await next(request, event);
    } else {
      res = new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });
    }

    res?.headers.set("X-RateLimit-Limit", limit.toString());
    res?.headers.set("X-RateLimit-Remaining", remaining.toString());
    res?.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  };
};
