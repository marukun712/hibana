import type { profileType } from "@hibana/schema/Profile";
import { BaseEventAPI } from "./base";

export class RepostAPI extends BaseEventAPI {
	async add(targetId: string, getCurrentUser: () => Promise<profileType>) {
		if (!targetId) {
			throw new Error("リポスト対象が指定されていません。");
		}

		const user = await getCurrentUser();
		const repostContent = {
			target: targetId,
		};
		return await this.postEvent("event.repost", repostContent, user.repository);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}

export class QuoteRepostAPI extends BaseEventAPI {
	async add(
		targetId: string,
		content: string,
		getCurrentUser: () => Promise<profileType>,
	) {
		if (!content.trim()) {
			throw new Error("引用リポスト内容が空です。");
		}
		if (!targetId) {
			throw new Error("引用リポスト対象が指定されていません。");
		}

		const user = await getCurrentUser();
		const quoteRepostContent = {
			target: targetId,
			content: content.trim(),
		};
		return await this.postEvent(
			"event.quote_repost",
			quoteRepostContent,
			user.repository,
		);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}
