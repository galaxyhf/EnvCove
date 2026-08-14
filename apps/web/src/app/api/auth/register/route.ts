import { hash } from "bcryptjs";
import { eq, getDb, users } from "@envvault/db";
import { registerSchema } from "@envvault/shared";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revise os dados informados." }, { status: 400 });
  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing) return Response.json({ error: "Este email já está cadastrado." }, { status: 409 });
  const [user] = await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hash(parsed.data.password, 12),
  }).returning({ id: users.id, name: users.name, email: users.email });
  return Response.json({ user }, { status: 201 });
}
