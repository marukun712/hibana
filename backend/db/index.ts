import { eq } from "drizzle-orm";
import { getDB } from "./db.ts";
import { CryptoUtils } from "../../utils/crypto.ts";
import { calculateHash } from "../lib/hash.ts";
import type { getSchemaType } from "../schema/Query.ts";
import { events, type eventType } from "../schema/Event.ts";

export const getEvent = async (json: getSchemaType) => {
  //DBファイルをopen
  const db = getDB(json.publickey);
  const data = await db.select().from(events).where(eq(events.id, json.id));

  const post = data[0];

  if (post) {
    //データを検証
    const crypto = new CryptoUtils(calculateHash);
    const verify = await crypto.verifySecureMessage(post as eventType);

    if (verify) {
      return post;
    } else {
      throw new Error("Verify failed");
    }
  } else {
    throw new Error("Event is not found");
  }
};

export const putEvent = async (json: eventType) => {
  const db = getDB(json.publickey);
  await db.insert(events).values(json);
};

export const deleteEvent = async (json: getSchemaType) => {
  const db = getDB(json.publickey);
  await db.delete(events).where(eq(events.id, json.id));
};
