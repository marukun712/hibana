import { getDB, type documentType } from "../db.ts";
import {
  getAllDocument,
  searchDocument,
  writeDocument,
} from "../events/index.ts";
import { getHelia, type profileType } from "../helia.ts";
import { json } from "@helia/json";
import { CID } from "multiformats/cid";

export const updateUser = async (data: profileType) => {
  const helia = await getHelia();
  const j = json(helia);

  const cid = await j.add(data);

  const document: documentType = {
    _id: cid.toString(),
    event: "event.profile",
    publickey: data.publickey,
    timestamp: new Date().toISOString(),
  };

  await writeDocument(document);

  return document;
};

export const getProfileDoc = async (publickey: string) => {
  const helia = await getHelia();
  const j = json(helia);

  const data = await searchDocument({ publickey, event: "event.profile" });

  const record: documentType = data[0].value;
  const cid = record._id;

  const doc: profileType = await j.get(CID.parse(cid));

  return doc;
};
