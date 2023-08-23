import './src/env.mjs';
import '@acme/api/env';
import withMDX from '@next/mdx';

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ['@acme/api', '@acme/db', '@acme/ui'],
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true,
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: [
      '@zenstackhq/runtime',
      '@zenstackhq/server',
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
