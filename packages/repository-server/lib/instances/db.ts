import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import type { documentType } from "@hibana/schema";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { tcp } from "@libp2p/tcp";
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
import { createHelia } from "helia";
import { multiaddr } from "kubo-rpc-client";
import { createLibp2p } from "libp2p";

dotenv.config();

export class OrbitDBService {
	private constructor(private db: Database<documentType>) {}

	static async create(): Promise<OrbitDBService> {
		const addresses: { listen: string[]; announce: string[] } = {
			listen: [],
			announce: [],
		};
		if (process.env.ORBITDB_PORT) {
			addresses.listen = [`/ip4/0.0.0.0/tcp/${process.env.ORBITDB_PORT}`];

			if (process.env.GLOBAL_IP) {
				addresses.announce = [
					`/ip4/${process.env.GLOBAL_IP}/tcp/${process.env.ORBITDB_PORT}`,
				];
			}
		} else {
			throw new Error("ORBITDB_PORT must be set");
		}

		const blockstore = new LevelBlockstore("./helia/blocks");
		const datastore = new LevelDatastore("./orbitdb/store");

		const libp2p = await createLibp2p({
			addresses: addresses,
			transports: [tcp()],
			peerDiscovery: [mdns()],
			connectionEncrypters: [noise()],
			streamMuxers: [yamux()],
			services: {
				pubsub: gossipsub({
					allowPublishToZeroTopicPeers: true,
				}),
				identify: identify(),
			},
		});
		const ipfs = await createHelia({ datastore, blockstore, libp2p });

		libp2p.dial(multiaddr("/ip4/0.0.0.0/tcp/4002")).catch((error) => {
			console.error(`ピアへの接続に失敗しました`, error);
		});

		libp2p.dial(multiaddr("/ip4/0.0.0.0/tcp/4003")).catch((error) => {
			console.error(`ピアへの接続に失敗しました`, error);
		});

		libp2p.dial(multiaddr("/ip4/0.0.0.0/tcp/4004")).catch((error) => {
			console.error(`ピアへの接続に失敗しました`, error);
		});

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
