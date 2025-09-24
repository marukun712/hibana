import { hc } from "hono/client";
import type { FeedItem } from "~/types/feed";
import type { eventRouteType, feedRouteType } from "../../../../backend";
import { postEvent } from "./event";
import { getFollows } from "./social";
import { getCurrentUser } from "./users";

export const createPost = async (content: string) => {
  if (!content.trim()) {
    throw new Error("投稿内容が空です。");
  }
  const postContent = {
    content: content.trim(),
  };
  return await postEvent("event.post", postContent);
};

export const createReply = async (targetId: string, content: string) => {
  if (!content.trim()) {
    throw new Error("リプライ内容が空です。");
  }
  if (!targetId) {
    throw new Error("リプライ対象が指定されていません。");
  }
  const replyContent = {
    target: targetId,
    content: content.trim(),
  };
  return await postEvent("event.reply", replyContent);
};

export const createQuoteRepost = async (targetId: string, content: string) => {
  if (!content.trim()) {
    throw new Error("引用リポスト内容が空です。");
  }
  if (!targetId) {
    throw new Error("引用リポスト対象が指定されていません。");
  }
  const quoteRepostContent = {
    target: targetId,
    content: content.trim(),
  };
  return await postEvent("event.quote_repost", quoteRepostContent);
};

const fetchFeedEvents = async (
  client: ReturnType<typeof hc<feedRouteType>>,
  publickey?: string,
) => {
  const eventTypes = [
    "event.post",
    "event.repost",
    "event.quote_repost",
    "event.reply",
  ] as const;

  const results = await Promise.all(
    eventTypes.map(async (event) => {
      const res = await client.feed.$get({
        query: { event, ...(publickey ? { publickey } : {}) },
      });
      const data = await res.json();
      if ("error" in data) return null;
      return data as FeedItem[];
    }),
  );

  return results.flat().filter((e): e is FeedItem => e !== null);
};

export const getPosts = async () => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const items = await fetchFeedEvents(client);
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const getUserPosts = async (publickey: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const items = await fetchFeedEvents(client, publickey);
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const getFollowingPosts = async (publickey: string) => {
  const follows = await getFollows(publickey);
  const posts = await Promise.all(
    follows.map((follow) =>
      follow.target ? getUserPosts(follow.target.publickey) : [],
    ),
  );
  return posts
    .flat()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
};

export const getReplies = async (postId: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.reply", target: postId },
  });
  const replies = (await res.json()) as FeedItem[];
  if (!("error" in replies)) {
    return replies.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } else {
    throw new Error("リプライの取得中にエラーが発生しました。");
  }
};

export const getPostById = async (postId: string) => {
  const user = await getCurrentUser();
  const client = hc<eventRouteType>(user.repository);
  const res = await client.event.$get({ query: { id: postId } });
  const post = (await res.json()) as FeedItem;
  return post;
};
