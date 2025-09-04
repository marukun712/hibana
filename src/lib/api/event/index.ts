import { eventRouteType, feedRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { CryptoUtils } from "../../../../utils/crypto";
import { getCurrentUser } from "../users";

export const postEvent = async (
  event: string,
  content: Record<string, any>
) => {
  const user = await getCurrentUser();
  const client = hc<eventRouteType>(user.repository);
  const timestamp = new Date().toISOString();
  const crypto = new CryptoUtils(calculateHash);
  const message = await crypto.createSecureMessage(event, timestamp, content);

  if (message) {
    const data = await client.event.$post({ json: message });
    const json = await data.json();

    if (!("error" in json)) {
      return json.id;
    } else {
      throw new Error("投稿中にエラーが発生しました。");
    }
  }
};

export const deleteEvent = async (id: string) => {
  const user = await getCurrentUser();
  const client = hc<eventRouteType>(user.repository);
  const crypto = new CryptoUtils(calculateHash);
  const signature = await crypto.signMessage(id);
  await client.event.$delete({ json: { target: id, signature, content: id } });
};

export const getPosts = async () => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  
  // 通常の投稿を取得
  const postsRes = await client.feed.$get({ query: { event: "event.post" } });
  const posts = await postsRes.json();
  
  // リポストを取得
  const repostsRes = await client.feed.$get({ query: { event: "event.repost" } });
  const reposts = await repostsRes.json();
  
  // 引用リポストを取得
  const quoteRepostsRes = await client.feed.$get({ query: { event: "event.quote_repost" } });
  const quoteReposts = await quoteRepostsRes.json();
  
  if (!("error" in posts) && !("error" in reposts) && !("error" in quoteReposts)) {
    // 投稿、リポスト、引用リポストを統合してタイムスタンプでソート
    const allItems = [...posts, ...reposts, ...quoteReposts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return allItems;
  } else {
    throw new Error("取得中にエラーが発生しました。");
  }
};

export const getUserPosts = async (publickey: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.post", publickey },
  });
  const feed = await res.json();
  if (!("error" in feed)) {
    return feed;
  } else {
    throw new Error("取得中にエラーが発生しました。");
  }
};

export const isPinned = async (publickey: string, target: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.pin", publickey, target },
  });
  const json = await res.json();
  if (!("error" in json) && json.length > 0) {
    return { id: json[0].id, isPinned: true };
  } else {
    return { id: null, isPinned: false };
  }
};

export const isReposted = async (publickey: string, target: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.repost", publickey, target },
  });
  const json = await res.json();
  if (!("error" in json) && json.length > 0) {
    return { id: json[0].id, isReposted: true };
  } else {
    return { id: null, isReposted: false };
  }
};
