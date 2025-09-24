import { hc } from "hono/client";
import type { profileRouteType } from "../../../../backend";
import { CryptoUtils } from "../../../../utils/crypto";
import { calculateHash } from "../hash";

export const updateProfile = async (
	username: string,
	icon: string,
	description: string,
	repository: string,
) => {
	const client = hc<profileRouteType>(repository);
	const updatedAt = new Date().toISOString();
	const crypto = new CryptoUtils(calculateHash);
	const doc = await crypto.createUserDoc(
		username,
		icon,
		description,
		repository,
		updatedAt,
	);

	if (doc) await client.profile.$post({ json: doc });
};

export const getProfile = async (publickey: string) => {
	const client = hc<profileRouteType>("http://localhost:8000");
	const res = await client.profile.$get({ query: { publickey } });
	const json = await res.json();
	if (!("error" in json)) {
		return json;
	} else {
		throw new Error("取得中にエラーが発生しました。");
	}
};

export const getCurrentUser = async () => {
	const publickey = await window.nostr.getPublicKey();
	const profile = await getProfile(publickey);
	return profile;
};
