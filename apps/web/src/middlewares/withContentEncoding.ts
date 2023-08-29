import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";

import type { MiddlewareFactory } from "./types";

export const withContentEncoding: MiddlewareFactory = (
  next: NextMiddleware,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    console.log("With ct middleware", request.nextUrl.pathname);
    const res = await next(request, _next);
    if (res) {
      //// not working here
      // res.headers.append("Content-Type", "application/json;charset=UTF-8");
      // res.headers.append("Content-Encoding", "br");
    }
    return res;
  };
};
