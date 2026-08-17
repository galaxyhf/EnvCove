import { auditLogs, getDb } from "@envcove/db";

export async function audit(input: {
  userId: string;
  action: string;
  projectId?: string;
  environmentId?: string;
  metadata?: Record<string, string>;
}) {
  await getDb()
    .insert(auditLogs)
    .values({ ...input, metadata: input.metadata ?? {} });
}
