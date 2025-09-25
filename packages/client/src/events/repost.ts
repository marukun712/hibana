import type { QuoteRepostEvent, RepostEvent } from "../types";
import { BaseEventAPI } from "./base";

type RepostContent = { target: string };
type QuoteRepostContent = { target: string; content: string };

export class RepostAPI extends BaseEventAPI<
	"event.repost",
	RepostContent,
	RepostEvent
> {
	constructor(repository: string) {
		super(repository, "event.repost");
	}

	async get(id: string) {
		return await this.getEvent(id);
	}

	async list(params?: { publickey?: string; id?: string; target?: string }) {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: RepostContent) {
		if (!content.target) {
			throw new Error("リポスト対象が指定されていません。");
		}
		return await this.postEvent(publickey, content);
	}

	async delete(publickey: string, id: string) {
		return await this.deleteEvent(publickey, id);
	}
}

export class QuoteRepostAPI extends BaseEventAPI<
	"event.quote_repost",
	QuoteRepostContent,
	QuoteRepostEvent
> {
	constructor(repository: string) {
		super(repository, "event.quote_repost");
	}

	async get(id: string) {
		return await this.getEvent(id);
	}

	async list(params?: { publickey?: string; id?: string; target?: string }) {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: QuoteRepostContent) {
		if (!content.content.trim()) {
			throw new Error("引用リポスト内容が空です。");
		}
		if (!content.target) {
			throw new Error("引用リポスト対象が指定されていません。");
		}

		return await this.postEvent(publickey, {
			...content,
			content: content.content.trim(),
		});
	}

	async delete(publickey: string, id: string) {
		return await this.deleteEvent(publickey, id);
	}
}
