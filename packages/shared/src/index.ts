import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(240).optional().default(""),
});

export const environmentSchema = projectSchema.pick({
  name: true,
  slug: true,
  description: true,
});

export const secretSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  value: z.string().max(65536),
  description: z.string().trim().max(240).optional().default(""),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(9).max(128),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type EnvironmentInput = z.infer<typeof environmentSchema>;
export type SecretInput = z.infer<typeof secretSchema>;

export function parseEnv(
  content: string,
): Array<{ key: string; value: string }> {
  const variables: Array<{ key: string; value: string }> = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7) : line;
    const separator = normalized.indexOf("=");
    if (separator < 1) continue;
    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const parsed = secretSchema
      .pick({ key: true, value: true })
      .safeParse({ key, value });
    if (parsed.success) variables.push(parsed.data);
  }
  return variables;
}

export function serializeEnv(
  values: Array<{ key: string; value: string }>,
): string {
  return (
    values
      .map(({ key, value }) => `${key}=${JSON.stringify(value)}`)
      .join("\n") + "\n"
  );
}
