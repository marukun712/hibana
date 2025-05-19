import { Crypto } from "../../../../utils/crypto.ts";
import { calculateHash } from "../../hash.ts";
import { documentSchema, type documentType } from "../db.ts";
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

    const parsed = documentSchema.safeParse(document);
    if (parsed.success) {
      await writeDocument(document);
    }

    return document;
  } else {
    return null;
  }
};

//orbitdbからプロフィール更新イベントを探す
export const findProfileDoc = async (publickey: string) => {
  const data = await searchDocument({ publickey, event: "event.profile" });

  if (data[0]) {
    const doc = await resolveProfileDoc(data[0].value._id);

    return doc;
  }
};

//cidからdocumentを解決
export const resolveProfileDoc = async (cid: string) => {
  const helia = await getHelia();
  const j = json(helia);

  const doc: profileType = await j.get(CID.parse(cid));

  const crypto = new Crypto(calculateHash);
  const verify = await crypto.verifyUserDoc(doc);

  if (verify) {
    return doc;
  } else {
    return null;
  }
};
