import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema, type Json } from "drizzle-zod";
import { z } from "zod";

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  publickey: text("publickey").notNull(),
  signature: text("signature").notNull(),
  event: text("event").notNull(),
  timestamp: text("timestamp").notNull(),
  message: text({ mode: "json" }).notNull(),
});

export const defaultEventSchema = createSelectSchema(events);
export type defaultEvent = z.infer<typeof defaultEventSchema> & {
  message: Json | Record<string, any>;
};
