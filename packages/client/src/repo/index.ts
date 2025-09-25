import type { repoRouteType } from "@hibana/repository-server";
import {
	unknownEventSchema,
	type unknownSchemaType,
} from "@hibana/schema/Event";
import { hc } from "hono/client";
import { z } from "zod";

export class RepositoryAPI {
	repository: string;

	constructor(repository: string) {
		this.repository = repository;
	}

	async get(params: { publickey: string }): Promise<unknownSchemaType[]> {
		const client = hc<repoRouteType>(this.repository);
		const response = await client.repo.$get({
			query: { publickey: params.publickey },
		});
		if (!response.ok) {
			throw new Error("リポジトリデータの取得に失敗しました");
		}
		const json = await response.json();
		const parsed = z.array(unknownEventSchema).safeParse(json);
		if (!parsed.success) {
			throw new Error("リポジトリデータのスキーマが不正です。");
		}
		return parsed.data;
	}
}
