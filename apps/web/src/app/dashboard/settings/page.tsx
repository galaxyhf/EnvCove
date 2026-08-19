import { and, desc, eq, getDb, gt, isNull, webSessions } from "@envcove/db";
import { AccountSettings } from "@/components/account-settings";
import { requireUser } from "@/lib/authorization";

function getDeviceLabel(userAgent: string) {
  if (!userAgent) return "Navegador desconhecido";
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Firefox/")
      ? "Firefox"
      : userAgent.includes("Chrome/")
        ? "Chrome"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Navegador";
  const system = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : "Dispositivo desconhecido";
  return `${browser} em ${system}`;
}
export default async function Page() {
  const user = await requireUser();
  const sessions = await getDb()
    .select()
    .from(webSessions)
    .where(
      and(
        eq(webSessions.userId, user.id),
        isNull(webSessions.revokedAt),
        gt(webSessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(webSessions.lastSeenAt));
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Conta</p>
        <h1 className="text-2xl font-semibold">Configurações</h1>
      </div>
      <AccountSettings
        user={{ name: user.name, email: user.email }}
        sessions={sessions.map((session) => ({
          id: session.id,
          device: getDeviceLabel(session.userAgent),
          ipAddress: session.ipAddress,
          createdAt: session.createdAt.toISOString(),
          lastSeenAt: session.lastSeenAt.toISOString(),
          current: session.id === user.sessionId,
        }))}
      />
    </div>
  );
}
