import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, apiKeysTable, type ApiKey } from "@workspace/db";

export function generateApiKey(): string {
  return `qamcp_${crypto.randomBytes(24).toString("hex")}`;
}

export async function createApiKey(
  email: string,
  plan: string,
  amountCents: number,
): Promise<ApiKey> {
  const [row] = await db
    .insert(apiKeysTable)
    .values({ email, plan, amountCents, key: generateApiKey() })
    .returning();

  return row;
}

export async function findApiKey(key: string): Promise<ApiKey | undefined> {
  const [row] = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.key, key));

  return row;
}
