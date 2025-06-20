import { hc } from "hono/client";
import type { getRouteType } from "../../index.ts";
import { getDB } from "../instances/db.ts";
import { findProfileDoc, resolveIpfsDoc } from "../user/index.ts";
import { Crypto, isValidPublickey } from "../../../utils/crypto.ts";
import { calculateHash } from "../hash.ts";
import {
  allDataSchema,
  documentSchema,
  searchResult,
  type documentType,
} from "../../schema/Document.ts";
import { type eventType, EventSchema } from "../../schema/Event.ts";
import { putRecord } from "../../db/index.ts";
import { isCID } from "../../../utils/cid.ts";

export const writeDocument = async (document: documentType) => {
  const parsed = documentSchema.safeParse(document);

  if (!parsed.success) {
    console.error("Document schema validation failed:", parsed.error);
    return;
  }

  const db = await getDB();
  await db.put(document);
};

export const getAllDocument = async () => {
  const db = await getDB();
  const data = await db.all();

  const parsed = allDataSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Search result schema validation failed:", parsed.error);
    return [];
  }

  return parsed.data;
};

export const searchDocument = async (query: { [key: string]: string }) => {
  const db = await getDB();

  const result = await db.query((doc: any) =>
    Object.entries(query).every(([key, value]) => doc[key] === value)
  );

  const parsed = searchResult.safeParse(result);

  if (!parsed.success) {
    console.error("Search result schema validation failed:", parsed.error);
    return [];
  }

  const data = parsed.data.map((doc) => {
    return { value: doc };
  });

  return data;
};

//orbitdb上のレコードからリポジトリサーバーのレコードを解決
export const resolveRepositoryDocument = async (document: documentType) => {
  //もしeventがprofile更新イベントなら
  if (document.event == "event.profile") {
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

  if (data.status == 200) {
    const json = await data.json();
    const parsedEvent = EventSchema.safeParse(json);

    if (!parsedEvent.success) {
      console.error("Event schema validation failed:", parsedEvent.error);
      return null;
    }

    const event = parsedEvent.data;

    //データの検証
    const crypto = new Crypto(calculateHash);
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

export const getEvent = async (id: string) => {
  const docs = await searchDocument({ _id: id });

  if (docs[0]) {
    const event = docs[0].value;

    //eventを解決
    const record = await resolveRepositoryDocument(event);

    if (record) {
      if (event.target) {
        //targetが有効な公開鍵(ユーザーを指していた)場合
        if (isValidPublickey(event.target)) {
          //ユーザーをターゲットとする
          const targetDoc = await findProfileDoc(event.target);

          return { ...record, target: targetDoc };
        } else if (isCID(event.target)) {
          const targetDoc = await resolveIpfsDoc(event.target);

          return { ...record, target: targetDoc };
        } else {
          //ターゲットがipfs上のファイルを指していた場合
          const doc = await searchDocument({ _id: event.target });
          if (!doc[0]) return null;
          const targetDoc = doc[0].value;

          //ドキュメントが指しているレコードをターゲットとする
          const targetRecord = await resolveRepositoryDocument(targetDoc);
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
  }

  return null;
};

export const putEvent = async (event: eventType) => {
  //データの検証
  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifySecureMessage(event);
  const parsedEvent = EventSchema.safeParse(event);

  if (!parsedEvent.success) {
    console.error("Event schema validation failed:", parsedEvent.error);
    return null;
  }

  const message = event.message as Record<string, any>;

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
      await writeDocument(parsed.data);
    }

    //リポジトリにも保存
    await putRecord(event);

    return event;
  } else {
    return null;
  }
};
