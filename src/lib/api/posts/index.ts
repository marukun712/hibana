import type { z } from "zod";
import type {
	postContentSchema,
	quoteRepostContentSchema,
	replyContentSchema,
} from "../../../../backend/schema/Event";
import { postEvent } from "../event";

export const createPost = async (
	content: string,
): Promise<string | undefined> => {
	if (!content.trim()) {
		throw new Error("投稿内容が空です。");
	}

	const postContent: z.infer<typeof postContentSchema> = {
		content: content.trim(),
	};
	return await postEvent("event.post", postContent);
};

export const createReply = async (
	targetId: string,
	content: string,
): Promise<string | undefined> => {
	if (!content.trim()) {
		throw new Error("リプライ内容が空です。");
	}

	if (!targetId) {
		throw new Error("リプライ対象が指定されていません。");
	}

	const replyContent: z.infer<typeof replyContentSchema> = {
		target: targetId,
		content: content.trim(),
	};
	return await postEvent("event.reply", replyContent);
};

export const createQuoteRepost = async (
	targetId: string,
	content: string,
): Promise<string | undefined> => {
	if (!content.trim()) {
		throw new Error("引用リポスト内容が空です。");
	}

	if (!targetId) {
		throw new Error("引用リポスト対象が指定されていません。");
	}

	const quoteRepostContent: z.infer<typeof quoteRepostContentSchema> = {
		target: targetId,
		content: content.trim(),
	};
	return await postEvent("event.quote_repost", quoteRepostContent);
};
