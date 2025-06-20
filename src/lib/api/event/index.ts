import { eventRouteType, feedRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { Crypto } from "../../../../utils/crypto";

export const postEvent = async (
  event: string,
  content: Record<string, any>
) => {
  const client = hc<eventRouteType>("http://localhost:8000");

  const timestamp = new Date().toISOString();

  const crypto = new Crypto(calculateHash);

  const message = await crypto.createSecureMessage(event, timestamp, content);

  if (message) await client.event.$post({ json: message });
};

export const getPosts = async () => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({ query: { event: "event.post" } });

  const feed = await res.json();

  return feed;
};

export const getUserPosts = async (publickey: string) => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({
    query: { event: "event.post", publickey },
  });

  const feed = await res.json();

  return feed;
};

export const isPinned = async (publickey: string, target: string) => {
  const client = hc<feedRouteType>("http://localhost:8000");

  const res = await client.feed.$get({
    query: { event: "event.pin", publickey, target },
  });

  const json = await res.json();

  if (json.length > 0) {
    return true;
  } else {
    return false;
  }
};
