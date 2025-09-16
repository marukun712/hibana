import { sqliteTable, text } from "drizzle-orm/sqlite-core";
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

// 各イベントタイプのメッセージ型定義
export const postContentSchema = z.object({
	content: z.string(),
});

export const replyContentSchema = z.object({
	target: z.string(),
	content: z.string(),
});

export const repostContentSchema = z.object({
	target: z.string(),
});

export const quoteRepostContentSchema = z.object({
	target: z.string(),
	content: z.string(),
});

export const followContentSchema = z.object({
	target: z.string(),
});

export const pinContentSchema = z.object({
	target: z.string(),
});

// イベントタイプのユニオン型
export type EventContent =
	| z.infer<typeof postContentSchema>
	| z.infer<typeof replyContentSchema>
	| z.infer<typeof repostContentSchema>
	| z.infer<typeof quoteRepostContentSchema>
	| z.infer<typeof followContentSchema>
	| z.infer<typeof pinContentSchema>;

export const eventSchema = createSelectSchema(events);
export type eventType = z.infer<typeof eventSchema> & {
	message: Json | EventContent;
};
