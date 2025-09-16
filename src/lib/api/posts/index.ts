import { postEvent } from "../event";

export const createPost = async (content: string) => {
	if (!content.trim()) {
		throw new Error("投稿内容が空です。");
	}
	const postContent = {
		content: content.trim(),
	};
	return await postEvent("event.post", postContent);
};

export const createReply = async (targetId: string, content: string) => {
	if (!content.trim()) {
		throw new Error("リプライ内容が空です。");
	}
	if (!targetId) {
		throw new Error("リプライ対象が指定されていません。");
	}
	const replyContent = {
		target: targetId,
		content: content.trim(),
	};
	return await postEvent("event.reply", replyContent);
};

export const createQuoteRepost = async (targetId: string, content: string) => {
	if (!content.trim()) {
		throw new Error("引用リポスト内容が空です。");
	}
	if (!targetId) {
		throw new Error("引用リポスト対象が指定されていません。");
	}
	const quoteRepostContent = {
		target: targetId,
		content: content.trim(),
	};
	return await postEvent("event.quote_repost", quoteRepostContent);
};
