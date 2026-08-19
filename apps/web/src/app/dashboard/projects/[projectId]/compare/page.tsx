import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Minus } from "lucide-react";
import {
  and,
  environments,
  eq,
  getDb,
  projects,
  secrets,
} from "@envcove/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) notFound();

  const environmentRows = await db
    .select()
    .from(environments)
    .where(eq(environments.projectId, project.id))
    .orderBy(environments.name);
  const secretRows = await db
    .select({ environmentId: secrets.environmentId, key: secrets.key })
    .from(secrets)
    .innerJoin(environments, eq(secrets.environmentId, environments.id))
    .where(eq(environments.projectId, project.id));
  const keys = [...new Set(secretRows.map((secret) => secret.key))].sort();
  const inconsistentKeys = keys.filter((key) =>
    environmentRows.some(
      (environment) =>
        !secretRows.some(
          (secret) =>
            secret.environmentId === environment.id && secret.key === key,
        ),
    ),
  );

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-5">
        <Link href={`/dashboard/projects/${project.id}`}>
          <ArrowLeft />
          Voltar ao projeto
        </Link>
      </Button>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{project.name}</p>
          <h1 className="mt-1 text-2xl font-semibold">Comparar ambientes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A comparação verifica somente a presença das chaves. Os valores
            permanecem criptografados e ocultos.
          </p>
        </div>
        {inconsistentKeys.length ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            {inconsistentKeys.length}{" "}
            {inconsistentKeys.length === 1
              ? "chave inconsistente"
              : "chaves inconsistentes"}
          </div>
        ) : null}
      </div>

      {environmentRows.length < 2 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-medium">Crie ao menos dois ambientes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A comparação precisa de dois conjuntos de variáveis.
            </p>
            <Button className="mt-5" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                Gerenciar ambientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : !keys.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-medium">Nenhuma variável para comparar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Importe ou adicione variáveis em um dos ambientes.
            </p>
            <Button className="mt-5" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                Adicionar variáveis
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-xl text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="sticky left-0 bg-card px-4 py-3 text-left font-medium">
                    Chave
                  </th>
                  {environmentRows.map((environment) => (
                    <th
                      key={environment.id}
                      className="min-w-36 px-4 py-3 text-center font-medium"
                    >
                      <Link
                        className="hover:underline"
                        href={`/dashboard/projects/${project.id}?env=${environment.id}`}
                      >
                        {environment.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const inconsistent = inconsistentKeys.includes(key);
                  return (
                    <tr
                      key={key}
                      className={inconsistent ? "bg-destructive/5" : undefined}
                    >
                      <th className="sticky left-0 border-b bg-card px-4 py-3 text-left font-mono text-xs font-normal">
                        {key}
                      </th>
                      {environmentRows.map((environment) => {
                        const exists = secretRows.some(
                          (secret) =>
                            secret.key === key &&
                            secret.environmentId === environment.id,
                        );
                        return (
                          <td
                            key={environment.id}
                            className="border-b px-4 py-3 text-center"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {exists ? (
                                <Check className="size-4 text-primary" />
                              ) : (
                                <Minus className="size-4 text-destructive" />
                              )}
                              <span className="sr-only">
                                {exists ? "Presente" : "Ausente"}
                              </span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
