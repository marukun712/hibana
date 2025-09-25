import type { eventReturnType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = { target: string; content: string };

export class ReplyAPI extends BaseEventAPI<"event.reply", Content> {
	constructor(repository: string) {
		super(repository, "event.reply");
	}

	async get(id: string): Promise<eventReturnType<"event.reply", Content>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.reply", Content>[]> {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content): Promise<string> {
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

	async delete(publickey: string, id: string): Promise<void> {
		return await this.deleteEvent(publickey, id);
	}
}
