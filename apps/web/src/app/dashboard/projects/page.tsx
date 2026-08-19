import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import {
  countDistinct,
  desc,
  environments,
  eq,
  getDb,
  projects,
  secrets,
} from "@envcove/db";
import { requireUser } from "@/lib/authorization";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectCreateDialog } from "@/components/project-create-dialog";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  const rows = await getDb()
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      updatedAt: projects.updatedAt,
      environments: countDistinct(environments.id),
      secrets: countDistinct(secrets.id),
    })
    .from(projects)
    .leftJoin(environments, eq(projects.id, environments.projectId))
    .leftJoin(secrets, eq(environments.id, secrets.environmentId))
    .where(eq(projects.userId, user.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.updatedAt));
  return (
    <div>
      <div className="mb-8 flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Espaço de trabalho</p>
          <h1 className="mt-1 text-2xl font-semibold">Projetos</h1>
        </div>
        <ProjectCreateDialog />
      </div>
      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="h-full hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <FolderKanban className="size-5" />
                    <ArrowRight className="size-4" />
                  </div>
                  <h2 className="mt-5 font-medium">{p.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.description || "Sem descrição"}
                  </p>
                  <p className="mt-5 border-t pt-4 font-mono text-xs text-muted-foreground">
                    {p.environments} ambientes · {p.secrets} variáveis
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="font-medium">Nenhum projeto ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie seu primeiro projeto para começar a gerenciar variáveis.
            </p>
            <div className="mt-5">
              <ProjectCreateDialog />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
