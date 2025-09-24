import type { profileRouteType } from "@hibana/repository-server";
import { CryptoUtils } from "@hibana/utils/crypto";
import { hc } from "hono/client";
import { calculateHash } from "../hash";

export class ProfileAPI {
	async update(
		username: string,
		icon: string,
		description: string,
		repository: string,
	) {
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
	}

	async get(publickey: string) {
		const client = hc<profileRouteType>("http://localhost:8000");
		const res = await client.profile.$get({ query: { publickey } });
		const json = await res.json();
		if (!("error" in json)) {
			return json;
		} else {
			throw new Error("取得中にエラーが発生しました。");
		}
	}
}
