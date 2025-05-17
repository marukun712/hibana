import { createHash } from "crypto";

export const calculateHash = async (content: string): Promise<Uint8Array> => {
  const hasher = createHash("sha256");
  hasher.update(content);
  const buf = hasher.digest();
  const hash = new Uint8Array(buf);
  return hash;
};
