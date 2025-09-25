import { HibanaClient } from "@hibana/client";

export const createClient = (repository: string): HibanaClient => {
	return new HibanaClient(repository);
};
