import { z } from "zod";
import type { profileType } from "./Profile";

export const eventSchema = <T extends z.ZodTypeAny, U extends z.ZodTypeAny>(
	eventSchema: T,
	messageSchema: U,
) =>
	z.object({
		id: z.string(),
		publickey: z.string(),
		signature: z.string(),
		event: eventSchema,
		timestamp: z.string(),
		message: messageSchema,
	});

export type eventType<T, U> = {
	id: string;
	publickey: string;
	signature: string;
	event: T;
	timestamp: string;
	message: U;
};

export type feedReturnType<T, U, V = null> = {
	id: string;
	publickey: string;
	signature: string;
	event: T;
	timestamp: string;
	message: U;
	user: profileType;
	target: V extends null ? null : V;
};

export const baseEventSchema = eventSchema(z.string(), z.unknown());

export const deleteEventSchema = eventSchema(
	z.literal("event.delete"),
	z.object({
		target: z.string(),
	}),
);

export const migrateEventSchema = eventSchema(
	z.literal("event.migrate"),
	z.object({
		url: z.string(),
		body: z.array(baseEventSchema),
	}),
);

export type baseSchemaType = z.infer<typeof baseEventSchema>;
export type deleteSchemaType = z.infer<typeof deleteEventSchema>;
export type migrateSchemaType = z.infer<typeof migrateEventSchema>;
