import { hc } from "hono/client";
import { events, type defaultEvent } from "../../../db/schema.ts";
import type { getRouteType } from "../../../index.ts";
import {
  documentSchema,
  getDB,
  type documentType,
  type rawDocument,
} from "../db.ts";
import { findProfileDoc } from "../user/index.ts";
import { Crypto } from "../../../../utils/crypto.ts";
import { calculateHash } from "../../hash.ts";
import { getDB as getRepo } from "../../../db/db.ts";

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
export const resolveRepositoryDocument = async (event: documentType) => {
  //もしeventがprofile更新イベントなら
  if (event.event == "event.profile") {
    return null;
  }

  //通常イベント時の処理
  const doc = await findProfileDoc(event.publickey);
  if (!doc) return null;

  //リポジトリサーバーに接続
  const client = hc<getRouteType>(doc.repository);

  const data = await client.get.$get({
    query: { id: event._id, publickey: event.publickey },
  });

  if (data.status == 200) {
    const json = (await data.json()) as defaultEvent;

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

export const putEvent = async (json: defaultEvent) => {
  //データの検証
  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifySecureMessage(json);

  if (verify) {
    const document: documentType = {
      _id: json.id,
      event: json.event,
      publickey: json.publickey,
      timestamp: json.timestamp,
    };

    const parsed = documentSchema.safeParse(document);

    //orbitdbにeventを保存
    if (parsed.success) {
      await writeDocument(parsed.data);
    }

    //リポジトリにも保存
    const db = getRepo(json.publickey);
    await db.insert(events).values(json);

    return json;
  } else {
    return null;
  }
};
