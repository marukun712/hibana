import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import type { documentType } from "@hibana/schema";
import { identify } from "@libp2p/identify";
import {
	createOrbitDB,
	type Database,
	Documents,
	IPFSAccessController,
	IPFSBlockStorage,
} from "@orbitdb/core";
import { LevelBlockstore } from "blockstore-level";
import { LevelDatastore } from "datastore-level";
import * as dotenv from "dotenv";
import { createHelia, libp2pDefaults } from "helia";
import { createLibp2p } from "libp2p";

dotenv.config();

export class OrbitDBService {
	private constructor(private db: Database<documentType>) {}

	static async create(): Promise<OrbitDBService> {
		const options = libp2pDefaults();

		if (options.addresses && process.env.ORBITDB_PORT) {
			options.addresses.listen = [
				`/ip4/0.0.0.0/tcp/${process.env.ORBITDB_PORT}`,
			];

			if (process.env.GLOBAL_IP) {
				options.addresses.announce = [
					`/ip4/${process.env.GLOBAL_IP}/tcp/${process.env.ORBITDB_PORT}`,
				];
			}
		} else {
			throw new Error("ORBITDB_PORT must be set");
		}

		if (options.services) {
			options.services.pubsub = gossipsub({
				allowPublishToZeroTopicPeers: true,
			});
			options.services.identify = identify();
		}

		const blockstore = new LevelBlockstore("./helia/blocks");
		const datastore = new LevelDatastore("./orbitdb/store");

		const libp2p = await createLibp2p(options);
		const ipfs = await createHelia({ datastore, blockstore, libp2p });

		const storage = await IPFSBlockStorage({ ipfs, pin: true });
		const orbitdb = await createOrbitDB({ ipfs });

		const db = await orbitdb.open("hibana-db", {
			Database: Documents({ storage, indexBy: "_id" }),
			type: "documents",
			AccessController: IPFSAccessController({ write: ["*"] }),
		});

		console.log("OrbitDB address:", db.address);

		db.events.on("join", async (peerId: string) => {
			console.log("Peer joined:", peerId);
		});

		return new OrbitDBService(db);
	}

	public getDB(): Database<documentType> {
		return this.db;
	}
}

export const orbitDB = await OrbitDBService.create();
