/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";

export type MiddlewareFactory<P = any> = (
  middleware: (
    req: NextRequest,
    evt: NextFetchEvent,
  ) => ReturnType<NextMiddleware>,
  params?: P,
) => NextMiddleware;
