import { createHelia, libp2pDefaults } from "helia";
import { createOrbitDB, IPFSAccessController } from "@orbitdb/core";
import { createLibp2p } from "libp2p";
import { z } from "zod";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { LevelDatastore } from "datastore-level";
import { FsBlockstore } from "blockstore-fs";

let db: any;

const address = "/orbitdb/zdpuAukSpmTeWB4MM7EW6wwvVRjSeuMkKNCTycyWpcLukfw9r";

const options = libp2pDefaults();
options.addresses!.listen = ["/ip4/0.0.0.0/tcp/4001"];
options.services.pubsub = gossipsub({ allowPublishToZeroTopicPeers: true });
options.services.identify = identify();

export const documentSchema = z.object({
  _id: z.string(),
  event: z.string(),
  publickey: z.string(),
  timestamp: z.string(),
});

export type documentType = z.infer<typeof documentSchema>;

const blockstore = new FsBlockstore("./orbitdb/store");
const datastore = new LevelDatastore("./orbitdb/store");

export const getDB = async () => {
  if (db) {
    return db;
  }

  const libp2p = await createLibp2p(options);
  const ipfs = await createHelia({ datastore, blockstore, libp2p });

  const orbitdb = await createOrbitDB({ ipfs });
  db = await orbitdb.open(address, {
    type: "documents",
    AccessController: IPFSAccessController({ write: ["*"] }),
  });

  console.log(db.address);

  return db;
};
