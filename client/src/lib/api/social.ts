import { hc } from "hono/client";
import type { eventRouteType, feedRouteType } from "../../../backend";
import { CryptoUtils } from "../../../utils/crypto";
import { deleteEvent } from "./event";
import { calculateHash } from "./hash";
import { getCurrentUser } from "./users";

const postEvent = async (
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

export const followUser = async (targetId: string) => {
	if (!targetId) {
		throw new Error("フォロー対象が指定されていません。");
	}
	const followContent = {
		target: targetId,
	};
	return await postEvent("event.follow", followContent);
};

export const unfollowUser = async (eventId: string) => {
	if (!eventId) {
		throw new Error("フォローイベントIDが指定されていません。");
	}
	await deleteEvent(eventId);
};

export const repostPost = async (targetId: string) => {
	if (!targetId) {
		throw new Error("リポスト対象が指定されていません。");
	}
	const repostContent = {
		target: targetId,
	};
	return await postEvent("event.repost", repostContent);
};

export const unrepostPost = async (eventId: string) => {
	if (!eventId) {
		throw new Error("リポストイベントIDが指定されていません。");
	}
	await deleteEvent(eventId);
};

export const pinPost = async (targetId: string) => {
	if (!targetId) {
		throw new Error("ピン対象が指定されていません。");
	}
	const pinContent = { target: targetId };
	return await postEvent("event.pin", pinContent);
};

export const unpinPost = async (eventId: string) => {
	if (!eventId) {
		throw new Error("ピンイベントIDが指定されていません。");
	}
	await deleteEvent(eventId);
};

export const checkFollowStatus = async (targetId: string) => {
	const user = await getCurrentUser();
	return await isFollowed(user.publickey, targetId);
};

export const checkRepostStatus = async (targetId: string) => {
	const user = await getCurrentUser();
	return await isReposted(user.publickey, targetId);
};

export const checkPinStatus = async (targetId: string) => {
	const user = await getCurrentUser();
	return await isPinned(user.publickey, targetId);
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

export const getFollows = async (publickey: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.follow", publickey },
	});
	const feed = await res.json();
	if (!("error" in feed)) {
		return feed;
	} else {
		throw new Error("取得中にエラーが発生しました。");
	}
};

export const getFollowers = async (publickey: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.follow", target: publickey },
	});
	const feed = await res.json();
	if (!("error" in feed)) {
		return feed;
	} else {
		throw new Error("取得中にエラーが発生しました。");
	}
};

export const isFollowed = async (publickey: string, target: string) => {
	const user = await getCurrentUser();
	const client = hc<feedRouteType>(user.repository);
	const res = await client.feed.$get({
		query: { event: "event.follow", publickey, target },
	});
	const json = await res.json();
	if (!("error" in json) && json.length > 0) {
		return { id: json[0].id, isFollowed: true };
	} else {
		return { id: null, isFollowed: false };
	}
};
