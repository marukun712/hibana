import { createHelia, libp2pDefaults } from "helia";
import { createLibp2p } from "libp2p";
import { LevelDatastore } from "datastore-level";
import { FsBlockstore } from "blockstore-fs";
import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

let helia: any;

export const profileSchema = z.object({
  id: z.string(),
  publickey: z.string(),
  signature: z.string(),
  username: z.string(),
  icon: z.string(),
  description: z.string(),
  repository: z.string(),
  updatedAt: z.string(),
});

export type profileType = z.infer<typeof profileSchema>;

const options = libp2pDefaults();
options.addresses!.listen = [`/ip4/${process.env.GLOBAL_IP}/tcp/4002`];

const blockstore = new FsBlockstore("./helia/store");
const datastore = new LevelDatastore("./helia/store");

export const getHelia = async () => {
  if (helia) {
    return helia;
  }

  const libp2p = await createLibp2p(options);
  helia = await createHelia({ datastore, blockstore, libp2p });

  return helia;
};
