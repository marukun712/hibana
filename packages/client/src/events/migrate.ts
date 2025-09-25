import type { eventReturnType, unknownSchemaType } from "@hibana/schema";
import { BaseEventAPI } from "./base";

type Content = {
	url: string;
	body: unknownSchemaType[];
};

export class MigrationAPI extends BaseEventAPI<"event.migrate", Content> {
	constructor(repository: string) {
		super(repository, "event.migrate");
	}

	async get(id: string): Promise<eventReturnType<"event.migrate", Content>> {
		return await this.getEvent(id);
	}

	async list(params?: {
		publickey?: string;
		id?: string;
		target?: string;
	}): Promise<eventReturnType<"event.migrate", Content>[]> {
		return await this.listEvents(params);
	}

	async post(publickey: string, content: Content): Promise<string> {
		if (!content.body || content.body.length === 0) {
			throw new Error("マイグレーションデータが空です。");
		}
		return await this.postEvent(publickey, content);
	}

	async delete(publickey: string, id: string): Promise<void> {
		return await this.deleteEvent(publickey, id);
	}
}
