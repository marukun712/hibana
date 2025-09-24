import type { profileType } from "@hibana/schema/Profile";
import { BaseEventAPI } from "./base";

export class ReplyAPI extends BaseEventAPI {
	async add(
		targetId: string,
		content: string,
		getCurrentUser: () => Promise<profileType>,
	) {
		if (!content.trim()) {
			throw new Error("リプライ内容が空です。");
		}
		if (!targetId) {
			throw new Error("リプライ対象が指定されていません。");
		}

		const user = await getCurrentUser();
		const replyContent = {
			target: targetId,
			content: content.trim(),
		};
		return await this.postEvent("event.reply", replyContent, user.repository);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}
