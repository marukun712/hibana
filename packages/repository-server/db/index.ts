import { eq } from "drizzle-orm";
import { CryptoUtils } from "../../utils/crypto.ts";
import { calculateHash } from "../lib/hash.ts";
import { events, type eventType } from "../schema/Event.ts";
import type { getSchemaType } from "../schema/Query.ts";
import { getDB } from "./db.ts";

export const getEvent = async (json: getSchemaType) => {
	const db = getDB(json.publickey);
	const data = await db.select().from(events).where(eq(events.id, json.id));

	const post = data[0];
	if (!post) throw new Error("Event is not found");

	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(post as eventType);
	if (!verify) throw new Error("Verify failed");

	return post;
};

export const getAllEvents = async (publickey: string) => {
	const db = getDB(publickey);
	const data = await db.select().from(events);
	return data;
};

export const putEvent = async (json: eventType) => {
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
