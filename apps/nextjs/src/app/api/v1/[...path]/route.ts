import { prisma } from '@acme/db';
import { getAuth } from '@clerk/nextjs/server';
import { enhance } from '@zenstackhq/runtime';
import { NextRequestHandler } from '@zenstackhq/server/next';
import type { NextRequest } from 'next/server';

function getPrisma(req: NextRequest) {
  const auth = getAuth(req);
  return enhance(prisma, { user: auth ? { id: auth.userId } : undefined });
}

const handler = NextRequestHandler({ getPrisma, useAppDir: true });

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
