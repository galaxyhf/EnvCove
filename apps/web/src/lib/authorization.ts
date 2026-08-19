import { auth } from "@/auth";
import {
  and,
  environments,
  eq,
  getDb,
  gt,
  isNull,
  projects,
  users,
  webSessions,
} from "@envcove/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.sessionId)
    throw new Error("UNAUTHORIZED");

  const [result] = await getDb()
    .select({ user: users, webSession: webSessions })
    .from(webSessions)
    .innerJoin(users, eq(webSessions.userId, users.id))
    .where(
      and(
        eq(webSessions.id, session.sessionId),
        eq(webSessions.userId, session.user.id),
        isNull(webSessions.revokedAt),
        gt(webSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!result) throw new Error("UNAUTHORIZED");

  if (Date.now() - result.webSession.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await getDb()
      .update(webSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(webSessions.id, result.webSession.id));
  }

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    sessionId: result.webSession.id,
  };
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
