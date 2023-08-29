import { notFound } from "next/navigation";

import { prisma } from "@acme/db";

export async function userCanAccess(projectId: string) {
  if (!projectId.startsWith("project_")) {
    notFound();
  }

  // see if project exists
  // const project = await db
  //     .selectFrom('Project')
  //     .select('id')
  //     .where('id', '=', projectId)
  //     .executeTakeFirst();

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    notFound();
  }
}
