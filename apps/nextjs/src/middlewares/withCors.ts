import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";

import type { MiddlewareFactory } from "./types";

export const withCors: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    console.log("With cors middleware", request.nextUrl.pathname);
    const res = await next(request, _next);
    if (res) {
      res.headers.append("Access-Control-Allow-Credentials", "true");
      res.headers.append("Access-Control-Allow-Origin", "*"); // replace this your actual origin
      res.headers.append(
        "Access-Control-Allow-Methods",
        "GET,DELETE,PATCH,POST,PUT",
      );
      res.headers.append(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
      );
    }
    return res;
  };
};
