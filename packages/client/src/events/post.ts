import type { eventReturnType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = { content: string };

export class PostAPI extends BaseEventAPI<"event.post", Content> {
	constructor(repository: string) {
		super(repository, "event.post");
	}

	async get(id: string): Promise<eventReturnType<"event.post", Content>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.post", Content>[]> {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content): Promise<string> {
		if (!content.content.trim()) {
			throw new Error("投稿内容が空です。");
		}

		return await this.postEvent(publickey, {
			content: content.content.trim(),
		});
	}

	async delete(publickey: string, id: string): Promise<void> {
		return await this.deleteEvent(publickey, id);
	}
}
