import type { profileRouteType } from "@hibana/repository-server";
import { createUserDoc } from "@hibana/utils";
import { hc } from "hono/client";
import { calculateHash } from "../hash";

export class ProfileAPI {
	private repository: string;

	constructor(repository: string) {
		this.repository = repository;
	}

	async update(params: {
		publickey: string;
		username: string;
		icon: string;
		repository: string;
		description: string;
	}) {
		const client = hc<profileRouteType>(params.repository);
		const updatedAt = new Date().toISOString();
		const doc = await createUserDoc(
			{
				username: params.username,
				icon: params.icon,
				description: params.description,
				repository: params.repository,
				updatedAt,
				publickey: params.publickey,
			},
			calculateHash,
		);
		if (doc) await client.profile.$post({ json: doc });
	}

	async get(publickey: string) {
		const client = hc<profileRouteType>(this.repository);
		const res = await client.profile.$get({ query: { publickey } });
		const json = await res.json();
		if (!("error" in json)) {
			return json;
		} else {
			throw new Error("取得中にエラーが発生しました。");
		}
	}
}
