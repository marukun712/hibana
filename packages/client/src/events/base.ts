import type { eventRouteType } from "@hibana/repository-server";
import { CryptoUtils } from "@hibana/utils/crypto";
import { hc } from "hono/client";
import { calculateHash } from "../hash";

export class BaseEventAPI {
	protected async postEvent(
		event: string,
		content: { [key: string]: unknown },
		repository: string,
	) {
		const client = hc<eventRouteType>(repository);
		const timestamp = new Date().toISOString();
		const crypto = new CryptoUtils(calculateHash);
		const message = await crypto.createSecureMessage(event, timestamp, content);

		if (message) {
			const data = await client.event.$post({ json: message });
			const json = await data.json();

			if (!("error" in json)) {
				return json.id;
			} else {
				throw new Error("投稿中にエラーが発生しました。");
			}
		}
	}

	protected async deleteEvent(id: string, repository: string) {
		const client = hc<eventRouteType>(repository);
		const timestamp = new Date().toISOString();
		const crypto = new CryptoUtils(calculateHash);
		const message = await crypto.createSecureMessage(
			"event.delete",
			timestamp,
			{
				target: id,
			},
		);
		await client.event.$delete({ json: message });
	}
}
