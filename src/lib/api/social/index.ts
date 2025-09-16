import type { z } from "zod";
import type {
	followContentSchema,
	pinContentSchema,
	repostContentSchema,
} from "../../../../backend/schema/Event";
import { deleteEvent, isPinned, isReposted, postEvent } from "../event";
import { getCurrentUser, isFollowed } from "../users";

// API関数の戻り値の型定義
type StatusCheckResult = {
	id: string | null;
	isFollowed?: boolean;
	isReposted?: boolean;
	isPinned?: boolean;
};

export const followUser = async (
	targetId: string,
): Promise<string | undefined> => {
	if (!targetId) {
		throw new Error("フォロー対象が指定されていません。");
	}

	const followContent: z.infer<typeof followContentSchema> = {
		target: targetId,
	};
	return await postEvent("event.follow", followContent);
};

export const unfollowUser = async (eventId: string): Promise<void> => {
	if (!eventId) {
		throw new Error("フォローイベントIDが指定されていません。");
	}

	await deleteEvent(eventId);
};

export const repostPost = async (
	targetId: string,
): Promise<string | undefined> => {
	if (!targetId) {
		throw new Error("リポスト対象が指定されていません。");
	}

	const repostContent: z.infer<typeof repostContentSchema> = {
		target: targetId,
	};
	return await postEvent("event.repost", repostContent);
};

export const unrepostPost = async (eventId: string): Promise<void> => {
	if (!eventId) {
		throw new Error("リポストイベントIDが指定されていません。");
	}

	await deleteEvent(eventId);
};

export const pinPost = async (
	targetId: string,
): Promise<string | undefined> => {
	if (!targetId) {
		throw new Error("ピン対象が指定されていません。");
	}

	const pinContent: z.infer<typeof pinContentSchema> = { target: targetId };
	return await postEvent("event.pin", pinContent);
};

export const unpinPost = async (eventId: string): Promise<void> => {
	if (!eventId) {
		throw new Error("ピンイベントIDが指定されていません。");
	}

	await deleteEvent(eventId);
};

export const checkFollowStatus = async (
	targetId: string,
): Promise<StatusCheckResult & { isFollowed: boolean }> => {
	const user = await getCurrentUser();
	return await isFollowed(user.publickey, targetId);
};

export const checkRepostStatus = async (
	targetId: string,
): Promise<StatusCheckResult & { isReposted: boolean }> => {
	const user = await getCurrentUser();
	return await isReposted(user.publickey, targetId);
};

export const checkPinStatus = async (
	targetId: string,
): Promise<StatusCheckResult & { isPinned: boolean }> => {
	const user = await getCurrentUser();
	return await isPinned(user.publickey, targetId);
};
