import { auth } from "@/auth";
import { and, environments, eq, getDb, projects } from "@envcove/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user;
}

export async function ownedProject(projectId: string, userId: string) {
  const [project] = await getDb()
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return project;
}

export async function ownedEnvironment(environmentId: string, userId: string) {
  const [result] = await getDb()
    .select({ environment: environments, project: projects })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(environments.id, environmentId), eq(projects.userId, userId)))
    .limit(1);
  return result;
}
