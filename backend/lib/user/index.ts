import { CryptoUtils } from "../../../utils/crypto.ts";
import { documentSchema, type documentType } from "../../schema/Document.ts";
import { profileSchema, type profileType } from "../../schema/Profile.ts";
import { calculateHash } from "../hash.ts";
import { searchDocs, writeDoc } from "../docs/index.ts";
import { getClient } from "../instances/ipfs.ts";
import { CID } from "kubo-rpc-client";

export const updateUser = async (profile: profileType) => {
  const parsedProfile = profileSchema.safeParse(profile);

  if (!parsedProfile.success) {
    console.error("Profile schema validation failed:", parsedProfile.error);
    throw new Error("Validation failed");
  }

  const crypto = new CryptoUtils(calculateHash);
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
      await writeDoc(document);
    }

    return document;
  } else {
    throw new Error("Verify failed");
  }
};

//orbitdbからプロフィール更新イベントを探す
export const findProfileDoc = async (
  publickey: string
): Promise<profileType | null> => {
  const data = await searchDocs({ publickey, event: "event.profile" });

  if (data[0] && data[0].value.target) {
    const doc = await resolveIpfsDoc(data[0].value.target);

    const parsed = profileSchema.safeParse(doc);

    if (parsed.success) {
      return parsed.data;
    } else {
      console.error("Profile schema validation failed:", parsed.error);
      throw new Error("Validation failed");
    }
  } else {
    throw new Error("User is not found");
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

  const crypto = new CryptoUtils(calculateHash);
  const verify = await crypto.verifyUserDoc(doc);

  if (verify) {
    return doc;
  } else {
    throw new Error("Verify failed");
  }
};

export const isUserPublickey = async (publickey: string) => {
  const data = await searchDocs({ publickey, event: "event.profile" });

  if (data.length > 0) {
    return true;
  } else {
    return false;
  }
};
