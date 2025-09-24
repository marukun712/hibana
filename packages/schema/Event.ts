import { z } from "zod";

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

export const unknownEventSchema = eventSchema(
	z.string(),
	z.record(z.string(), z.any()),
);

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
		body: z.array(eventSchema(z.string(), z.record(z.string(), z.unknown()))),
	}),
);

export type unknownSchemaType = z.infer<typeof unknownEventSchema>;
export type deleteSchemaType = z.infer<typeof deleteEventSchema>;
export type migrateSchemaType = z.infer<typeof migrateEventSchema>;
