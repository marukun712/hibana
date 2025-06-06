import type { rawDocument } from "../../schema/Document.ts";
import { getEvent } from "../events/index.ts";

export const createFeed = async (posts: rawDocument[]) => {
  const feed = await Promise.all(
    posts.map(async (post) => {
      const record = await getEvent(post.value._id);

      return record;
    })
  );

  return feed.filter((post) => post !== null);
};
