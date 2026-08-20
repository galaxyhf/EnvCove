import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { randomUUID } from "node:crypto";
import { compare } from "bcryptjs";
import {
  and,
  desc,
  eq,
  getDb,
  gt,
  inArray,
  isNull,
  users,
  webSessions,
} from "@envcove/db";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, deviceId: {} },
      authorize: async (credentials, request) => {
        const parsed = z
          .object({
            email: z.email(),
            password: z.string().min(1),
            deviceId: z.uuid().optional(),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const [user] = await getDb()
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);
        if (!user || !(await compare(parsed.data.password, user.passwordHash)))
          return null;
        const db = getDb();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const deviceId = parsed.data.deviceId ?? randomUUID();
        const userAgent = request.headers.get("user-agent") ?? "";
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
        const [deviceSession] = await db
          .select({ id: webSessions.id })
          .from(webSessions)
          .where(
            and(
              eq(webSessions.userId, user.id),
              eq(webSessions.deviceId, deviceId),
            ),
          )
          .limit(1);
        const legacySessions = deviceSession
          ? []
          : await db
              .select({ id: webSessions.id })
              .from(webSessions)
              .where(
                and(
                  eq(webSessions.userId, user.id),
                  isNull(webSessions.deviceId),
                  isNull(webSessions.revokedAt),
                  gt(webSessions.expiresAt, now),
                  eq(webSessions.userAgent, userAgent),
                ),
              )
              .orderBy(desc(webSessions.lastSeenAt));

        let webSessionId = deviceSession?.id ?? legacySessions[0]?.id;
        if (webSessionId) {
          await db
            .update(webSessions)
            .set({
              deviceId,
              userAgent,
              ipAddress,
              lastSeenAt: now,
              expiresAt,
              revokedAt: null,
            })
            .where(eq(webSessions.id, webSessionId));

          const duplicateIds = legacySessions.slice(1).map(({ id }) => id);
          if (duplicateIds.length) {
            await db
              .update(webSessions)
              .set({ revokedAt: now })
              .where(inArray(webSessions.id, duplicateIds));
          }
        } else {
          const [createdSession] = await db
            .insert(webSessions)
            .values({
              userId: user.id,
              deviceId,
              userAgent,
              ipAddress,
              expiresAt,
            })
            .onConflictDoUpdate({
              target: [webSessions.userId, webSessions.deviceId],
              set: {
                userAgent,
                ipAddress,
                lastSeenAt: now,
                expiresAt,
                revokedAt: null,
              },
            })
            .returning({ id: webSessions.id });
          if (!createdSession) throw new Error("SESSION_CREATE_FAILED");
          webSessionId = createdSession.id;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          sessionId: webSessionId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user?.sessionId) token.sessionId = user.sessionId;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (token.sessionId) session.sessionId = token.sessionId;
      return session;
    },
  },
});
