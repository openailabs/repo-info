// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// import type { MiddlewareFactory } from "./types";

// export const withNextAuth: MiddlewareFactory = (next) => {
//   return async (request: NextRequest) => {
//     const pathname = request.nextUrl.pathname;

//     if (["/admin"]?.some((path) => pathname.startsWith(path))) {
//       const token = await getToken({
//         req: request,
//         secret: process.env.NEXTAUTH_SECRET,
//       });
//       if (!token) {
//         const url = new URL("/api/auth/signin", request.url);
//         url.searchParams.set("callbackUrl", encodeURI(request.url));
//         return NextResponse.redirect(url);
//       }
//       if (token.role !== "admin") {
//         const url = new URL("/403", request.url);
//         return NextResponse.rewrite(url);
//       }
//     }
//     return next(request);
//   };
// };
