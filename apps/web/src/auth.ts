import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq, getDb, users, webSessions } from "@envcove/db";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials, request) => {
        const parsed = z
          .object({ email: z.email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const [user] = await getDb()
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);
        if (!user || !(await compare(parsed.data.password, user.passwordHash)))
          return null;
        const forwardedFor = request.headers.get("x-forwarded-for");
        const [webSession] = await getDb()
          .insert(webSessions)
          .values({
            userId: user.id,
            userAgent: request.headers.get("user-agent") ?? "",
            ipAddress: forwardedFor?.split(",")[0]?.trim() || null,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
          .returning({ id: webSessions.id });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          sessionId: webSession.id,
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
