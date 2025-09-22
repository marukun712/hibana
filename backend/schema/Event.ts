import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const events = sqliteTable("events", {
	id: text("id").primaryKey(),
	publickey: text("publickey").notNull(),
	signature: text("signature").notNull(),
	event: text("event").notNull(),
	timestamp: text("timestamp").notNull(),
	message: text({ mode: "json" }).notNull(),
});

export const eventSchema = createSelectSchema(events);
export type eventType = z.infer<typeof eventSchema>;

export const deleteEventSchema = z.object({
	target: z.string(),
});

export const migrateEventSchema = z.object({
	url: z.string(),
	body: z.array(eventSchema),
});

export type deleteSchemaType = z.infer<typeof deleteEventSchema>;
export type migrateSchemaType = z.infer<typeof migrateEventSchema>;
