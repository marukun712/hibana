import { eventRouteType, profileRouteType } from "../../../../backend";
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

  const res = await client.profile.$post({ json: doc });
};
