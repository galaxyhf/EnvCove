import { createHash } from "node:crypto";
import { and, cliTokens, eq, getDb, isNull, users } from "@envvault/db";

export async function authenticateCli(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token?.startsWith("ev_live_")) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [result] = await getDb().select({ token: cliTokens, user: users }).from(cliTokens)
    .innerJoin(users, eq(cliTokens.userId, users.id))
    .where(and(eq(cliTokens.tokenHash, tokenHash), isNull(cliTokens.revokedAt))).limit(1);
  if (!result || (result.token.expiresAt && result.token.expiresAt < new Date())) return null;
  await getDb().update(cliTokens).set({ lastUsedAt: new Date() }).where(eq(cliTokens.id, result.token.id));
  return result;
}
