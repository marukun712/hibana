import type { rawDocument } from "@hibana/schema/Document";
import { getDoc } from "../docs/index.ts";

export const createFeed = async (docs: rawDocument[]) => {
	console.log(docs);
	const feed = await Promise.all(
		docs.map(async (doc) => {
			const record = await getDoc(doc.value._id);
			return record;
		}),
	);
	return feed.filter((doc) => doc !== null && doc !== undefined);
};
