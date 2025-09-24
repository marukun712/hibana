import { create, type KuboRPCClient } from "kubo-rpc-client";

let client: KuboRPCClient;

export const getClient = async () => {
	if (client) {
		return client;
	}

	client = create(new URL("http://ipfs:5001"));
	return client;
};
