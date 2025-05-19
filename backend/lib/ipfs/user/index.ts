import { Crypto } from "../../../../utils/crypto.ts";
import { calculateHash } from "../../hash.ts";
import { type documentType } from "../db.ts";
import { searchDocument, writeDocument } from "../events/index.ts";
import { getHelia, type profileType } from "../helia.ts";
import { json } from "@helia/json";
import { CID } from "multiformats/cid";

export const updateUser = async (data: profileType) => {
  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(data);

  if (verify) {
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
    await helia.routing.provide(cid);

    return document;
  } else {
    return null;
  }
};

export const getProfileDoc = async (publickey: string) => {
  const helia = await getHelia();
  const j = json(helia);

  const data = await searchDocument({ publickey, event: "event.profile" });

  const record: documentType = data[0].value;
  const cid = record._id;

  const doc: profileType = await j.get(CID.parse(cid));

  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(doc);

  if (verify) return doc;
  else return null;
};
