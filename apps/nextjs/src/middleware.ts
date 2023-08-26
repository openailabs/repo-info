import { middlewares } from "./middlewares/middlewares";
import { withClerkAuth } from "./middlewares/withClerkAuth";
import { withContentEncoding } from "./middlewares/withContentEncoding";
import { withCors } from "./middlewares/withCors";
import { withErrorHandler } from "./middlewares/withErrorHandler";
import { withHeaders } from "./middlewares/withHeaders";
import { withLogging } from "./middlewares/withLogging";
import {
  DefaultLruRateLimitingParams,
  withLruRateLimiting,
} from "./middlewares/withLruRateLimiting";

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
