import { clerkClient } from "@clerk/nextjs";
import type { Customer } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  mySubscription: protectedProcedure.query(async (opts) => {
    // const customer = await opts.ctx.db
    //     .selectFrom('Customer')
    //     .select(['plan', 'endsAt'])
    //     .where('clerkUserId', '=', opts.ctx.auth.userId)
    //     .executeTakeFirst();
    const customer = await opts.ctx.db.customer.findFirst<Customer>({
      where: {
        clerkUserId: opts.ctx.auth.userId,
      },
      select: {
        plan: true,
        endsAt: true,
      },
    });

    if (!customer) return null;

    return { plan: customer.plan ?? null, endsAt: customer.endsAt ?? null };
  }),
  listOrganizations: protectedProcedure.query(async (opts) => {
    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId: opts.ctx.auth.userId,
    });

    return memberships.map(({ organization }) => ({
      id: organization.id,
      name: organization.name,
      image: organization.imageUrl,
    }));
  }),
});
