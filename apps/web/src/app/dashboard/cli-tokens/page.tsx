import { cliTokens, desc, eq, getDb } from "@envcove/db";
import { requireUser } from "@/lib/authorization";
import { CliTokenManager } from "@/components/cli-token-manager";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  const rows = await getDb()
    .select()
    .from(cliTokens)
    .where(eq(cliTokens.userId, user.id))
    .orderBy(desc(cliTokens.createdAt));
  return (
    <CliTokenManager
      tokens={rows
        .filter((t) => !t.revokedAt)
        .map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
        }))}
    />
  );
}
