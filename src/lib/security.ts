import { createHash } from "crypto";
import * as secp256k1 from "@noble/secp256k1";

// キーペアの生成
export const generateKeyPair = () => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
  return { privateKey, publicKey };
};

// メッセージのハッシュ計算
export const calculateHash = (message: any): Uint8Array => {
  const content =
    typeof message === "string" ? message : JSON.stringify(message);
  return new Uint8Array(createHash("sha256").update(content).digest());
};

// Uint8Array を 16進数文字列に変換
const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// 16進数文字列を Uint8Array に変換
const fromHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

// 署名の生成
export const signMessage = async (
  message: any,
  privateKey: Uint8Array
): Promise<string> => {
  try {
    const messageHash = calculateHash(message);
    const signature = await secp256k1.sign(messageHash, privateKey);
    // 署名をUint8Array形式に変換
    const signatureBytes = new Uint8Array(signature.toCompactRawBytes());
    return toHex(signatureBytes);
  } catch (error) {
    console.error("Signing error:", error);
    throw error;
  }
};

// 署名の検証
export const verifySignature = async (
  message: any,
  signature: string,
  publicKey: Uint8Array
): Promise<boolean> => {
  try {
    const messageHash = calculateHash(message);
    const signatureBytes = fromHex(signature);
    // secp256k1.Signatureオブジェクトを作成
    const sig = secp256k1.Signature.fromCompact(signatureBytes);
    return await secp256k1.verify(sig, messageHash, publicKey);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// セキュアメッセージの作成
export const createSecureMessage = async (
  type: string,
  payload: any,
  privateKey: Uint8Array
): Promise<SecureMessage> => {
  const message = { type, payload };
  const messageHash = calculateHash(message);
  const signature = await signMessage(message, privateKey);
  return {
    ...message,
    hash: toHex(messageHash),
    signature,
  };
};

// セキュアメッセージの検証
export const verifySecureMessage = async (
  message: SecureMessage,
  publicKey: Uint8Array
): Promise<boolean> => {
  const { signature, hash, ...content } = message;
  const calculatedHash = toHex(calculateHash(content));

  if (calculatedHash !== hash) {
    console.error("Hash mismatch: possible message tampering");
    return false;
  }

  return await verifySignature(content, signature, publicKey);
};

// 型定義
export interface SecureMessage<T = any> {
  type: string;
  payload: T;
  hash: string;
  signature: string;
}

// クライアントキーペアの保存と取得
const KEY_STORAGE_KEY = "client-keypair";

export const getOrCreateClientKeyPair = (): {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} => {
  const stored = localStorage.getItem(KEY_STORAGE_KEY);
  if (stored) {
    const { privateKey, publicKey } = JSON.parse(stored);
    return {
      privateKey: fromHex(privateKey),
      publicKey: fromHex(publicKey),
    };
  }

  const keyPair = generateKeyPair();
  localStorage.setItem(
    KEY_STORAGE_KEY,
    JSON.stringify({
      privateKey: toHex(keyPair.privateKey),
      publicKey: toHex(keyPair.publicKey),
    })
  );
  return keyPair;
};
