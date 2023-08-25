import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

import type { MiddlewareFactory } from "./types";

export const DefaultLruRateLimitingParams = {
  max: 3,
  maxAge: 3 * 1000,
  allowedUrlsSet: ["/api/hello", "/api/trpc/edge"],
};
export const withLruRateLimiting =
  (params: typeof DefaultLruRateLimitingParams): MiddlewareFactory =>
  (next) => {
    const cache = new LRUCache<
      string,
      { remaining: number; timestamp: number }
    >(params);

    const isUrlAllowed = (url: string): boolean => {
      return params.allowedUrlsSet.some((allowedUrl: string) =>
        url.startsWith(allowedUrl),
      );
    };

    return async (request: NextRequest, event: NextFetchEvent) => {
      if (!isUrlAllowed(request.nextUrl.pathname)) {
        return next(request, event);
      }

      console.log(`With lru rate limiting: ${request.nextUrl.pathname}`);

      const ip = request.ip ?? "127.0.0.1";
      const key = `ratelimit_middleware_${ip}`;
      let rateLimit = cache.get(key);

      if (!rateLimit || Date.now() - rateLimit.timestamp > params.maxAge) {
        rateLimit = { remaining: params.max - 1, timestamp: Date.now() };
        cache.set(key, rateLimit);
      } else if (rateLimit.remaining > 0) {
        rateLimit.remaining--;
      } else {
        const timeUntilReset =
          params.maxAge - (Date.now() - rateLimit.timestamp);
        const response = new NextResponse(
          JSON.stringify({ error: "Too many requests" }),
          {
            status: 429,
            headers: new Headers({
              "Content-Type": "application/json",
              "X-RateLimit-Limit": params.max.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": timeUntilReset.toString(),
            }),
          },
        );
        return response;
      }

      const response = await next(request, event);
      response?.headers.set("X-RateLimit-Limit", params.max.toString());
      response?.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString(),
      );
      response?.headers.set("X-RateLimit-Reset", params.maxAge.toString());
      return response;
    };
  };
