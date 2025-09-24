import { hc } from "hono/client";
import type { eventRouteType } from "../../../backend";
import { CryptoUtils } from "../../../utils/crypto";
import { calculateHash } from "./hash";
import { getCurrentUser } from "./users";

export const postEvent = async (
	event: string,
	content: { [key: string]: unknown },
) => {
	const user = await getCurrentUser();
	const client = hc<eventRouteType>(user.repository);
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
};

export const deleteEvent = async (id: string) => {
	const user = await getCurrentUser();
	const client = hc<eventRouteType>(user.repository);
	const timestamp = new Date().toISOString();
	const crypto = new CryptoUtils(calculateHash);
	const message = await crypto.createSecureMessage("event.delete", timestamp, {
		target: id,
	});
	await client.event.$delete({ json: message });
};
