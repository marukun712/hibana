import type { rawDocument } from "../../schema/Document.ts";
import { resolveRepositoryDocument } from "../events/index.ts";

export const createFeed = async (posts: rawDocument[]) => {
  const feed = await Promise.all(
    posts.map(async (post) => {
      const record = resolveRepositoryDocument(post.value);

      return record;
    })
  );

  return feed.filter((post) => post !== null);
};
