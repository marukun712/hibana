import type { eventType, unknownSchemaType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = {
	url: string;
	body: unknownSchemaType[];
};

export class MigrationAPI extends BaseEventAPI<"event.migrate", Content> {
	constructor(repository: string, publickey: string) {
		super(repository, publickey, "event.migrate");
	}

	async get(id: string): Promise<eventType<"event.migrate", Content>> {
		return await this.getEvent(id);
	}

	async list(
		id?: string,
		target?: string,
	): Promise<eventType<"event.migrate", Content>[]> {
		return await this.listEvents(id, target);
	}

	async post(content: Content): Promise<string> {
		if (!content.body || content.body.length === 0) {
			throw new Error("マイグレーションデータが空です。");
		}
		return await this.postEvent(content);
	}

	async delete(id: string): Promise<void> {
		return await this.deleteEvent(id);
	}
}
