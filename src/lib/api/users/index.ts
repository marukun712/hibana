import { profileRouteType } from "../../../../backend";
import { hc } from "hono/client";
import { calculateHash } from "../hash";
import { Crypto } from "../../../../utils/crypto";
const client = hc<profileRouteType>("http://localhost:8000");

export const updateProfile = async (
  username: string,
  icon: string,
  description: string,
  repository: string,
  privateKey: string
) => {
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
  const res = await client.profile.$get({ query: { publickey } });

  return res.json();
};
