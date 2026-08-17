import { authenticateCli } from "@/lib/cli-auth";
import { count, environments, eq, getDb, projects } from "@envcove/db";
export async function GET(request: Request) {
  const identity = await authenticateCli(request);
  if (!identity)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getDb()
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      environmentCount: count(environments.id),
    })
    .from(projects)
    .leftJoin(environments, eq(projects.id, environments.projectId))
    .where(eq(projects.userId, identity.user.id))
    .groupBy(projects.id)
    .orderBy(projects.name);
  return Response.json({ projects: rows });
}
