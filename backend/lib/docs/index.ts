import { hc } from "hono/client";
import { isCID } from "../../../utils/cid.ts";
import { CryptoUtils } from "../../../utils/crypto.ts";
import { deleteEvent, putEvent } from "../../db/index.ts";
import type { getRouteType } from "../../index.ts";
import {
	allDataSchema,
	documentSchema,
	type documentType,
	searchResult,
} from "../../schema/Document.ts";
import { eventSchema, type eventType } from "../../schema/Event.ts";
import type { deleteSchemaType } from "../../schema/Query.ts";
import { calculateHash } from "../hash.ts";
import { getDB } from "../instances/db.ts";
import {
	findProfileDoc,
	isUserPublickey,
	resolveIpfsDoc,
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

	if (data.status === 200) {
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
	} else {
		return null;
	}
};

export const getDoc = async (id: string) => {
	const docs = await searchDocs({ _id: id });

	if (docs[0]) {
		const event = docs[0].value;

		//eventを解決
		const record = await resolveRepositoryDoc(event);

		if (record) {
			if (event.target) {
				//targetが有効な公開鍵(ユーザーを指していた)場合
				if (await isUserPublickey(event.target)) {
					//ユーザーをターゲットとする
					const targetDoc = await findProfileDoc(event.target);

					return { ...record, target: targetDoc };
				} else if (isCID(event.target)) {
					const targetDoc = await resolveIpfsDoc(event.target);

					return { ...record, target: targetDoc };
				} else {
					//ターゲットがipfs上のファイルを指していた場合
					const doc = await searchDocs({ _id: event.target });
					if (!doc[0]) return null;
					const targetDoc = doc[0].value;

					//ドキュメントが指しているレコードをターゲットとする
					const targetRecord = await resolveRepositoryDoc(targetDoc);
					if (!targetRecord) return null;

					return { ...record, target: targetRecord };
				}
			} else {
				//targetがなければそのまま返す
				return { ...record, target: null };
			}
		} else {
			return null;
		}
	} else {
		return null;
	}
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

	if (verify) {
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
	} else {
		throw new Error("Verify failed.");
	}
};

export const deleteDoc = async (data: deleteSchemaType) => {
	const docs = await searchDocs({ _id: data.target });

	if (docs[0]) {
		const event = docs[0].value;
		const crypto = new CryptoUtils(calculateHash);

		//署名を検証して本人確認
		const isValid = await crypto.verifySignature(
			event.publickey,
			data.signature,
			data.content,
		);

		if (isValid) {
			deleteEvent({ id: data.target, publickey: event.publickey });
		} else {
			throw new Error("Verify failed.");
		}
	} else {
		throw new Error("Document is not found.");
	}
};
