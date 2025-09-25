import type { eventReturnType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = { content: string };

export class PostAPI extends BaseEventAPI<"event.post", Content> {
	constructor(repository: string, publickey: string) {
		super(repository, publickey, "event.post");
	}

	async get(id: string): Promise<eventReturnType<"event.post", Content>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.post", Content>[]> {
		return await this.listEvents(params);
	}

	async post(content: Content): Promise<string> {
		if (!content.content.trim()) {
			throw new Error("投稿内容が空です。");
		}

		return await this.postEvent({
			content: content.content.trim(),
		});
	}

	async delete(id: string): Promise<void> {
		return await this.deleteEvent(id);
	}
}
