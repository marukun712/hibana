import type { baseSchemaType, getSchemaType } from "@hibana/schema";
import { verifySecureMessage } from "@hibana/utils";
import { eq } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { calculateHash } from "../lib/hash.ts";
import { getDB } from "./db.ts";

export const events = sqliteTable("events", {
	id: text("id").primaryKey(),
	publickey: text("publickey").notNull(),
	signature: text("signature").notNull(),
	event: text("event").notNull(),
	timestamp: text("timestamp").notNull(),
	message: text({ mode: "json" }).notNull(),
});

export const getEvent = async (json: getSchemaType) => {
	const db = getDB(json.publickey);
	const data = await db.select().from(events).where(eq(events.id, json.id));

	const post = data[0];
	if (!post) throw new Error("Event is not found");

	const verify = await verifySecureMessage(
		post as baseSchemaType,
		calculateHash,
	);
	if (!verify) throw new Error("Verify failed");

	return post;
};

export const getAllEvents = async (publickey: string) => {
	const db = getDB(publickey);
	const data = await db.select().from(events);
	return data;
};

export const putEvent = async (json: baseSchemaType) => {
	const db = getDB(json.publickey);
	await db.insert(events).values(json);
};

export const deleteEvent = async (json: getSchemaType) => {
	const db = getDB(json.publickey);
	await db.delete(events).where(eq(events.id, json.id));
};

export const deleteAllEvents = async (publickey: string) => {
	const db = getDB(publickey);
	await db.delete(events);
};
