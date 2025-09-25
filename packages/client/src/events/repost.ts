import type { eventReturnType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type RepostContent = { target: string };
type QuoteRepostContent = { target: string; content: string };

export class RepostAPI extends BaseEventAPI<"event.repost", RepostContent> {
	constructor(repository: string, publickey: string) {
		super(repository, publickey, "event.repost");
	}

	async get(
		id: string,
	): Promise<eventReturnType<"event.repost", RepostContent>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.repost", RepostContent>[]> {
		return await this.listEvents(params);
	}

	async post(content: RepostContent): Promise<string> {
		if (!content.target) {
			throw new Error("リポスト対象が指定されていません。");
		}
		return await this.postEvent(content);
	}

	async delete(id: string): Promise<void> {
		return await this.deleteEvent(id);
	}
}

export class QuoteRepostAPI extends BaseEventAPI<
	"event.quote_repost",
	QuoteRepostContent
> {
	constructor(repository: string, publickey: string) {
		super(repository, publickey, "event.quote_repost");
	}

	async get(
		id: string,
	): Promise<eventReturnType<"event.quote_repost", QuoteRepostContent>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.quote_repost", QuoteRepostContent>[]> {
		return await this.listEvents(params);
	}

	async post(content: QuoteRepostContent): Promise<string> {
		if (!content.content.trim()) {
			throw new Error("引用リポスト内容が空です。");
		}
		if (!content.target) {
			throw new Error("引用リポスト対象が指定されていません。");
		}

		return await this.postEvent({
			...content,
			content: content.content.trim(),
		});
	}

	async delete(id: string): Promise<void> {
		return await this.deleteEvent(id);
	}
}
