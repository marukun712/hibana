import { feedRouteType, profileRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { CryptoUtils } from "../../../../utils/crypto";

export const updateProfile = async (
  username: string,
  icon: string,
  description: string,
  repository: string
) => {
  const client = hc<profileRouteType>("http://100.112.237.81:8000");
  const updatedAt = new Date().toISOString();
  const crypto = new CryptoUtils(calculateHash);
  const doc = await crypto.createUserDoc(
    username,
    icon,
    description,
    repository,
    updatedAt
  );

  if (doc) await client.profile.$post({ json: doc });
};

export const getProfile = async (publickey: string) => {
  const client = hc<profileRouteType>("http://100.112.237.81:8000");
  const res = await client.profile.$get({ query: { publickey } });
  const json = await res.json();
  if (!("error" in json)) {
    return json;
  } else {
    throw new Error("取得中にエラーが発生しました。");
  }
};

export const getCurrentUser = async () => {
  const publickey = await window.nostr.getPublicKey();
  const profile = await getProfile(publickey);
  return profile;
};

export const getFollows = async (publickey: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.follow", publickey },
  });
  const feed = await res.json();
  if (!("error" in feed)) {
    return feed;
  } else {
    throw new Error("取得中にエラーが発生しました。");
  }
};

export const getFollowers = async (publickey: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.follow", target: publickey },
  });
  const feed = await res.json();
  if (!("error" in feed)) {
    return feed;
  } else {
    throw new Error("取得中にエラーが発生しました。");
  }
};

export const isFollowed = async (publickey: string, target: string) => {
  const user = await getCurrentUser();
  const client = hc<feedRouteType>(user.repository);
  const res = await client.feed.$get({
    query: { event: "event.follow", publickey, target },
  });
  const json = await res.json();
  if (!("error" in json) && json.length > 0) {
    return { id: json[0].id, isFollowed: true };
  } else {
    return { id: null, isFollowed: false };
  }
};
