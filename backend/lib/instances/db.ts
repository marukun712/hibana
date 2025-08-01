import { createHelia, libp2pDefaults } from "helia";
import { createLibp2p } from "libp2p";
import { identify } from "@libp2p/identify";
import { LevelDatastore } from "datastore-level";
import { LevelBlockstore } from "blockstore-level";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import {
  createOrbitDB,
  IPFSAccessController,
  IPFSBlockStorage,
  Documents,
} from "@orbitdb/core";
import * as dotenv from "dotenv";
import { multiaddr } from "kubo-rpc-client";

dotenv.config();

let db: any;

const address = "/orbitdb/zdpuAukSpmTeWB4MM7EW6wwvVRjSeuMkKNCTycyWpcLukfw9r";

const options = libp2pDefaults();
options.addresses!.listen = [`/ip4/0.0.0.0/tcp/4002`];
process.env.GLOBAL_IP
  ? (options.addresses!.announce = [`/ip4/${process.env.GLOBAL_IP}/tcp/4002`])
  : null;
options.services.pubsub = gossipsub({ allowPublishToZeroTopicPeers: true });
options.services.identify = identify();

const blockstore = new LevelBlockstore("./helia/blocks");
const datastore = new LevelDatastore("./orbitdb/store");

export const getDB = async () => {
  if (db) {
    return db;
  }

  const libp2p = await createLibp2p(options);

  const ipfs = await createHelia({ datastore, blockstore, libp2p });
  const storage = await IPFSBlockStorage({ ipfs, pin: true });
  const orbitdb = await createOrbitDB({ ipfs });

  libp2p.dial([
    multiaddr(
      "/ip4/100.112.237.81/tcp/4002/p2p/12D3KooWSkwLBbv5Lm8DV4xJMf7nWna4bX5NNNGywvcApNpXKaiy"
    ),
  ]);

  db = await orbitdb.open(address, {
    Database: Documents({ storage, indexBy: "_id" }),
    type: "documents",
    AccessController: IPFSAccessController({ write: ["*"] }),
  });

  console.log(libp2p.getMultiaddrs());
  console.log(libp2p.peerId);

  db.events.on("join", async (peerId: string) => {
    console.log(peerId);
  });

  return db;
};
