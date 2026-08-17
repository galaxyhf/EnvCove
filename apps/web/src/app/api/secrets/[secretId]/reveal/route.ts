import { decryptSecret } from "@envcove/crypto";
import { and, environments, eq, getDb, projects, secrets } from "@envcove/db";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/authorization";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ secretId: string }> },
) {
  try {
    const user = await requireUser();
    if (!rateLimit(`reveal:${user.id}`, 30, 60_000))
      return Response.json(
        { error: "Too many reveal requests" },
        { status: 429 },
      );
    const { secretId } = await params;
    const [row] = await getDb()
      .select({ secret: secrets, environment: environments, project: projects })
      .from(secrets)
      .innerJoin(environments, eq(secrets.environmentId, environments.id))
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(and(eq(secrets.id, secretId), eq(projects.userId, user.id)))
      .limit(1);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    await audit({
      userId: user.id,
      projectId: row.project.id,
      environmentId: row.environment.id,
      action: "secret.revealed",
      metadata: { key: row.secret.key },
    });
    return Response.json(
      { value: decryptSecret(row.secret) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
