import type { NextFetchEvent, NextRequest } from "next/server";

import type { MiddlewareFactory } from "./types";

export const withErrorHandler: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    console.log("With error handler middleware", request.nextUrl.pathname);
    let result;
    try {
      result = await next(request, _next);
    } catch (error) {
      if (error instanceof Error) {
        console.log("withErrorHandler", error.message);
      }
    }
    return result;
  };
};
