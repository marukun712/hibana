import { hc } from "hono/client";
import type { getRouteType } from "../../index.ts";
import { getDB } from "../instances/db.ts";
import { findProfileDoc } from "../user/index.ts";
import { Crypto } from "../../../utils/crypto.ts";
import { calculateHash } from "../hash.ts";
import {
  documentSchema,
  type documentType,
  type rawDocument,
} from "../../schema/Document.ts";
import { type eventType } from "../../schema/Event.ts";
import { putRecord } from "../../db/index.ts";

export const writeDocument = async (document: documentType) => {
  const db = await getDB();
  await db.put(document);
};

export const getAllDocument = async (): Promise<rawDocument[]> => {
  const db = await getDB();
  return db.all();
};

export const searchDocument = async (query: {
  [key: string]: string;
}): Promise<rawDocument[]> => {
  const db = await getDB();

  const result = await db.query((doc: any) =>
    Object.entries(query).every(([key, value]) => doc[key] === value)
  );

  const data = result.map((doc: any) => {
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
    const json = (await data.json()) as eventType;

    //データの検証
    const crypto = new Crypto(calculateHash);
    const verify = await crypto.verifySecureMessage(json);
    if (!verify) {
      return null;
    }

    //投稿者のプロフィール付きで返す
    return { ...json, user: doc };
  } else {
    return null;
  }
};

export const getEvent = async (id: string) => {
  const docs = await searchDocument({ _id: id });

  if (docs[0]) {
    const event: documentType = docs[0].value;

    //eventを解決
    const record = await resolveRepositoryDocument(event);

    if (record) {
      if (event.target) {
        const targetDoc = await searchDocument({ _id: event.target });
        if (!targetDoc[0]) return null;

        const targetRecord = await resolveRepositoryDocument(
          targetDoc[0].value
        );
        if (!targetRecord) return null;

        return { ...record, target: targetRecord };
      } else {
        return { ...record, target: null };
      }
    } else {
      return null;
    }
  }
};

export const putEvent = async (event: eventType) => {
  //データの検証
  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifySecureMessage(event);

  const message = event.message as Record<string, any>;

  //target付きのイベント(starやfollowなど)か判定
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
