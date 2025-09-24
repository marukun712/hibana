export const calculateHash = async (content: string): Promise<Uint8Array> => {
	const hash = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(content),
	);

	return new Uint8Array(hash);
};
