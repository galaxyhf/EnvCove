"use server";

import { encryptSecret } from "@envcove/crypto";
import {
  and,
  environments,
  eq,
  getDb,
  projects,
  secrets,
  secretVersions,
} from "@envcove/db";
import {
  environmentSchema,
  parseEnv,
  projectSchema,
  secretSchema,
} from "@envcove/shared";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import {
  ownedEnvironment,
  ownedProject,
  requireUser,
} from "@/lib/authorization";

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "project"
  );
}

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const input = projectSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    (
      await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.userId, user.id), eq(projects.slug, slug)))
        .limit(1)
    ).length
  ) {
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, 64 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  const [project] = await db
    .insert(projects)
    .values({ userId: user.id, slug, ...input })
    .returning();
  await db
    .insert(environments)
    .values([
      {
        projectId: project.id,
        name: "Desenvolvimento",
        slug: "development",
        description: "Ambiente de desenvolvimento",
      },
      {
        projectId: project.id,
        name: "Produção",
        slug: "production",
        description: "Ambiente de produção",
      },
    ]);
  await audit({
    userId: user.id,
    projectId: project.id,
    action: "project.created",
    metadata: { name: project.name },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function createEnvironment(projectId: string, formData: FormData) {
  const user = await requireUser();
  if (!(await ownedProject(projectId, user.id))) throw new Error("NOT_FOUND");
  const input = environmentSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    (
      await db
        .select({ id: environments.id })
        .from(environments)
        .where(
          and(
            eq(environments.projectId, projectId),
            eq(environments.slug, slug),
          ),
        )
        .limit(1)
    ).length
  ) {
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, 64 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  const [environment] = await db
    .insert(environments)
    .values({ projectId, slug, ...input })
    .returning();
  await audit({
    userId: user.id,
    projectId,
    environmentId: environment.id,
    action: "environment.created",
    metadata: { name: environment.name },
  });
  await db
    .update(projects)
    .set({ updatedAt: new Date() })
    .where(eq(projects.id, projectId));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  const project = await ownedProject(projectId, user.id);
  if (!project) throw new Error("NOT_FOUND");

  await getDb()
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  await audit({
    userId: user.id,
    action: "project.deleted",
    metadata: { name: project.name },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
}

export async function saveSecret(environmentId: string, formData: FormData) {
  const user = await requireUser();
  const ownership = await ownedEnvironment(environmentId, user.id);
  if (!ownership) throw new Error("NOT_FOUND");
  const input = secretSchema.parse(Object.fromEntries(formData));
  const db = getDb();
  const [existing] = await db
    .select()
    .from(secrets)
    .where(
      and(eq(secrets.environmentId, environmentId), eq(secrets.key, input.key)),
    )
    .limit(1);
  const encrypted = encryptSecret(input.value);
  if (existing) {
    await db
      .update(secrets)
      .set({
        ...encrypted,
        description: input.description,
        updatedAt: new Date(),
      })
      .where(eq(secrets.id, existing.id));
    await db
      .insert(secretVersions)
      .values({ secretId: existing.id, ...encrypted, createdBy: user.id });
  } else {
    const [created] = await db
      .insert(secrets)
      .values({
        environmentId,
        key: input.key,
        ...encrypted,
        description: input.description,
      })
      .returning();
    await db
      .insert(secretVersions)
      .values({ secretId: created.id, ...encrypted, createdBy: user.id });
  }
  await audit({
    userId: user.id,
    projectId: ownership.project.id,
    environmentId,
    action: existing ? "secret.updated" : "secret.created",
    metadata: { key: input.key },
  });
  await db
    .update(projects)
    .set({ updatedAt: new Date() })
    .where(eq(projects.id, ownership.project.id));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${ownership.project.id}`);
}

export async function restoreSecretVersion(versionId: string) {
  const user = await requireUser();
  const [row] = await getDb()
    .select({
      version: secretVersions,
      secret: secrets,
      environment: environments,
      project: projects,
    })
    .from(secretVersions)
    .innerJoin(secrets, eq(secretVersions.secretId, secrets.id))
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(secretVersions.id, versionId), eq(projects.userId, user.id)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  const restored = {
    encryptedValue: row.version.encryptedValue,
    iv: row.version.iv,
    authTag: row.version.authTag,
  };
  await getDb()
    .update(secrets)
    .set({ ...restored, updatedAt: new Date() })
    .where(eq(secrets.id, row.secret.id));
  await getDb()
    .insert(secretVersions)
    .values({ secretId: row.secret.id, ...restored, createdBy: user.id });
  await audit({
    userId: user.id,
    projectId: row.project.id,
    environmentId: row.environment.id,
    action: "secret.version_restored",
    metadata: { key: row.secret.key },
  });
  await getDb()
    .update(projects)
    .set({ updatedAt: new Date() })
    .where(eq(projects.id, row.project.id));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${row.project.id}`);
}

export async function importSecrets(environmentId: string, formData: FormData) {
  const file = formData.get("file");
  if (
    !(file instanceof File) ||
    !file.name.startsWith(".env") ||
    file.size === 0 ||
    file.size > 1024 * 1024
  ) {
    throw new Error("INVALID_ENV_FILE");
  }
  const content = await file.text();
  const variables = parseEnv(content);
  if (!variables.length) throw new Error("EMPTY_ENV_FILE");
  for (const variable of variables) {
    const data = new FormData();
    data.set("key", variable.key);
    data.set("value", variable.value);
    data.set("description", "Importada do .env");
    await saveSecret(environmentId, data);
  }
}

export async function deleteSecret(secretId: string) {
  const user = await requireUser();
  const [row] = await getDb()
    .select({ secret: secrets, environment: environments, project: projects })
    .from(secrets)
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(secrets.id, secretId), eq(projects.userId, user.id)))
    .limit(1);
  if (!row) throw new Error("NOT_FOUND");
  await getDb().delete(secrets).where(eq(secrets.id, secretId));
  await audit({
    userId: user.id,
    projectId: row.project.id,
    environmentId: row.environment.id,
    action: "secret.deleted",
    metadata: { key: row.secret.key },
  });
  await getDb()
    .update(projects)
    .set({ updatedAt: new Date() })
    .where(eq(projects.id, row.project.id));
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${row.project.id}`);
}
