"use server";

import { encryptSecret } from "@envvault/crypto";
import { and, environments, eq, getDb, projects, secrets, secretVersions } from "@envvault/db";
import { environmentSchema, parseEnv, projectSchema, secretSchema } from "@envvault/shared";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { ownedEnvironment, ownedProject, requireUser } from "@/lib/authorization";

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const input = projectSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const [project] = await db.insert(projects).values({ userId: user.id, ...input }).returning();
  await db.insert(environments).values({ projectId: project.id, name: "Development", slug: "development", description: "Local development" });
  await audit({ userId: user.id, projectId: project.id, action: "project.created", metadata: { name: project.name } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function createEnvironment(projectId: string, formData: FormData) {
  const user = await requireUser();
  if (!(await ownedProject(projectId, user.id))) throw new Error("NOT_FOUND");
  const input = environmentSchema.parse(Object.fromEntries(formData));
  const [environment] = await getDb().insert(environments).values({ projectId, ...input }).returning();
  await audit({ userId: user.id, projectId, environmentId: environment.id, action: "environment.created", metadata: { name: environment.name } });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function saveSecret(environmentId: string, formData: FormData) {
  const user = await requireUser();
  const ownership = await ownedEnvironment(environmentId, user.id);
  if (!ownership) throw new Error("NOT_FOUND");
  const input = secretSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const [existing] = await db.select().from(secrets).where(and(eq(secrets.environmentId, environmentId), eq(secrets.key, input.key))).limit(1);
  const encrypted = encryptSecret(input.value);
  if (existing) {
    await db.update(secrets).set({ ...encrypted, description: input.description, updatedAt: new Date() }).where(eq(secrets.id, existing.id));
    await db.insert(secretVersions).values({ secretId: existing.id, ...encrypted, createdBy: user.id });
  } else {
    const [created] = await db.insert(secrets).values({ environmentId, key: input.key, ...encrypted, description: input.description }).returning();
    await db.insert(secretVersions).values({ secretId: created.id, ...encrypted, createdBy: user.id });
  }
  await audit({ userId: user.id, projectId: ownership.project.id, environmentId, action: existing ? "secret.updated" : "secret.created", metadata: { key: input.key } });
  revalidatePath(`/dashboard/projects/${ownership.project.id}`);
}

export async function restoreSecretVersion(versionId: string) {
  const user = await requireUser();
  const [row] = await getDb().select({ version: secretVersions, secret: secrets, environment: environments, project: projects })
    .from(secretVersions).innerJoin(secrets, eq(secretVersions.secretId, secrets.id)).innerJoin(environments, eq(secrets.environmentId, environments.id)).innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(secretVersions.id, versionId), eq(projects.userId, user.id))).limit(1);
  if (!row) throw new Error("NOT_FOUND");
  const restored = { encryptedValue: row.version.encryptedValue, iv: row.version.iv, authTag: row.version.authTag };
  await getDb().update(secrets).set({ ...restored, updatedAt: new Date() }).where(eq(secrets.id, row.secret.id));
  await getDb().insert(secretVersions).values({ secretId: row.secret.id, ...restored, createdBy: user.id });
  await audit({ userId: user.id, projectId: row.project.id, environmentId: row.environment.id, action: "secret.version_restored", metadata: { key: row.secret.key } });
  revalidatePath(`/dashboard/projects/${row.project.id}`);
}

export async function importSecrets(environmentId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "");
  const variables = parseEnv(content);
  for (const variable of variables) {
    const data = new FormData();
    data.set("key", variable.key);
    data.set("value", variable.value);
    data.set("description", "Imported from .env");
    await saveSecret(environmentId, data);
  }
}

export async function deleteSecret(secretId: string) {
  const user = await requireUser();
  const [row] = await getDb().select({ secret: secrets, environment: environments, project: projects })
    .from(secrets).innerJoin(environments, eq(secrets.environmentId, environments.id)).innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(secrets.id, secretId), eq(projects.userId, user.id))).limit(1);
  if (!row) throw new Error("NOT_FOUND");
  await getDb().delete(secrets).where(eq(secrets.id, secretId));
  await audit({ userId: user.id, projectId: row.project.id, environmentId: row.environment.id, action: "secret.deleted", metadata: { key: row.secret.key } });
  revalidatePath(`/dashboard/projects/${row.project.id}`);
}
