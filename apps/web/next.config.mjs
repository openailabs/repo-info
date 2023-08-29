import "./src/env.mjs";
import "@acme/api/env";

import withMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const config = {
  compress: false,
  // async headers() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       headers: [
  //         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         { key: "Access-Control-Allow-Origin", value: "*" },
  //         {
  //           key: "Access-Control-Allow-Methods",
  //           value: "GET,DELETE,PATCH,POST,PUT",
  //         },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value:
  //             "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //         },
  //       ],
  //     },
  //   ];
  // },
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/db", "@acme/ui"],
  pageExtensions: ["ts", "tsx", "mdx"],
  // async headers() {
  //   return [
  //     {
  //       // matching all API routes
  //       source: "/api/:path*",
  //       headers: [
  // { key: "Access-Control-Allow-Credentials", value: "true" },
  // { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
  // {
  //   key: "Access-Control-Allow-Methods",
  //   value: "GET,DELETE,PATCH,POST,PUT",
  // },
  // {
  //   key: "Access-Control-Allow-Headers",
  //   value:
  //     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  // },
  //       ],
  //     },
  //   ];
  // },
  experimental: {
    mdxRs: true,
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: [
      "@zenstackhq/runtime",
      "@zenstackhq/server",
    ],
  },
  // modularizeImports: {
  //   "lucide-react": {
  //     transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
  //   },
  // },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withMDX()(config);
