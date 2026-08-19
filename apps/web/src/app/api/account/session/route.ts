import { eq, getDb, webSessions } from "@envcove/db";
import { requireUser } from "@/lib/authorization";

export async function DELETE() {
  try {
    const user = await requireUser();
    await getDb()
      .update(webSessions)
      .set({ revokedAt: new Date() })
      .where(eq(webSessions.id, user.sessionId));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
