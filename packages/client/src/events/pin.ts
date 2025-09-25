import type { PinEvent } from "../types";
import { BaseEventAPI } from "./base";

type Content = { target: string };

export class PinAPI extends BaseEventAPI<"event.pin", Content, PinEvent> {
	constructor(repository: string) {
		super(repository, "event.pin");
	}

	async get(id: string) {
		return await this.getEvent(id);
	}

	async list(params?: { publickey?: string; id?: string; target?: string }) {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content) {
		if (!content.target) {
			throw new Error("ピン対象が指定されていません。");
		}
		return await this.postEvent(publickey, content);
	}

	async delete(publickey: string, id: string) {
		return await this.deleteEvent(publickey, id);
	}
}
