import { createHash, randomBytes } from "node:crypto";
import { and, cliTokens, eq, getDb, isNull } from "@envvault/db";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/authorization";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(80),
        expiresAt: z.string().datetime().optional(),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { error: "Invalid token settings" },
        { status: 400 },
      );
    const raw = `ev_live_${randomBytes(24).toString("base64url")}`;
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    const [token] = await getDb()
      .insert(cliTokens)
      .values({
        userId: user.id,
        name: parsed.data.name,
        tokenHash,
        tokenPrefix: `${raw.slice(0, 15)}…`,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      })
      .returning({
        id: cliTokens.id,
        name: cliTokens.name,
        createdAt: cliTokens.createdAt,
      });
    await audit({
      userId: user.id,
      action: "cli_token.created",
      metadata: { name: token.name },
    });
    return Response.json(
      { token: raw, record: token },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const parsed = z.object({ id: z.uuid() }).safeParse(await request.json());
    if (!parsed.success)
      return Response.json({ error: "Invalid token" }, { status: 400 });
    const [token] = await getDb()
      .update(cliTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(cliTokens.id, parsed.data.id),
          eq(cliTokens.userId, user.id),
          isNull(cliTokens.revokedAt),
        ),
      )
      .returning({ name: cliTokens.name });
    if (!token)
      return Response.json({ error: "Token not found" }, { status: 404 });
    await audit({
      userId: user.id,
      action: "cli_token.revoked",
      metadata: { name: token.name },
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
