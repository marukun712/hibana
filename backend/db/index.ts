import { eq } from "drizzle-orm";
import { getDB } from "./db.ts";
import { Crypto } from "../../utils/crypto.ts";
import { calculateHash } from "../lib/hash.ts";
import type { getSchemaType } from "../schema/Query.ts";
import { events, type eventType } from "../schema/Event.ts";

export const getRecord = async (json: getSchemaType) => {
  //DBファイルをopen
  const db = getDB(json.publickey);
  const data = await db.select().from(events).where(eq(events.id, json.id));

  const post = data[0];

  if (post) {
    //データを検証
    const crypto = new Crypto(calculateHash);
    const verify = await crypto.verifySecureMessage(post as eventType);

    if (verify) {
      return post;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const putRecord = async (json: eventType) => {
  const db = getDB(json.publickey);
  await db.insert(events).values(json);
};
