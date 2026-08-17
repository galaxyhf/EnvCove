import Link from "next/link";
import { notFound } from "next/navigation";
import { GitCompareArrows } from "lucide-react";
import {
  and,
  desc,
  environments,
  eq,
  getDb,
  projects,
  secrets,
  secretVersions,
} from "@envcove/db";
import { requireUser } from "@/lib/authorization";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentCreateDialog } from "@/components/environment-create-dialog";
import { EnvironmentExportDialog } from "@/components/environment-export-dialog";
import { EnvironmentImportDialog } from "@/components/environment-import-dialog";
import { ProjectDeleteDialog } from "@/components/resource-delete-dialogs";
import { ProjectSecretSearch } from "@/components/project-secret-search";
import { SecretCreateDialog } from "@/components/secret-create-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SecretListItem } from "@/components/secret-row";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ env?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const query = await searchParams;
  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) notFound();
  const envs = await db
    .select()
    .from(environments)
    .where(eq(environments.projectId, projectId))
    .orderBy(environments.name);
  const selected =
    envs.find((e) => e.id === query.env || e.slug === query.env) ?? envs[0];
  const secretRows = selected
    ? await db
        .select()
        .from(secrets)
        .where(eq(secrets.environmentId, selected.id))
        .orderBy(secrets.key)
    : [];
  const versions = selected
    ? await db
        .select({
          secretId: secretVersions.secretId,
          createdAt: secretVersions.createdAt,
        })
        .from(secretVersions)
        .innerJoin(secrets, eq(secretVersions.secretId, secrets.id))
        .where(eq(secrets.environmentId, selected.id))
        .orderBy(desc(secretVersions.createdAt))
    : [];
  const list: SecretListItem[] = secretRows
    .map((s) => ({
      id: s.id,
      key: s.key,
      description: s.description,
      updatedAt: s.updatedAt.toISOString(),
      versions: versions
        .filter((v) => v.secretId === s.id)
        .map((v) => v.createdAt.toISOString()),
    }));
  const all = await db
    .select({ environmentId: secrets.environmentId, key: secrets.key })
    .from(secrets)
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .where(eq(environments.projectId, projectId));
  const keys = [...new Set(all.map((x) => x.key))].sort();
  return (
    <div>
      <div className="mb-7">
        <Link
          href="/dashboard/projects"
          className="text-xs text-muted-foreground"
        >
          Projetos /
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.description || project.slug}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <GitCompareArrows />
                  Comparar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Comparar ambientes</DialogTitle>
                  <DialogDescription>
                    Apenas a presença das chaves. Os valores continuam ocultos.
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left">Chave</th>
                        {envs.map((e) => (
                          <th key={e.id} className="px-3">
                            {e.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key) => (
                        <tr key={key} className="border-b">
                          <td className="py-3 font-mono text-xs">{key}</td>
                          {envs.map((e) => (
                            <td key={e.id} className="text-center text-primary">
                              {all.some(
                                (x) =>
                                  x.key === key && x.environmentId === e.id,
                              )
                                ? "✓"
                                : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
            <EnvironmentCreateDialog projectId={projectId} />
            <ProjectDeleteDialog
              projectId={projectId}
              projectName={project.name}
            />
          </div>
        </div>
      </div>
      <div className="mb-5 flex overflow-x-auto border-b">
        {envs.map((e) => (
          <Link
            key={e.id}
            href={`?env=${e.id}`}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm ${selected?.id === e.id ? "border-primary" : "border-transparent text-muted-foreground"}`}
          >
            {e.name}
          </Link>
        ))}
      </div>
      {selected ? (
        <Card>
          <CardContent className="p-0">
            <ProjectSecretSearch
              key={selected.id}
              secrets={list}
              environmentId={selected.id}
            >
              <div className="flex gap-2">
                <EnvironmentExportDialog environmentId={selected.id} />
                <EnvironmentImportDialog environmentId={selected.id} />
                <SecretCreateDialog environmentId={selected.id} />
              </div>
            </ProjectSecretSearch>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-20 text-center">
            Nenhum ambiente ainda.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
