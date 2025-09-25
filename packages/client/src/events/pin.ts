import type { eventReturnType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = { target: string };

export class PinAPI extends BaseEventAPI<"event.pin", Content> {
	constructor(repository: string) {
		super(repository, "event.pin");
	}

	async get(id: string): Promise<eventReturnType<"event.pin", Content>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.pin", Content>[]> {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content): Promise<string> {
		if (!content.target) {
			throw new Error("ピン対象が指定されていません。");
		}
		return await this.postEvent(publickey, content);
	}

	async delete(publickey: string, id: string): Promise<void> {
		return await this.deleteEvent(publickey, id);
	}
}
