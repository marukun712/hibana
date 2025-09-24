import type { profileType } from "@hibana/schema/Profile";
import { BaseEventAPI } from "./base";

export class PostAPI extends BaseEventAPI {
	async add(content: string, getCurrentUser: () => Promise<profileType>) {
		if (!content.trim()) {
			throw new Error("投稿内容が空です。");
		}

		const user = await getCurrentUser();
		const postContent = {
			content: content.trim(),
		};
		return await this.postEvent("event.post", postContent, user.repository);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}
