import { getDB, type documentType } from "../db.ts";

export const writeDocument = async (document: documentType) => {
  const db = await getDB();
  await db.put(document);
};

export const getAllDocument = async () => {
  const db = await getDB();
  return db.all();
};

export const searchDocument = async (query: { [key: string]: string }) => {
  const db = await getDB();

  const result = await db.query((doc: any) =>
    Object.entries(query).every(([key, value]) => doc[key] === value)
  );

  const data = result.map((doc: any) => {
    return { value: doc };
  });

  return data;
};
