"use server";

import { compare, hash } from "bcryptjs";
import {
  and,
  eq,
  getDb,
  isNull,
  ne,
  users,
  webSessions,
} from "@envcove/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/authorization";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  currentPassword: z.string().min(1),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(9).max(200),
    confirmPassword: z.string().min(1),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    message: "PASSWORD_MISMATCH",
  });

export async function updateProfile(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("INVALID_PROFILE");

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);
  if (!user || !(await compare(parsed.data.currentPassword, user.passwordHash)))
    throw new Error("INVALID_PASSWORD");

  const [emailOwner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (emailOwner && emailOwner.id !== user.id) throw new Error("EMAIL_IN_USE");

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      email: parsed.data.email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  await audit({
    userId: user.id,
    action: "account.profile_updated",
    metadata: { email: parsed.data.email },
  });
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/settings");
}

export async function changePassword(formData: FormData) {
  const currentUser = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("INVALID_PASSWORD_DATA");

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);
  if (!user || !(await compare(parsed.data.currentPassword, user.passwordHash)))
    throw new Error("INVALID_PASSWORD");

  await db
    .update(users)
    .set({
      passwordHash: await hash(parsed.data.newPassword, 12),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  await db
    .update(webSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(webSessions.userId, user.id),
        ne(webSessions.id, currentUser.sessionId),
        isNull(webSessions.revokedAt),
      ),
    );
  await audit({
    userId: user.id,
    action: "account.password_changed",
  });
  revalidatePath("/dashboard/settings");
}

export async function revokeWebSession(sessionId: string) {
  const currentUser = await requireUser();
  const parsed = z.uuid().safeParse(sessionId);
  if (!parsed.success || parsed.data === currentUser.sessionId)
    throw new Error("INVALID_SESSION");

  const [revoked] = await getDb()
    .update(webSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(webSessions.id, parsed.data),
        eq(webSessions.userId, currentUser.id),
        isNull(webSessions.revokedAt),
      ),
    )
    .returning({ id: webSessions.id });
  if (!revoked) throw new Error("SESSION_NOT_FOUND");

  await audit({
    userId: currentUser.id,
    action: "account.session_revoked",
  });
  revalidatePath("/dashboard/settings");
}

export async function revokeOtherWebSessions() {
  const currentUser = await requireUser();
  const now = new Date();

  await getDb()
    .update(webSessions)
    .set({ revokedAt: now })
    .where(
      and(
        eq(webSessions.userId, currentUser.id),
        ne(webSessions.id, currentUser.sessionId),
        isNull(webSessions.revokedAt),
      ),
    );

  await audit({
    userId: currentUser.id,
    action: "account.other_sessions_revoked",
  });
  revalidatePath("/dashboard/settings");
}
