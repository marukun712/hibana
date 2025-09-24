import type { profileType } from "@hibana/schema/Profile";
import { BaseEventAPI } from "./base";

export class FollowAPI extends BaseEventAPI {
	async add(targetId: string, getCurrentUser: () => Promise<profileType>) {
		if (!targetId) {
			throw new Error("フォロー対象が指定されていません。");
		}

		const user = await getCurrentUser();
		const followContent = {
			target: targetId,
		};
		return await this.postEvent("event.follow", followContent, user.repository);
	}

	async delete(id: string, getCurrentUser: () => Promise<profileType>) {
		const user = await getCurrentUser();
		return await this.deleteEvent(id, user.repository);
	}
}
