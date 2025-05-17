import { postType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { Crypto } from "../../../../utils/crypto";
const client = hc<postType>("http://localhost:8000");

export const postMessage = async (text: string, privateKey: string) => {
  const timestamp = new Date().toISOString();

  const crypto = new Crypto(calculateHash);

  const message = await crypto.createSecureMessage(
    "event.post",
    timestamp,
    { content: text },
    privateKey
  );

  const res = await client.post.$post({ json: message });

  console.log(res);
};

export const getPosts = async () => {};
