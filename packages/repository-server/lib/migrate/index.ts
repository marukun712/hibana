import {
	type migrateSchemaType,
	unknownEventSchema,
	type unknownSchemaType,
} from "@hibana/schema";
import { verifySecureMessage } from "@hibana/utils";
import { deleteAllEvents, putEvent } from "../../db/index";
import { calculateHash } from "../hash";
import { findProfileDoc, updateUser } from "../user";

export const migrateRepo = async (event: migrateSchemaType) => {
	const verify = await verifySecureMessage(event, calculateHash);
	if (!verify) throw new Error("Verify failed.");
	await deleteAllEvents(event.publickey);
	event.message.body.forEach(async (event) => {
		try {
			await migrateDoc(event);
		} catch (error) {
			console.error("Error migrating event:", error);
		}
	});
	const profile = await findProfileDoc(event.publickey);
	updateUser({ ...profile, repository: event.message.url });
};

export const migrateDoc = async (event: unknownSchemaType) => {
	//データの検証
	const verify = await verifySecureMessage(event, calculateHash);
	const parsedEvent = unknownEventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	if (!verify) throw new Error("Verify failed.");
	await putEvent(event);
	return event;
};
