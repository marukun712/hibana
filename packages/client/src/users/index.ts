import { ProfileAPI } from "./profile";

export class UsersAPI {
	public profile = new ProfileAPI();

	async getCurrentUser() {
		const publickey = await window.nostr.getPublicKey();
		const profile = await this.profile.get(publickey);
		return profile;
	}
}
