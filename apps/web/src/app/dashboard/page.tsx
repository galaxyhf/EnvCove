import { Activity, Braces, FolderKanban, Layers3 } from "lucide-react";
import {
  auditLogs,
  desc,
  environments,
  eq,
  getDb,
  projects,
  secrets,
} from "@envvault/db";
import { requireUser } from "@/lib/authorization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditActionLabel } from "@/lib/audit-label";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  const db = getDb();
  const projectRows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id));
  const envRows = await db
    .select({ id: environments.id })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(eq(projects.userId, user.id));
  const secretRows = await db
    .select({ id: secrets.id })
    .from(secrets)
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(eq(projects.userId, user.id));
  const activity = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(6);
  const stats = [
    ["Projetos", projectRows.length, FolderKanban],
    ["Variáveis", secretRows.length, Braces],
    ["Ambientes", envRows.length, Layers3],
    ["Alterações recentes", activity.length, Activity],
  ] as const;
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Espaço de trabalho</p>
        <h1 className="mt-1 text-2xl font-semibold">Visão geral</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length ? (
            activity.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-4 last:border-0"
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
                <time className="text-xs text-muted-foreground">
                  {item.createdAt.toLocaleDateString("pt-BR")}
                </time>
              </div>
            ))
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhuma atividade ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
