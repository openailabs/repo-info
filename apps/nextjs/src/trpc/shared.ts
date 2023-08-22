import type { AppRouter } from '@acme/api';
import type { HttpBatchLinkOptions, HTTPHeaders, TRPCLink } from '@trpc/client';
import { httpBatchLink } from '@trpc/client';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  const vc = process.env.VERCEL_URL;
  if (vc) return `https://${vc}`;
  return `http://localhost:2000`;
};

const lambdas = ['stripe', 'ingestion'];

export const endingLink = (opts?: { headers?: HTTPHeaders }) =>
  ((runtime) => {
    const sharedOpts = {
      headers: opts?.headers,
    } satisfies Partial<HttpBatchLinkOptions>;

    const edgeLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/edge`,
    })(runtime);
    const lambdaLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/lambda`,
    })(runtime);

    return (ctx) => {
      const path = ctx.op.path.split('.') as [string, ...string[]];
      const endpoint = lambdas.includes(path[0]) ? 'lambda' : 'edge';

      const newCtx = {
        ...ctx,
        op: { ...ctx.op, path: path.join('.') },
      };
      return endpoint === 'edge' ? edgeLink(newCtx) : lambdaLink(newCtx);
    };
  }) satisfies TRPCLink<AppRouter>;
