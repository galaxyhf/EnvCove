import { auditLogs, desc, eq, getDb } from "@envvault/db";
import { requireUser } from "@/lib/authorization";
import { Card, CardContent } from "@/components/ui/card";
import { getAuditActionLabel } from "@/lib/audit-label";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  const rows = await getDb()
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Registro de segurança</p>
        <h1 className="text-2xl font-semibold">Atividade</h1>
      </div>
      <Card>
        <CardContent className="p-0">
          {rows.length ? (
            rows.map((x) => (
              <div
                key={x.id}
                className="flex justify-between border-b p-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {getAuditActionLabel(x.action)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Object.values(x.metadata).join(" / ") ||
                      "Espaço de trabalho"}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {x.createdAt.toLocaleString("pt-BR")}
                </time>
              </div>
            ))
          ) : (
            <p className="py-20 text-center text-sm text-muted-foreground">
              Nenhuma atividade registrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
