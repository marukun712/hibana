import type { eventRouteType, feedRouteType } from "@hibana/repository-server";
import type { profileType } from "@hibana/schema/Profile";
import { hc } from "hono/client";

// FeedItem型の簡易定義（完全版は別途定義済み）
interface FeedItem {
	id: string;
	timestamp: string;
	event: string;
	publickey: string;
	message: { [key: string]: unknown };
	user: profileType;
	target?: string;
}

export class FeedAPI {
	constructor(private getCurrentUser: () => Promise<profileType>) {}

	private async fetchFeedEvents(
		client: ReturnType<typeof hc<feedRouteType>>,
		publickey?: string,
	) {
		const eventTypes = [
			"event.post",
			"event.repost",
			"event.quote_repost",
			"event.reply",
		] as const;

		const results = await Promise.all(
			eventTypes.map(async (event) => {
				const res = await client.feed.$get({
					query: { event, ...(publickey ? { publickey } : {}) },
				});
				const data = await res.json();
				if ("error" in data) return null;
				return data as FeedItem[];
			}),
		);

		return results.flat().filter((e): e is FeedItem => e !== null);
	}

	async getPosts() {
		const user = await this.getCurrentUser();
		const client = hc<feedRouteType>(user.repository);
		const items = await this.fetchFeedEvents(client);
		return items.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getUserPosts(publickey: string) {
		const user = await this.getCurrentUser();
		const client = hc<feedRouteType>(user.repository);
		const items = await this.fetchFeedEvents(client, publickey);
		return items.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
	}

	async getFollowingPosts(publickey: string) {
		const user = await this.getCurrentUser();
		const client = hc<feedRouteType>(user.repository);
		const res = await client.feed.$get({
			query: { event: "event.follow", publickey },
		});
		const follows = await res.json();

		if ("error" in follows) {
			throw new Error("フォロー情報の取得中にエラーが発生しました。");
		}

		const posts = await Promise.all(
			follows.map((follow: { target?: { publickey: string } }) =>
				follow.target ? this.getUserPosts(follow.target.publickey) : [],
			),
		);
		return posts
			.flat()
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			);
	}

	async getReplies(postId: string) {
		const user = await this.getCurrentUser();
		const client = hc<feedRouteType>(user.repository);
		const res = await client.feed.$get({
			query: { event: "event.reply", target: postId },
		});
		const replies = (await res.json()) as FeedItem[];
		if (!("error" in replies)) {
			return replies.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);
		} else {
			throw new Error("リプライの取得中にエラーが発生しました。");
		}
	}

	async getPostById(postId: string) {
		const user = await this.getCurrentUser();
		const client = hc<eventRouteType>(user.repository);
		const res = await client.event.$get({ query: { id: postId } });
		const post = (await res.json()) as FeedItem;
		return post;
	}
}
