import { eq } from "drizzle-orm";
import type { getSchemaType } from "..";
import { getDB } from "./db.ts";
import { events, type defaultEvent } from "./schema.ts";
import { Crypto } from "../../utils/crypto.ts";
import { calculateHash } from "../lib/hash.ts";

export const getRecord = async (json: getSchemaType) => {
  //DBファイルをopen
  const db = getDB(json.publickey);
  const data = await db.select().from(events).where(eq(events.id, json.id));

  const post = data[0];

  if (post) {
    //データを検証
    const crypto = new Crypto(calculateHash);
    const verify = await crypto.verifySecureMessage(post as defaultEvent);

    if (verify) {
      return post;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const putRecord = async (data: defaultEvent) => {};
