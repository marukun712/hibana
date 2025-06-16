import { Crypto } from "../../../utils/crypto.ts";
import { documentSchema, type documentType } from "../../schema/Document.ts";
import { profileSchema, type profileType } from "../../schema/Profile.ts";
import { calculateHash } from "../hash.ts";
import { searchDocument, writeDocument } from "../events/index.ts";
import { getClient } from "../instances/ipfs.ts";
import { CID } from "kubo-rpc-client";

export const updateUser = async (profile: profileType) => {
  const parsedProfile = profileSchema.safeParse(profile);

  if (!parsedProfile.success) {
    console.error("Profile schema validation failed:", parsedProfile.error);
    return null;
  }

  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(parsedProfile.data);

  if (verify) {
    const client = await getClient();
    const result = await client.add(JSON.stringify(profile, null, 2));

    const document: documentType = {
      _id: profile.id,
      event: "event.profile",
      target: result.cid.toString(),
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
export const findProfileDoc = async (
  publickey: string
): Promise<profileType | null> => {
  const data = await searchDocument({ publickey, event: "event.profile" });

  if (data[0] && data[0].value.target) {
    const doc = await resolveIpfsDoc(data[0].value.target);

    const success = profileSchema.safeParse(doc);

    if (success.success) {
      return success.data;
    } else {
      console.error("Profile schema validation failed:", success.error);
      return null;
    }
  } else {
    return null;
  }
};

//ipfs上の署名済みjsonドキュメントを解決する
export const resolveIpfsDoc = async (
  cid: string
): Promise<Record<string, any> | null> => {
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
