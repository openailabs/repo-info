import { genId } from '@acme/db';
import { clerkClient } from '@clerk/nextjs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createApiKeySchema,
  createProjectSchema,
  renameProjectSchema,
  transferToOrgSchema,
} from '../../validators';
import {
  createTRPCRouter,
  protectedAdminProcedure,
  protectedProcedure,
} from '../trpc';

const PROJECT_LIMITS = {
  FREE: 1000,
  PRO: 3000,
} as const;

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async (opts) => {
      const { userId, orgId } = opts.ctx.auth;
      const { name } = opts.input;
      // console.log({ userId, orgId, name });

      // Check if limit is reached
      // let query = opts.ctx.db
      //     .selectFrom('Project')
      //     .select(({ fn }) => [fn.count<number>('id').as('projects')]);
      // if (orgId) {
      //     query = query.where('organizationId', '=', orgId);
      // } else {
      //     query = query.where('userId', '=', userId);
      // }
      // const projects = (await query.executeTakeFirst())?.projects ?? 0;

      let projects = await opts.ctx.db.project.count({
        where: orgId ? { organizationId: orgId } : { userId: userId },
      });

      projects = projects ?? 0;

      // FIXME: Don't hardcode the limit to PRO
      if (projects >= PROJECT_LIMITS.PRO) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Limit reached',
        });
      }

      const projectId = 'project_' + genId();

      // await opts.ctx.db
      //     .insertInto('Project')
      //     .values({
      //         id: projectId,
      //         name,
      //         userId: orgId ? null : userId,
      //         organizationId: orgId,
      //     })
      //     .execute();
      await opts.ctx.db.project.create({
        data: {
          id: projectId,
          name: name,
          userId: orgId ? null : userId,
          organizationId: orgId,
        },
      });

      return projectId;
    }),

  rename: protectedProcedure
    .input(renameProjectSchema)
    .mutation(async (opts) => {
      const { projectId, name } = opts.input;

      // TODO: Validate permissions, should anyone with access to the project be able to change the name?

      // await opts.ctx.db
      //     .updateTable('Project')
      //     .set({
      //         name,
      //     })
      //     .where('id', '=', projectId)
      //     .execute();
      await opts.ctx.db.project.update({
        where: {
          id: projectId,
        },
        data: {
          name: name,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { userId, orgId } = opts.ctx.auth;

      // const deleteQuery = opts.ctx.db
      //     .deleteFrom('Project')
      //     .where('id', '=', opts.input.id);

      // if (orgId) {
      //     return await deleteQuery
      //         .where('organizationId', '=', orgId)
      //         .execute();
      // }

      // return await deleteQuery.where('userId', '=', userId).execute();

      if (orgId) {
        return await opts.ctx.db.project.deleteMany({
          where: {
            id: opts.input.id,
            organizationId: orgId,
          },
        });
      }

      return await opts.ctx.db.project.deleteMany({
        where: {
          id: opts.input.id,
          userId: userId,
        },
      });
    }),

  transferToPersonal: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      // const project = await opts.ctx.db
      //     .selectFrom('Project')
      //     .select(['id', 'userId', 'organizationId'])
      //     .where('id', '=', opts.input.id)
      //     .executeTakeFirst();
      const project = await opts.ctx.db.project.findFirst({
        where: {
          id: opts.input.id,
        },
        select: {
          id: true,
          userId: true,
          organizationId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (!project.organizationId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project is already personal',
        });
      }

      // await opts.ctx.db
      //     .updateTable('Project')
      //     .set({
      //         userId: opts.ctx.auth.userId,
      //         organizationId: null,
      //     })
      //     .where('id', '=', project.id)
      //     .execute();
      await opts.ctx.db.project.update({
        where: { id: project.id },
        data: {
          userId: opts.ctx.auth.userId,
          organizationId: null,
        },
      });
    }),

  transferToOrganization: protectedProcedure
    .input(transferToOrgSchema)
    .mutation(async (opts) => {
      const { userId, orgId: userOrgId, orgRole } = opts.ctx.auth;
      const { orgId: targetOrgId } = opts.input;

      const orgs = await clerkClient.users.getOrganizationMembershipList({
        userId: userId,
      });
      const org = orgs.find((org) => org.organization.id === targetOrgId);

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: "You're not a member of the target organization",
        });
      }

      // const project = await opts.ctx.db
      //     .selectFrom('Project')
      //     .select(['id', 'userId', 'organizationId'])
      //     .where(({ cmpr, and, or }) =>
      //         and([
      //             cmpr('id', '=', opts.input.projectId),
      //             or([
      //                 cmpr('userId', '=', userId),
      //                 cmpr('organizationId', '=', userOrgId ?? ''),
      //             ]),
      //         ])
      //     )
      //     .executeTakeFirst();

      const project = await opts.ctx.db.project.findFirst({
        where: {
          id: opts.input.projectId,
          OR: [{ userId: userId }, { organizationId: userOrgId }],
        },
        select: {
          id: true,
          userId: true,
          organizationId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (project.organizationId === targetOrgId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Project is already in the target organization',
        });
      }

      if (
        project.organizationId &&
        project.organizationId !== userOrgId &&
        orgRole !== 'admin'
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be an admin to transfer this project',
        });
      }

      // await opts.ctx.db
      //     .updateTable('Project')
      //     .set({
      //         userId: null,
      //         organizationId: targetOrgId,
      //     })
      //     .where('id', '=', project.id)
      //     .execute();
      await opts.ctx.db.project.update({
        where: {
          id: project.id,
        },
        data: {
          userId: null,
          organizationId: targetOrgId,
        },
      });
    }),

  listByActiveWorkspace: protectedProcedure.query(async (opts) => {
    const { userId, orgId } = opts.ctx.auth;
    console.log(`User id: ${userId} and org id: ${orgId}`);
    // let query = opts.ctx.db
    //     .selectFrom('Project')
    //     .select(['id', 'name', 'url', 'tier']);
    // if (orgId) {
    //     query = query.where('organizationId', '=', orgId);
    // } else {
    //     query = query.where('userId', '=', userId);
    // }

    // const projects = await query.execute();

    let projects;

    if (orgId) {
      projects = await opts.ctx.db.project.findMany({
        where: {
          organizationId: orgId,
        },
        select: {
          id: true,
          name: true,
          url: true,
          tier: true,
        },
      });
    } else {
      projects = await opts.ctx.db.project.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          name: true,
          url: true,
          tier: true,
        },
      });
    }

    // console.log(`Projects: ${projects}`);
    // FIXME: Don't hardcode the limit to PRO
    return {
      projects,
      limit: PROJECT_LIMITS.PRO,
      limitReached: projects.length >= PROJECT_LIMITS.PRO,
      // limitReached: false,
    };
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const { userId } = opts.ctx.auth;
      const { id } = opts.input;

      const orgs = await clerkClient.users.getOrganizationMembershipList({
        userId: userId,
      });
      const orgIds = orgs.map((org) => org.organization.id);

      // Verify the user has access to the project
      // const query = opts.ctx.db
      //     .selectFrom('Project')
      //     .select(['id', 'name', 'url', 'tier', 'organizationId'])
      //     .where(({ cmpr, and, or }) =>
      //         and([
      //             cmpr('id', '=', id),
      //             orgIds.length > 0
      //                 ? or([
      //                       cmpr('userId', '=', userId),
      //                       cmpr('organizationId', 'in', orgIds),
      //                   ])
      //                 : cmpr('userId', '=', userId),
      //         ])
      //     );

      // const project = await query.executeTakeFirst();
      const project = await opts.ctx.db.project.findFirst({
        where: {
          AND: [
            { id: id },
            {
              OR:
                orgIds.length > 0
                  ? [{ userId: userId }, { organizationId: { in: orgIds } }]
                  : [{ userId: userId }],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          url: true,
          tier: true,
          organizationId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return project;
    }),

  listApiKeys: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async (opts) => {
      const { userId } = opts.ctx.auth;
      const { projectId } = opts.input;

      // const apiKeys = await opts.ctx.db
      //     .selectFrom('ApiKey')
      //     .select([
      //         'id',
      //         'name',
      //         'key',
      //         'createdAt',
      //         'lastUsed',
      //         'expiresAt',
      //         'revokedAt',
      //     ])
      //     .where('projectId', '=', projectId)
      //     .where('clerkUserId', '=', userId)
      //     // first active, then expired, then revoked
      //     .orderBy((eb) =>
      //         eb
      //             .case()
      //             .when('revokedAt', 'is not', null)
      //             .then(3)
      //             .when(
      //                 eb.and([
      //                     eb.cmpr('expiresAt', 'is not', null),
      //                     eb.cmpr('expiresAt', '<', new Date()),
      //                 ])
      //             )
      //             .then(2)
      //             .else(1)
      //             .end()
      //     )
      //     .orderBy('createdAt', 'desc')
      //     .execute();

      // TODO: Project admins should maybe be able to see all keys for the project?

      const currentDate = new Date();

      const apiKeys = await opts.ctx.db.apiKey.findMany({
        where: {
          projectId: projectId,
          clerkUserId: userId,
        },
        select: {
          id: true,
          name: true,
          key: true,
          createdAt: true,
          lastUsed: true,
          expiresAt: true,
          revokedAt: true,
        },
        orderBy: [
          {
            // 判断 revokedAt 字段
            revokedAt: 'asc', // if null means it's active
          },
          {
            // 判断 expiresAt 字段
            expiresAt: currentDate <= 'expiresAt' ? 'asc' : 'desc', // if null or later than today it's active or expired
          },
          {
            createdAt: 'desc',
          },
        ],
      });

      return apiKeys;
    }),

  createApiKey: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async (opts) => {
      const projectId = opts.input.projectId;
      const userId = opts.ctx.auth.userId;

      // Verify the user has access to the project
      // const project = await opts.ctx.db
      //     .selectFrom('Project')
      //     .select(['id', 'name', 'userId', 'organizationId'])
      //     .where('id', '=', projectId)
      //     .executeTakeFirst();

      const project = await opts.ctx.db.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          userId: true,
          organizationId: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (project.userId && project.userId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        });
      }

      if (project.organizationId) {
        const orgs = await clerkClient.users.getOrganizationMembershipList({
          userId,
        });
        const isMemberInProjectOrg = orgs.some(
          (org) => org.organization.id === project.organizationId
        );

        if (!isMemberInProjectOrg) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: "You don't have access to this project",
          });
        }
      }

      // Generate the key
      const apiKey = 'sk_live_' + genId();
      const apiKeyId = 'api_key_' + genId();
      // await opts.ctx.db
      //     .insertInto('ApiKey')
      //     .values({
      //         id: apiKeyId,
      //         name: opts.input.name,
      //         key: apiKey,
      //         expiresAt: opts.input.expiresAt,
      //         projectId: opts.input.projectId,
      //         clerkUserId: userId,
      //     })
      //     .execute();
      await opts.ctx.db.apiKey.create({
        data: {
          id: apiKeyId,
          name: opts.input.name,
          key: apiKey,
          expiresAt: opts.input.expiresAt,
          projectId: opts.input.projectId,
          clerkUserId: userId,
        },
      });

      return apiKey;
    }),

  revokeApiKeys: protectedProcedure
    .input(z.object({ ids: z.string().array() }))
    .mutation(async (opts) => {
      const { userId } = opts.ctx.auth;

      // const result = await opts.ctx.db
      //     .updateTable('ApiKey')
      //     .set({ revokedAt: new Date() })
      //     .where('id', 'in', opts.input.ids)
      //     .where('clerkUserId', '=', String(userId))
      //     .where('revokedAt', 'is', null)
      //     .executeTakeFirst();

      const result = await opts.ctx.db.apiKey.updateMany({
        data: {
          revokedAt: new Date(),
        },
        where: {
          id: { in: opts.input.ids },
          clerkUserId: String(userId),
          revokedAt: null,
        },
      });

      if (result.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      return { success: true, numRevoked: result.count };
    }),

  rollApiKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      // const apiKey = await opts.ctx.db
      //     .selectFrom('ApiKey')
      //     .select(['id'])
      //     .where('id', '=', opts.input.id)
      //     .where('clerkUserId', '=', opts.ctx.auth.userId)
      //     .executeTakeFirst();
      const apiKey = await opts.ctx.db.apiKey.findFirst({
        where: {
          id: opts.input.id,
          clerkUserId: opts.ctx.auth.userId,
        },
        select: {
          id: true,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        });
      }

      const newKey = 'sk_live_' + genId();
      // await opts.ctx.db
      //     .updateTable('ApiKey')
      //     .set({ key: newKey })
      //     .where('id', '=', opts.input.id)
      //     .execute();
      await opts.ctx.db.apiKey.update({
        where: {
          id: opts.input.id,
        },
        data: {
          key: newKey,
        },
      });

      return newKey;
    }),
});
