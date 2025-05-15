import { createHelia } from "helia";
import { json } from "@helia/json";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";

let helia: any = null;
let j: any = null;

export async function initializeHelia() {
  if (helia) {
    return { helia, j };
  }

  const blockstore = new MemoryBlockstore();
  const datastore = new MemoryDatastore();

  helia = await createHelia({
    blockstore,
    datastore,
  });

  j = json(helia);

  return { helia, j };
}
