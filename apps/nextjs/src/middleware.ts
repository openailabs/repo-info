import { middlewares } from "./middlewares/middlewares";
import { withClerkAuth } from "./middlewares/withClerkAuth";
import { withCors } from "./middlewares/withCors";

// export default middlewares([
//   // withCors,
//   withHeaders,
//   withLogging,
//   withLruRateLimiting,
//   withClerkAuth,
// ]);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

const defaultClerkAuthParams = {
  signInUrl: "/signin",
  publicRoutes: [
    ...config.matcher,
    "/",
    "/signin(.*)",
    "/sso-callback(.*)",
    "/terms(.*)",
    "/pricing(.*)",
    "/privacy(.*)",
    "/api(.*)",
  ],
};

export default middlewares([
  // withContentEncoding,
  // withHeaders,
  withCors,
  // withLogging,
  // withLruRateLimiting(DefaultLruRateLimitingParams),
  withClerkAuth(defaultClerkAuthParams),
]);
