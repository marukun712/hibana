import { hc } from "hono/client";
import type { eventRouteType, feedRouteType } from "../../../../backend";
import { CryptoUtils } from "../../../../utils/crypto";
import { calculateHash } from "../hash";
import { getCurrentUser, getFollows } from "../users";

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
	const crypto = new CryptoUtils(calculateHash);
	const signature = await crypto.signMessage(id);
	await client.event.$delete({ json: { target: id, signature, content: id } });
};

export const getPosts = async () => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const postsRes = await client.feed.$get({ query: { event: "event.post" } });
	const posts = await postsRes.json();
	const repostsRes = await client.feed.$get({
		query: { event: "event.repost" },
	});
	const reposts = await repostsRes.json();
	const quoteRepostsRes = await client.feed.$get({
		query: { event: "event.quote_repost" },
	});
	const quoteReposts = await quoteRepostsRes.json();
	const repliesRes = await client.feed.$get({
		query: { event: "event.reply" },
	});
	const replies = await repliesRes.json();
	if (
		!("error" in posts) &&
		!("error" in reposts) &&
		!("error" in quoteReposts) &&
		!("error" in replies)
	) {
		const allItems = [...posts, ...reposts, ...quoteReposts, ...replies].sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
		return allItems;
	} else {
		throw new Error("取得中にエラーが発生しました。");
	}
};

export const getUserPosts = async (publickey: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const postsRes = await client.feed.$get({
		query: { event: "event.post", publickey },
	});
	const posts = await postsRes.json();
	const repostsRes = await client.feed.$get({
		query: { event: "event.repost", publickey },
	});
	const reposts = await repostsRes.json();
	const quoteRepostsRes = await client.feed.$get({
		query: { event: "event.quote_repost", publickey },
	});
	const quoteReposts = await quoteRepostsRes.json();
	const repliesRes = await client.feed.$get({
		query: { event: "event.reply", publickey },
	});
	const replies = await repliesRes.json();
	if (
		!("error" in posts) &&
		!("error" in reposts) &&
		!("error" in quoteReposts) &&
		!("error" in replies)
	) {
		const allItems = [...posts, ...reposts, ...quoteReposts, ...replies].sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
		return allItems;
	} else {
		throw new Error("取得中にエラーが発生しました。");
	}
};

export const getFollowingPosts = async (publickey: string) => {
	const follows = await getFollows(publickey);
	const posts = await Promise.all(
		follows.map((follow) => {
			if (!follow.target) return [];
			return getUserPosts(follow.target.publickey);
		}),
	);
	return posts
		.flat()
		.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);
};

export const isPinned = async (publickey: string, target: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.pin", publickey, target },
	});
	const json = await res.json();
	if (!("error" in json) && json.length > 0) {
		return { id: json[0].id, isPinned: true };
	} else {
		return { id: null, isPinned: false };
	}
};

export const isReposted = async (publickey: string, target: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.repost", publickey, target },
	});
	const json = await res.json();
	if (!("error" in json) && json.length > 0) {
		return { id: json[0].id, isReposted: true };
	} else {
		return { id: null, isReposted: false };
	}
};

export const getReplies = async (postId: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.reply", target: postId },
	});
	const replies = await res.json();
	if (!("error" in replies)) {
		return replies.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);
	} else {
		throw new Error("リプライの取得中にエラーが発生しました。");
	}
};
