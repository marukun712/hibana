import { deleteEvent, isPinned, isReposted, postEvent } from "../event";
import { getCurrentUser, isFollowed } from "../users";

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
