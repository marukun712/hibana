import type { ReplyEvent } from "../types";
import { BaseEventAPI } from "./base";

type Content = { target: string; content: string };

export class ReplyAPI extends BaseEventAPI<"event.reply", Content, ReplyEvent> {
	constructor(repository: string) {
		super(repository, "event.reply");
	}

	async get(id: string) {
		return await this.getEvent(id);
	}

	async list(params?: { publickey?: string; id?: string; target?: string }) {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content) {
		if (!content.content.trim()) {
			throw new Error("リプライ内容が空です。");
		}
		if (!content.target) {
			throw new Error("リプライ対象が指定されていません。");
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
