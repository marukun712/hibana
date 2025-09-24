import { CryptoUtils } from "../../../utils/crypto";
import { deleteAllEvents, putEvent } from "../../db";
import {
	eventSchema,
	type eventType,
	migrateEventSchema,
} from "../../schema/Event";
import { calculateHash } from "../hash";
import { findProfileDoc, updateUser } from "../user";

export const migrateRepo = async (event: eventType) => {
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(event);
	const parsedEvent = eventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	if (!verify) {
		throw new Error("Verify failed.");
	}
	if (parsedEvent.data.event !== "event.migrate") {
		throw new Error("Invalid event type");
	}
	const parsedMessage = migrateEventSchema.safeParse(parsedEvent.data.message);
	if (!parsedMessage.success) {
		console.error(
			"Migrate event schema validation failed:",
			parsedMessage.error,
		);
		throw new Error("Validation failed");
	}
	await deleteAllEvents(parsedEvent.data.publickey);
	parsedMessage.data.body.forEach(async (event) => {
		try {
			await migrateDoc(event);
		} catch (error) {
			console.error("Error migrating event:", error);
		}
	});
	const profile = await findProfileDoc(parsedEvent.data.publickey);
	updateUser({ ...profile, repository: parsedMessage.data.url });
};

export const migrateDoc = async (event: eventType) => {
	//データの検証
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(event);
	const parsedEvent = eventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	if (!verify) throw new Error("Verify failed.");
	await putEvent(event);
	return event;
};
