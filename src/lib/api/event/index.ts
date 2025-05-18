import { eventRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { Crypto } from "../../../../utils/crypto";
const client = hc<eventRouteType>("http://localhost:8000");

export const postEvent = async (
  event: string,
  content: Record<string, any>,
  privateKey: string
) => {
  const timestamp = new Date().toISOString();

  const crypto = new Crypto(calculateHash);

  const message = await crypto.createSecureMessage(
    event,
    timestamp,
    content,
    privateKey
  );

  const res = await client.event.$post({ json: message });
};

export const getPosts = async () => {};
