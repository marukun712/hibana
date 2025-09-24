import type { eventType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = { target: string };

export class FollowAPI extends BaseEventAPI<"event.follow", Content> {
	constructor(repository: string, publickey: string) {
		super(repository, publickey, "event.follow");
	}

	async get(id: string): Promise<eventType<"event.follow", Content>> {
		return await this.getEvent(id);
	}

	async list(
		id?: string,
		target?: string,
	): Promise<eventType<"event.follow", Content>[]> {
		return await this.listEvents(id, target);
	}

	async post(content: Content): Promise<string> {
		if (!content.target) {
			throw new Error("フォロー対象が指定されていません。");
		}
		return await this.postEvent(content);
	}

	async delete(id: string): Promise<void> {
		return await this.deleteEvent(id);
	}
}
