import type { profileType } from "@hibana/schema/Profile";
import { BaseEventAPI } from "./base";

export class PinAPI extends BaseEventAPI {
	async add(targetId: string, getCurrentUser: () => Promise<profileType>) {
		if (!targetId) {
			throw new Error("ピン対象が指定されていません。");
		}

		const user = await getCurrentUser();
		const pinContent = { target: targetId };
		return await this.postEvent("event.pin", pinContent, user.repository);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}
