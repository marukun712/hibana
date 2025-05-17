import { getDB, type documentType } from "./db.ts";

export const writeDocument = async (document: documentType) => {
  const db = await getDB();

  await db.put(document);
};

export const getAllDocument = async () => {
  const db = await getDB();
  return db.all();
};
