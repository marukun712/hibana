import { HibanaClient } from "@hibana/client";
import type { profileType } from "@hibana/schema/Profile";

export const getCurrentUser = async (): Promise<profileType> => {
	try {
		if (!window.nostr) {
			throw new Error(
				"Nostr extension is not available. Please install a Nostr browser extension.",
			);
		}
		const tempClient = new HibanaClient("http://localhost:8000");
		const publickey = await window.nostr.getPublicKey();
		const user = await tempClient.profile.get(publickey);
		return user;
	} catch (error) {
		console.error("Failed to get current user:", error);
		throw error;
	}
};

export const createClient = (repository: string): HibanaClient => {
	return new HibanaClient(repository);
};
