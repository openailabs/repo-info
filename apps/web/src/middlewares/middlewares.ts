import type { NextMiddleware } from "next/server";
import { NextResponse } from "next/server";

import type { MiddlewareFactory } from "./types";

export function middlewares(
  functions: MiddlewareFactory[] = [],
): NextMiddleware {
  const helper = (index: number): NextMiddleware => {
    const current = functions[index];
    if (current) {
      const next = helper(index + 1);
      return current(next);
    }
    return () => NextResponse.next();
  };
  return helper(0);
}
