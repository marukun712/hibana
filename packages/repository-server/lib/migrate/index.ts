import {
	baseEventSchema,
	type baseSchemaType,
	type migrateSchemaType,
} from "@hibana/schema";
import { verifySecureMessage } from "@hibana/utils";
import { deleteAllEvents, putEvent } from "../../db/index";
import { calculateHash } from "../hash";
import { updateUser } from "../user";

export const migrateRepo = async (event: migrateSchemaType) => {
	const verify = await verifySecureMessage(event, calculateHash);
	if (!verify) throw new Error("Verify failed.");
	await deleteAllEvents(event.publickey);
	await Promise.all(
		event.message.body.map((ev) =>
			migrateDoc(ev).catch((error) => {
				console.error("Error migrating event:", error);
			}),
		),
	);
	updateUser(event.message.doc);
};

export const migrateDoc = async (event: baseSchemaType) => {
	//データの検証
	const verify = await verifySecureMessage(event, calculateHash);
	const parsedEvent = baseEventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	if (!verify) throw new Error("Verify failed.");
	await putEvent(event);
};
