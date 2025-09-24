import { documentSchema, type documentType } from "@hibana/schema/Document";
import { profileSchema, type profileType } from "@hibana/schema/Profile";
import { CryptoUtils } from "@hibana/utils/crypto";
import { CID } from "kubo-rpc-client";
import { searchDocs, writeDoc } from "../docs/index.ts";
import { calculateHash } from "../hash.ts";
import { getClient } from "../instances/ipfs.ts";

export const updateUser = async (profile: profileType) => {
	const parsedProfile = profileSchema.safeParse(profile);
	if (!parsedProfile.success) {
		console.error("Profile schema validation failed:", parsedProfile.error);
		throw new Error("Validation failed");
	}
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifyUserDoc(parsedProfile.data);
	if (!verify) throw new Error("Verify failed");
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
};

//orbitdbからプロフィール更新イベントを探す
export const findProfileDoc = async (publickey: string) => {
	const data = await searchDocs({ publickey, event: "event.profile" });
	if (!data[0]?.value.target) throw new Error("User is not found");

	return await resolveUserDoc(data[0].value.target);
};

//ipfs上の署名済みuserドキュメントを解決する
export const resolveUserDoc = async (cid: string) => {
	const client = await getClient();
	const raw = client.cat(CID.parse(cid));
	const chunks: Uint8Array[] = [];
	for await (const chunk of raw) {
		chunks.push(chunk);
	}
	const buffer = Buffer.concat(chunks).toString("utf-8");
	const doc = JSON.parse(buffer);
	const crypto = new CryptoUtils(calculateHash);
	const verify = await crypto.verifyUserDoc(doc);
	if (!verify) throw new Error("Verify failed");
	const parsed = profileSchema.safeParse(doc);
	if (!parsed.success) {
		console.error("Profile schema validation failed:", parsed.error);
		throw new Error("Validation failed");
	}
	return parsed.data;
};

export const isUserPublickey = async (publickey: string) => {
	const data = await searchDocs({ publickey, event: "event.profile" });
	if (data.length > 0) {
		return true;
	} else {
		return false;
	}
};
