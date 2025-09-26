import { create, type KuboRPCClient } from "kubo-rpc-client";

export class IPFSClientService {
	private client: KuboRPCClient;

	constructor(endpoint: string = "http://localhost:5001") {
		this.client = create(new URL(endpoint));
	}

	public getClient(): KuboRPCClient {
		return this.client;
	}
}

export const ipfs = new IPFSClientService();
