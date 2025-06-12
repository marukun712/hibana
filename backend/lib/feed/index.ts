import type { rawDocument } from "../../schema/Document.ts";
import { getEvent } from "../events/index.ts";

export const createFeed = async (docs: rawDocument[]) => {
  console.log(docs);

  const feed = await Promise.all(
    docs.map(async (doc) => {
      const record = await getEvent(doc.value._id);

      return record;
    })
  );

  return feed.filter((doc) => doc !== null && doc !== undefined);
};
