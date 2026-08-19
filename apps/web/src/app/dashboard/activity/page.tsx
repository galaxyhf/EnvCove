import Link from "next/link";
import {
  and,
  auditLogs,
  desc,
  environments,
  eq,
  getDb,
  gte,
  lte,
  projects,
} from "@envcove/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actionLabels, getAuditActionLabel } from "@/lib/audit-label";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAuditHref(item: {
  action: string;
  projectId: string | null;
  environmentId: string | null;
}) {
  if (item.projectId) {
    return `/dashboard/projects/${item.projectId}${item.environmentId ? `?env=${item.environmentId}` : ""}`;
  }
  if (item.action.startsWith("cli_token.")) return "/dashboard/cli-tokens";
  if (item.action.startsWith("account.")) return "/dashboard/settings";
  if (item.action.startsWith("project.")) return "/dashboard/projects";
  return "/dashboard";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string;
    environment?: string;
    action?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const db = getDb();
  const projectRows = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(projects.name);
  const environmentRows = await db
    .select({
      id: environments.id,
      name: environments.name,
      projectId: environments.projectId,
      projectName: projects.name,
    })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(eq(projects.userId, user.id))
    .orderBy(projects.name, environments.name);

  const conditions = [eq(auditLogs.userId, user.id)];
  if (query.project && projectRows.some((project) => project.id === query.project))
    conditions.push(eq(auditLogs.projectId, query.project));
  if (
    query.environment &&
    environmentRows.some((environment) => environment.id === query.environment)
  )
    conditions.push(eq(auditLogs.environmentId, query.environment));
  if (query.action && actionLabels[query.action])
    conditions.push(eq(auditLogs.action, query.action));
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  if (from) conditions.push(gte(auditLogs.createdAt, from));
  if (to) conditions.push(lte(auditLogs.createdAt, to));

  const rows = await db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Registro de segurança</p>
        <h1 className="mt-1 text-2xl font-semibold">Atividade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filtre até 200 eventos recentes e abra o recurso relacionado.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="audit-project">Projeto</Label>
              <select
                id="audit-project"
                name="project"
                defaultValue={query.project ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                {projectRows.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-environment">Ambiente</Label>
              <select
                id="audit-environment"
                name="environment"
                defaultValue={query.environment ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                {environmentRows.map((environment) => (
                  <option key={environment.id} value={environment.id}>
                    {environment.projectName} · {environment.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-action">Ação</Label>
              <select
                id="audit-action"
                name="action"
                defaultValue={query.action ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todas</option>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-from">De</Label>
              <Input
                id="audit-from"
                name="from"
                type="date"
                defaultValue={query.from ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-to">Até</Label>
              <Input
                id="audit-to"
                name="to"
                type="date"
                defaultValue={query.to ?? ""}
              />
            </div>
            <div className="flex gap-2 md:col-span-2 xl:col-span-5">
              <Button type="submit">Aplicar filtros</Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/activity">Limpar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {rows.length ? (
            rows.map((item) => (
              <Link
                key={item.id}
                href={getAuditHref(item)}
                className="flex flex-col gap-2 border-b p-4 last:border-0 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {getAuditActionLabel(item.action)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {Object.values(item.metadata).join(" / ") ||
                      "Espaço de trabalho"}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {item.createdAt.toLocaleString("pt-BR")}
                </time>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="font-medium">Nenhum evento encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste ou limpe os filtros para ampliar a busca.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
