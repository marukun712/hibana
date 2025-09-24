import type { eventType, profileType, unknownSchemaType } from "@hibana/schema";
import { schnorr } from "@noble/curves/secp256k1.js";
import * as secp256k1 from "@noble/secp256k1";

export type HashFunction = (content: string) => Promise<Uint8Array>;

export function generateKeyPair() {
	const privateKey = schnorr.utils.randomPrivateKey();
	const publickey = schnorr.getPublicKey(privateKey);

	return {
		privatekey: secp256k1.etc.bytesToHex(privateKey),
		publickey: secp256k1.etc.bytesToHex(publickey),
	};
}

export async function signMessage(
	content: string,
	calculateHash: HashFunction,
): Promise<string> {
	try {
		const messageHash = await calculateHash(content);
		return window.nostr.signSchnorr(secp256k1.etc.bytesToHex(messageHash));
	} catch (error) {
		console.error("Signing error:", error);
		throw error;
	}
}

export async function verifySignature(
	publickey: string,
	signature: string,
	content: string,
	calculateHash: HashFunction,
): Promise<boolean> {
	try {
		const messageHash = await calculateHash(content);
		const signatureBytes = secp256k1.etc.hexToBytes(signature);
		return schnorr.verify(signatureBytes, messageHash, publickey);
	} catch (error) {
		console.error("Signature verification error:", error);
		return false;
	}
}

export async function createSecureMessage<T>(
	params: {
		event: string;
		timestamp: string;
		message: T;
		publickey: string;
	},
	calculateHash: HashFunction,
): Promise<eventType<string, T>> {
	const { event, timestamp, message, publickey } = params;
	if (!publickey) {
		throw new Error("公開鍵が不正です");
	}
	const json = JSON.stringify({ event, timestamp, message });
	const messageHash = await calculateHash(json);
	const signature = await signMessage(json, calculateHash);
	return {
		id: secp256k1.etc.bytesToHex(messageHash),
		publickey,
		signature,
		event,
		timestamp,
		message,
	};
}

export async function verifySecureMessage(
	data: unknownSchemaType,
	calculateHash: HashFunction,
): Promise<boolean> {
	const { id, publickey, signature, event, timestamp, message } = data;
	const content = JSON.stringify({ event, timestamp, message });
	const calculatedHash = secp256k1.etc.bytesToHex(await calculateHash(content));
	if (calculatedHash !== id) {
		console.error("Hash mismatch: possible message tampering");
		return false;
	}
	return await verifySignature(publickey, signature, content, calculateHash);
}

export async function createUserDoc(
	params: {
		username: string;
		icon: string;
		description: string;
		repository: string;
		updatedAt: string;
		publickey: string;
	},
	calculateHash: HashFunction,
): Promise<profileType> {
	const { username, icon, description, repository, updatedAt, publickey } =
		params;
	const json = JSON.stringify({
		username,
		icon,
		description,
		repository,
		updatedAt,
	});
	if (!publickey) {
		throw new Error("公開鍵が不正です");
	}
	const messageHash = await calculateHash(json);
	const signature = await signMessage(json, calculateHash);
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

export async function verifyUserDoc(
	data: profileType,
	calculateHash: HashFunction,
): Promise<boolean> {
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
	const calculatedHash = secp256k1.etc.bytesToHex(await calculateHash(content));
	if (calculatedHash !== id) {
		console.error("Hash mismatch: possible message tampering");
		return false;
	}
	return await verifySignature(publickey, signature, content, calculateHash);
}
