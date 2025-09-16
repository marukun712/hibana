import { CID } from "kubo-rpc-client";

export const isCID = (cid: string) => {
	try {
		CID.parse(cid);
		return true;
	} catch {
		return false;
	}
};
