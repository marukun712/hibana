import * as secp256k1 from "@noble/secp256k1";
import { Message } from "../../@types";

export const generateKeyPair = () => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
  return { privateKey, publicKey };
};

export const calculateHash = async (content: string): Promise<Uint8Array> => {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(content)
  );

  return new Uint8Array(hash);
};

export const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const fromHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

export const signMessage = async (
  message: string,
  privateKey: string
): Promise<string> => {
  try {
    const messageHash = await calculateHash(message);
    const signature = await secp256k1.signAsync(messageHash, privateKey);
    const signatureBytes = new Uint8Array(signature.toCompactRawBytes());
    return toHex(signatureBytes);
  } catch (error) {
    console.error("Signing error:", error);
    throw error;
  }
};

export const verifySignature = async (
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> => {
  try {
    const messageHash = await calculateHash(message);
    const signatureBytes = fromHex(signature);
    const sig = secp256k1.Signature.fromCompact(signatureBytes);
    return await secp256k1.verify(sig, messageHash, publicKey);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

export const createSecureMessage = async (
  text: string,
  timestamp: string,
  privateKey: string
): Promise<Message> => {
  const message = {
    text,
    timestamp,
  };
  const content = JSON.stringify(message);
  const messageHash = await calculateHash(content);
  const signature = await signMessage(content, privateKey);
  const publicKey = toHex(secp256k1.getPublicKey(privateKey));

  return {
    id: toHex(messageHash),
    text,
    publicKey,
    timestamp,
    signature,
  };
};

export const verifySecureMessage = async (
  message: Message
): Promise<boolean> => {
  const { id, text, publicKey, timestamp, signature } = message;

  const content = JSON.stringify({
    text,
    timestamp,
  });

  const calculatedHash = toHex(await calculateHash(content));

  if (calculatedHash !== id) {
    console.error("Hash mismatch: possible message tampering");
    return false;
  }

  return await verifySignature(content, signature, publicKey);
};
