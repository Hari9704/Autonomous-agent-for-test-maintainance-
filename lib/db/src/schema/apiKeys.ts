import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Mock/demo checkout record: no real payment processor is involved. Buying
// "MCP access" instantly issues an API key used to gate the MCP server and
// the sandbox REST endpoint exposed by this showcase.
export const apiKeysTable = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  key: text("key").notNull().unique(),
  plan: text("plan").notNull().default("mcp_access"),
  amountCents: integer("amount_cents").notNull().default(500),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeysTable).omit({
  id: true,
  key: true,
  createdAt: true,
});
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeysTable.$inferSelect;
