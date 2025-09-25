import type { PostEvent } from "../types";
import { BaseEventAPI } from "./base";

type Content = { content: string };

export class PostAPI extends BaseEventAPI<"event.post", Content, PostEvent> {
	constructor(repository: string) {
		super(repository, "event.post");
	}

	async get(id: string) {
		return await this.getEvent(id);
	}

	async list(params?: { publickey?: string; id?: string; target?: string }) {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content) {
		if (!content.content.trim()) {
			throw new Error("投稿内容が空です。");
		}

		return await this.postEvent(publickey, {
			content: content.content.trim(),
		});
	}

	async delete(publickey: string, id: string) {
		return await this.deleteEvent(publickey, id);
	}
}
