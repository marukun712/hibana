import { HibanaClient } from "@hibana/client";
import type { eventType } from "@hibana/schema";
import type { profileType } from "@hibana/schema/Profile";

export const getCurrentUser = async () => {
	try {
		if (!window.nostr) {
			throw new Error(
				"Nostr extension is not available. Please install a Nostr browser extension.",
			);
		}
		const client = new HibanaClient("http://localhost:8000", "");
		const publickey = await window.nostr.getPublicKey();
		const user = await client.profile.get(publickey);
		return user;
	} catch (error) {
		console.error("Failed to get current user:", error);
		throw error;
	}
};

export const client = async () => {
	try {
		const user = await getCurrentUser();
		return new HibanaClient(user.repository, user.publickey);
	} catch (error) {
		console.error("Failed to create client:", error);
		throw error;
	}
};

export type PostEvent = eventType<"event.post", { content: string }> & {
	user: profileType;
};

export type ReplyEvent = eventType<
	"event.reply",
	{ target: string; content: string }
> & {
	user: profileType;
	target?: PostEvent;
};

export type RepostEvent = eventType<"event.repost", { target: string }> & {
	user: profileType;
	target?: PostEvent;
};

export type QuoteRepostEvent = eventType<
	"event.quote_repost",
	{ target: string; content: string }
> & {
	user: profileType;
	target?: PostEvent;
};

export type FeedItem = PostEvent | ReplyEvent | RepostEvent | QuoteRepostEvent;

export const isPostEvent = (item: FeedItem): item is PostEvent => {
	return item.event === "event.post";
};

export const isReplyEvent = (item: FeedItem): item is ReplyEvent => {
	return item.event === "event.reply";
};

export const isRepostEvent = (item: FeedItem): item is RepostEvent => {
	return item.event === "event.repost";
};

export const isQuoteRepostEvent = (
	item: FeedItem,
): item is QuoteRepostEvent => {
	return item.event === "event.quote_repost";
};
