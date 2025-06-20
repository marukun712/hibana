import * as secp256k1 from "@noble/secp256k1";
import type { profileType } from "../backend/schema/Profile.ts";
import type { eventType } from "../backend/schema/Event.ts";
import { schnorr } from "@noble/curves/secp256k1.js";

export class Crypto {
  private calculateHash: (content: string) => Promise<Uint8Array>;

  constructor(calculateHash: (content: string) => Promise<Uint8Array>) {
    this.calculateHash = calculateHash;
  }

  static generateKeyPair() {
    const privateKey = schnorr.utils.randomPrivateKey();
    const publickey = schnorr.getPublicKey(privateKey);

    return {
      privatekey: secp256k1.etc.bytesToHex(privateKey),
      publickey: secp256k1.etc.bytesToHex(publickey),
    };
  }

  async signMessage(content: string, privateKey: string): Promise<string> {
    try {
      const messageHash = await this.calculateHash(content);
      const signature = schnorr.sign(messageHash, privateKey);
      return secp256k1.etc.bytesToHex(signature);
    } catch (error) {
      console.error("Signing error:", error);
      throw error;
    }
  }

  async verifySignature(
    publickey: string,
    signature: string,
    content: string
  ): Promise<boolean> {
    try {
      const messageHash = await this.calculateHash(content);
      const signatureBytes = secp256k1.etc.hexToBytes(signature);
      return schnorr.verify(signatureBytes, messageHash, publickey);
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  async createSecureMessage(
    event: string,
    timestamp: string,
    message: Record<string, any>,
    privateKey: string
  ): Promise<eventType> {
    const json = JSON.stringify({ event, timestamp, message });
    const messageHash = await this.calculateHash(json);
    const signature = await this.signMessage(json, privateKey);
    const publickey = secp256k1.etc.bytesToHex(
      schnorr.getPublicKey(privateKey)
    );

    return {
      id: secp256k1.etc.bytesToHex(messageHash),
      publickey,
      signature,
      event,
      timestamp,
      message,
    };
  }

  async verifySecureMessage(data: eventType): Promise<boolean> {
    const { id, publickey, signature, event, timestamp, message } = data;
    const content = JSON.stringify({ event, timestamp, message });

    const calculatedHash = secp256k1.etc.bytesToHex(
      await this.calculateHash(content)
    );

    if (calculatedHash !== id) {
      console.error("Hash mismatch: possible message tampering");
      return false;
    }

    return await this.verifySignature(publickey, signature, content);
  }

  async createUserDoc(
    username: string,
    icon: string,
    description: string,
    repository: string,
    updatedAt: string,
    privateKey: string
  ): Promise<profileType> {
    const json = JSON.stringify({
      username,
      icon,
      description,
      repository,
      updatedAt,
    });

    const messageHash = await this.calculateHash(json);
    const signature = await this.signMessage(json, privateKey);
    const publickey = secp256k1.etc.bytesToHex(
      schnorr.getPublicKey(privateKey)
    );

    return {
      id: secp256k1.etc.bytesToHex(messageHash),
      publickey,
      signature,
      username,
      icon,
      description,
      repository,
      updatedAt,
    };
  }

  async verifyUserDoc(data: profileType): Promise<boolean> {
    const {
      id,
      publickey,
      signature,
      username,
      icon,
      description,
      repository,
      updatedAt,
    } = data;

    const content = JSON.stringify({
      username,
      icon,
      description,
      repository,
      updatedAt,
    });

    const calculatedHash = secp256k1.etc.bytesToHex(
      await this.calculateHash(content)
    );

    if (calculatedHash !== id) {
      console.error("Hash mismatch: possible message tampering");
      return false;
    }

    return await this.verifySignature(publickey, signature, content);
  }
}

export const isValidPublickey = (hex: string) => {
  try {
    const x = BigInt("0x" + hex);
    return schnorr.utils.lift_x(x) !== undefined;
  } catch {
    return false;
  }
};
