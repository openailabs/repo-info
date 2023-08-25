/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import { authMiddleware } from "@clerk/nextjs/server";

import type { MiddlewareFactory } from "./types";

export const withClerkAuth =
  (params?: any): MiddlewareFactory =>
  (_next) => {
    return authMiddleware({
      ...params,
      async afterAuth(auth, req, evt) {
        console.log("With clerk auth middleware", req.nextUrl.pathname);
        if (auth.isPublicRoute) {
          // Don't do anything for public routes
          return _next(req, evt);
        }

        const url = new URL(req.nextUrl.origin);
        const parts = req.nextUrl.pathname.split("/").filter(Boolean);

        if (!auth.userId) {
          // User is not signed in
          url.pathname = "/signin";
          return NextResponse.redirect(url);
        }

        if (req.nextUrl.pathname === "/dashboard") {
          // /dashboard should redirect to the user's dashboard
          // use their current workspace, i.e. /:orgId or /:userId
          url.pathname = `/${auth.orgId ?? auth.userId}`;
          return NextResponse.redirect(url);
        }

        const workspaceId = parts[0];
        const isOrg = workspaceId?.startsWith("org_");
        if (isOrg && auth.orgId !== workspaceId) {
          const orgs = await clerkClient.users.getOrganizationMembershipList({
            userId: auth.userId,
          });
          const hasAccess = orgs.some((org) => org.id === workspaceId);
          if (!hasAccess) {
            url.pathname = `/`;
            return NextResponse.redirect(url);
          }

          return _next(req, evt);
        }

        const isUser = workspaceId?.startsWith("user_");
        if (isUser && auth.userId !== workspaceId) {
          url.pathname = `/`;
          return NextResponse.redirect(url);
        }
        return _next(req, evt);
      },
    });
  };
