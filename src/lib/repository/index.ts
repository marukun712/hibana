import { getPublicKey } from "@noble/secp256k1";
import { UserRepository } from "./user";
import { toHex } from "../../../utils/crypto";

const repo: UserRepository = new UserRepository();

export const getRepo = async (privatekey: string) => {
  if (repo.isInitialized()) {
    return repo;
  } else {
    await repo.initialize(toHex(getPublicKey(privatekey)));
    return repo;
  }
};
