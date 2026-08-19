import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Braces,
  FolderKanban,
  TerminalSquare,
} from "lucide-react";
import {
  and,
  auditLogs,
  cliTokens,
  desc,
  environments,
  eq,
  getDb,
  isNull,
  projects,
  secrets,
} from "@envcove/db";
import { ProjectCreateDialog } from "@/components/project-create-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuditActionLabel } from "@/lib/audit-label";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireUser();
  const db = getDb();
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.updatedAt));
  const environmentRows = await db
    .select({
      id: environments.id,
      name: environments.name,
      projectId: environments.projectId,
    })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(eq(projects.userId, user.id));
  const secretRows = await db
    .select({
      id: secrets.id,
      environmentId: secrets.environmentId,
      key: secrets.key,
      description: secrets.description,
    })
    .from(secrets)
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(eq(projects.userId, user.id));
  const unusedTokens = await db
    .select({ id: cliTokens.id, name: cliTokens.name })
    .from(cliTokens)
    .where(
      and(
        eq(cliTokens.userId, user.id),
        isNull(cliTokens.lastUsedAt),
        isNull(cliTokens.revokedAt),
      ),
    );
  const activity = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(6);

  const projectSummaries = projectRows.slice(0, 5).map((project) => {
    const projectEnvironments = environmentRows.filter(
      (environment) => environment.projectId === project.id,
    );
    const environmentIds = new Set(
      projectEnvironments.map((environment) => environment.id),
    );
    const projectSecrets = secretRows.filter((secret) =>
      environmentIds.has(secret.environmentId),
    );
    return {
      ...project,
      environmentCount: projectEnvironments.length,
      secretCount: projectSecrets.length,
    };
  });

  const inconsistentProjects = projectRows.flatMap((project) => {
    const projectEnvironments = environmentRows.filter(
      (environment) => environment.projectId === project.id,
    );
    if (projectEnvironments.length < 2) return [];
    const keys = new Set(
      secretRows
        .filter((secret) =>
          projectEnvironments.some(
            (environment) => environment.id === secret.environmentId,
          ),
        )
        .map((secret) => secret.key),
    );
    const divergentKeys = [...keys].filter((key) =>
      projectEnvironments.some(
        (environment) =>
          !secretRows.some(
            (secret) =>
              secret.environmentId === environment.id && secret.key === key,
          ),
      ),
    );
    return divergentKeys.length ? [{ project, count: divergentKeys.length }] : [];
  });
  const variablesWithoutDescription = secretRows.filter(
    (secret) => !secret.description.trim(),
  );
  const attentionCount =
    inconsistentProjects.length +
    variablesWithoutDescription.length +
    unusedTokens.length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Espaço de trabalho</p>
          <h1 className="mt-1 text-2xl font-semibold">Visão geral</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Acompanhe o que mudou e resolva pendências sem procurar em cada
            projeto.
          </p>
        </div>
        <ProjectCreateDialog />
      </div>

      {!projectRows.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <FolderKanban className="mb-4 size-7 text-primary" />
            <h2 className="font-medium">Crie seu primeiro projeto</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              O EnvCove criará os ambientes de Desenvolvimento e Produção para
              você começar a importar variáveis.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <ProjectCreateDialog />
              <Button variant="outline" asChild>
                <Link href="/dashboard/cli-tokens">
                  <TerminalSquare />
                  Configurar CLI
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Atenção agora</CardTitle>
              <CardDescription>
                {attentionCount
                  ? `${attentionCount} pontos que merecem revisão.`
                  : "Nenhuma pendência detectada no espaço de trabalho."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {inconsistentProjects.map(({ project, count }) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}/compare`}
                  className="flex items-center justify-between gap-4 border-b p-4 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 gap-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "chave ausente" : "chaves ausentes"}{" "}
                        entre os ambientes.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
              ))}
              {variablesWithoutDescription.length ? (
                <Link
                  href="/dashboard/projects"
                  className="flex items-center justify-between gap-4 border-b p-4 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 gap-3">
                    <Braces className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Variáveis sem descrição</p>
                      <p className="text-xs text-muted-foreground">
                        {variablesWithoutDescription.length} variáveis precisam de
                        contexto para facilitar manutenção e auditoria.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
              ) : null}
              {unusedTokens.length ? (
                <Link
                  href="/dashboard/cli-tokens"
                  className="flex items-center justify-between gap-4 border-b p-4 hover:bg-muted/40"
                >
                  <div className="flex min-w-0 gap-3">
                    <TerminalSquare className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Tokens nunca usados</p>
                      <p className="text-xs text-muted-foreground">
                        {unusedTokens.length} tokens ainda não acessaram a CLI.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
              ) : null}
              {!attentionCount ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Ambientes consistentes, variáveis documentadas e tokens em uso.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Projetos recentes</CardTitle>
              <CardDescription>Continue de onde parou.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {projectSummaries.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between gap-4 border-b p-4 last:border-0 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {project.environmentCount} ambientes · {project.secretCount}{" "}
                      variáveis
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activity.length ? (
        <Card className="mt-6">
          <CardHeader className="border-b">
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activity.map((item) => {
              const href = item.projectId
                ? `/dashboard/projects/${item.projectId}${item.environmentId ? `?env=${item.environmentId}` : ""}`
                : "/dashboard/activity";
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="flex items-start justify-between gap-4 border-b p-4 last:border-0 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {getAuditActionLabel(item.action)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {Object.values(item.metadata).join(" · ") ||
                        "Espaço de trabalho"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {item.createdAt.toLocaleDateString("pt-BR")}
                  </time>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
