import { decryptSecret } from "@envvault/crypto";
import { and, environments, eq, getDb, secrets } from "@envvault/db";
import { audit } from "@/lib/audit";
import { authenticateCli } from "@/lib/cli-auth";
import { ownedProject } from "@/lib/authorization";
import { rateLimit } from "@/lib/rate-limit";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; environment: string }> },
) {
  const identity = await authenticateCli(request);
  if (!identity)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`cli-secrets:${identity.token.id}`, 60, 60_000))
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  const { projectId, environment: slug } = await params;
  const project = await ownedProject(projectId, identity.user.id);
  if (!project)
    return Response.json({ error: "Project not found" }, { status: 404 });
  const [environment] = await getDb()
    .select()
    .from(environments)
    .where(
      and(eq(environments.projectId, projectId), eq(environments.slug, slug)),
    )
    .limit(1);
  if (!environment)
    return Response.json({ error: "Environment not found" }, { status: 404 });
  const rows = await getDb()
    .select()
    .from(secrets)
    .where(eq(secrets.environmentId, environment.id))
    .orderBy(secrets.key);
  const values = Object.fromEntries(
    rows.map((secret) => [secret.key, decryptSecret(secret)]),
  );
  await audit({
    userId: identity.user.id,
    projectId,
    environmentId: environment.id,
    action: "secrets.cli_downloaded",
    metadata: { token: identity.token.name, count: String(rows.length) },
  });
  return Response.json({
    project: { id: project.id, name: project.name, slug: project.slug },
    environment: {
      id: environment.id,
      name: environment.name,
      slug: environment.slug,
    },
    secrets: values,
  });
}
