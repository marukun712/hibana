import type { feedRouteType } from "@hibana/repository-server";
import { hc } from "hono/client";

export class StatusAPI {
	constructor(repository: string, publickey: string) {
		this.repository = repository;
		this.publickey = publickey;
	}
	async isFollowed(publickey: string, target: string, repository: string) {
		const client = hc<feedRouteType>(repository);
		const res = await client.feed.$get({
			query: { event: "event.follow", publickey, target },
		});
		const json = await res.json();
		if (!("error" in json) && json.length > 0) {
			return { id: json[0].id, isFollowed: true };
		} else {
			return { id: null, isFollowed: false };
		}
	}

	async isReposted(publickey: string, target: string, repository: string) {
		const client = hc<feedRouteType>(repository);
		const res = await client.feed.$get({
			query: { event: "event.repost", publickey, target },
		});
		const json = await res.json();
		if (!("error" in json) && json.length > 0) {
			return { id: json[0].id, isReposted: true };
		} else {
			return { id: null, isReposted: false };
		}
	}

	async isPinned(publickey: string, target: string, repository: string) {
		const client = hc<feedRouteType>(repository);
		const res = await client.feed.$get({
			query: { event: "event.pin", publickey, target },
		});
		const json = await res.json();
		if (!("error" in json) && json.length > 0) {
			return { id: json[0].id, isPinned: true };
		} else {
			return { id: null, isPinned: false };
		}
	}

	async getFollows(publickey: string, repository: string) {
		const client = hc<feedRouteType>(repository);
		const res = await client.feed.$get({
			query: { event: "event.follow", publickey },
		});
		const feed = await res.json();
		if (!("error" in feed)) {
			return feed;
		} else {
			throw new Error("取得中にエラーが発生しました。");
		}
	}

	async getFollowers(publickey: string, repository: string) {
		const client = hc<feedRouteType>(repository);
		const res = await client.feed.$get({
			query: { event: "event.follow", target: publickey },
		});
		const feed = await res.json();
		if (!("error" in feed)) {
			return feed;
		} else {
			throw new Error("取得中にエラーが発生しました。");
		}
	}
}
