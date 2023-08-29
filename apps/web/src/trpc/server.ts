"use server";

import { headers } from "next/headers";
import { auth } from "@clerk/nextjs";
import type { HTTPHeaders } from "@trpc/client";
import { loggerLink } from "@trpc/client";
import {
  experimental_createServerActionHandler,
  experimental_createTRPCNextAppDirServer,
} from "@trpc/next/app-dir/server";

import { createInnerTRPCContext, t } from "@acme/api";
import type { AppRouter } from "@acme/api";

import { endingLink, transformer } from "./shared";

const customHeaders = (): HTTPHeaders => {
  const h = new Map(headers());
  h.delete("connection");
  h.delete("transfer-encoding");
  h.set("x-trpc-source", "server");
  return Object.fromEntries(h.entries()) as HTTPHeaders;
};
export const api = experimental_createTRPCNextAppDirServer<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        endingLink({
          headers: customHeaders(),
        }),
      ],
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@acme/api";

export const createAction = experimental_createServerActionHandler(t, {
  createContext: () => createInnerTRPCContext({ auth: auth() }),
  // normalizeFormData: true,
});
