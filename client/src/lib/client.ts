import { HibanaClient } from "@hibana/client";
import type { profileType } from "@hibana/schema/Profile";

export const getCurrentUser = async (): Promise<profileType | null> => {
	const tempClient = new HibanaClient("http://localhost:8002");
	const publickey = await window.nostr.getPublicKey();
	if (!publickey) return null;
	const user = await tempClient.profile.get(publickey);
	return user;
};

export const createClient = (repository: string): HibanaClient => {
	return new HibanaClient(repository);
};
