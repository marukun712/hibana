import { Crypto } from "../../../utils/crypto.ts";
import { documentSchema, type documentType } from "../../schema/Document.ts";
import type { profileType } from "../../schema/Profile.ts";
import { calculateHash } from "../hash.ts";
import { searchDocument, writeDocument } from "../events/index.ts";
import { getClient } from "../instances/ipfs.ts";
import { CID } from "kubo-rpc-client";

export const updateUser = async (profile: profileType) => {
  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(profile);

  if (verify) {
    const client = await getClient();
    const result = await client.add(JSON.stringify(profile, null, 2));

    const document: documentType = {
      _id: result.cid.toString(),
      event: "event.profile",
      target: null,
      publickey: profile.publickey,
      timestamp: new Date().toISOString(),
    };

    const parsed = documentSchema.safeParse(document);
    if (parsed.success) {
      await writeDocument(document);
    }

    return document;
  } else {
    return null;
  }
};

//orbitdbからプロフィール更新イベントを探す
export const findProfileDoc = async (publickey: string) => {
  const data = await searchDocument({ publickey, event: "event.profile" });

  if (data[0]) {
    const doc = await resolveProfileDoc(data[0].value._id);

    return doc;
  }
};

//cidからdocumentを解決
export const resolveProfileDoc = async (cid: string) => {
  const client = await getClient();

  const raw = await client.cat(CID.parse(cid));
  const chunks = [];
  for await (const chunk of raw) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks).toString("utf-8");
  const doc = JSON.parse(buffer);

  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(doc);

  if (verify) {
    return doc;
  } else {
    return null;
  }
};
