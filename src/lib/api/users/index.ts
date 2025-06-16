import { feedRouteType, profileRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { Crypto } from "../../../../utils/crypto";
import { profileType } from "../../../../backend/schema/Profile";

export const updateProfile = async (
  username: string,
  icon: string,
  description: string,
  repository: string,
  privateKey: string
) => {
  const client = hc<profileRouteType>("http://localhost:8000");

  const updatedAt = new Date().toISOString();

  const crypto = new Crypto(calculateHash);

  const doc = await crypto.createUserDoc(
    username,
    icon,
    description,
    repository,
    updatedAt,
    privateKey
  );

  await client.profile.$post({ json: doc });
};

export const getProfile = async (publickey: string) => {
  const client = hc<profileRouteType>("http://localhost:8000");

  const res = await client.profile.$get({ query: { publickey } });

  return await res.json();
};

export const getFollows = async (publickey: string) => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({
    query: { event: "event.follow", publickey },
  });

  return await res.json();
};

export const getFollowers = async (publickey: string) => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({
    query: { event: "event.follow", target: publickey },
  });

  return await res.json();
};

export const isFollowed = async (publickey: string, target: string) => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({
    query: { event: "event.follow", publickey, target },
  });

  const json = await res.json();

  if (json.length > 0) {
    return true;
  } else {
    return false;
  }
};
