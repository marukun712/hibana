import {
	allDataSchema,
	documentSchema,
	type documentType,
	searchResult,
} from "@hibana/schema/Document";
import {
	deleteEventSchema,
	eventSchema,
	type eventType,
} from "@hibana/schema/Event";
import { isCID } from "@hibana/utils/cid";
import { CryptoUtils } from "@hibana/utils/crypto";
import { hc } from "hono/client";
import { deleteEvent, putEvent } from "../../db/index.ts";
import type { getRouteType } from "../../index.ts";
import { calculateHash } from "../hash.ts";
import { getDB } from "../instances/db.ts";
import {
	findProfileDoc,
	isUserPublickey,
	resolveUserDoc,
} from "../user/index.ts";

export const writeDoc = async (document: documentType) => {
	const parsed = documentSchema.safeParse(document);
	if (!parsed.success) {
		console.error("Document schema validation failed:", parsed.error);
		throw new Error("Verify failed.");
	}
	const db = await getDB();
	await db.put(document);
};

export const getAllDocs = async () => {
	const db = await getDB();
	const data = await db.all();
	const parsed = allDataSchema.safeParse(data);
	if (!parsed.success) {
		console.error("Search result schema validation failed:", parsed.error);
		throw new Error("Verify failed.");
	}
	return parsed.data;
};

export const searchDocs = async (query: { [key: string]: string }) => {
	const db = await getDB();
	const result = await db.query((doc: documentType) =>
		Object.entries(query).every(
			([key, value]) => doc[key as keyof documentType] === value,
		),
	);
	const parsed = searchResult.safeParse(result);
	if (!parsed.success) {
		console.error("Search result schema validation failed:", parsed.error);
		throw new Error("Verify failed.");
	}
	const data = parsed.data.map((doc) => {
		return { value: doc };
	});
	return data;
};

//orbitdb上のレコードからリポジトリサーバーのレコードを解決
export const resolveRepositoryDoc = async (document: documentType) => {
	//もしeventがprofile更新イベントなら
	if (document.event === "event.profile") {
		return null;
	}
	//通常イベント時の処理
	const doc = await findProfileDoc(document.publickey);
	if (!doc) return null;
	//リポジトリサーバーに接続
	const client = hc<getRouteType>(doc.repository);
	const data = await client.get.$get({
		query: { id: document._id, publickey: document.publickey },
	});
	if (data.status !== 200) return null;
	const json = await data.json();
	const parsedEvent = eventSchema.safeParse(json);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		return null;
	}
	const event = parsedEvent.data;
	//データの検証
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(event);
	if (!verify) {
		return null;
	}
	//投稿者のプロフィール付きで返す
	return { ...event, user: doc };
};

export const getDoc = async (id: string) => {
	const docs = await searchDocs({ _id: id });
	if (!docs[0]) return null;
	const event = docs[0].value;
	const record = await resolveRepositoryDoc(event);
	if (!record) return null;
	// target が存在しない場合
	if (!event.target) {
		return { ...record, target: null };
	}
	// target がユーザーの公開鍵の場合
	if (await isUserPublickey(event.target)) {
		const targetDoc = await findProfileDoc(event.target);
		return { ...record, target: targetDoc };
	}
	// target が IPFS の CID の場合
	if (isCID(event.target)) {
		const targetDoc = await resolveUserDoc(event.target);
		return { ...record, target: targetDoc };
	}
	// target が他のドキュメントIDの場合
	const doc = await searchDocs({ _id: event.target });
	if (!doc[0]) return null;
	const targetDoc = doc[0].value;
	const targetRecord = await resolveRepositoryDoc(targetDoc);
	if (!targetRecord) return null;
	return { ...record, target: targetRecord };
};

export const putDoc = async (event: eventType) => {
	//データの検証
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(event);
	const parsedEvent = eventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	const message = event.message as { target?: string; [key: string]: unknown };
	//target付きのイベント(pinやfollowなど)か判定
	const target = message.target ? message.target : null;
	if (!verify) throw new Error("Verify failed.");
	const document: documentType = {
		_id: event.id,
		event: event.event,
		target,
		publickey: event.publickey,
		timestamp: event.timestamp,
	};
	const parsed = documentSchema.safeParse(document);
	//orbitdbにeventを保存
	if (parsed.success) {
		await writeDoc(parsed.data);
	}
	//リポジトリにも保存
	await putEvent(event);
	return event;
};

export const deleteDoc = async (event: eventType) => {
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifySecureMessage(event);
	const parsedEvent = eventSchema.safeParse(event);
	if (!parsedEvent.success) {
		console.error("Event schema validation failed:", parsedEvent.error);
		throw new Error("Validation failed");
	}
	if (parsedEvent.data.event !== "event.delete") {
		throw new Error("Invalid event type");
	}
	if (!verify) {
		throw new Error("Verify failed.");
	}
	const parsedMessage = deleteEventSchema.safeParse(parsedEvent.data.message);
	if (!parsedMessage.success) {
		console.error(
			"Delete event schema validation failed:",
			parsedMessage.error,
		);
		throw new Error("Validation failed");
	}
	const data = parsedMessage.data;
	const docs = await searchDocs({ _id: data.target });
	if (!docs[0]) {
		throw new Error("Document is not found.");
	}
	const foundEvent = docs[0].value;
	await deleteEvent({ id: data.target, publickey: foundEvent.publickey });
};
