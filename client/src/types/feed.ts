import type { profileType } from "@hibana/schema/Profile";

export interface PostData {
	id: string;
	message: {
		content: string;
	};
	timestamp: string;
	user: profileType;
}

export interface BaseEvent {
	id: string;
	publickey: string;
	signature: string;
	timestamp: string;
	message: { [key: string]: unknown };
	user: profileType;
	target: PostData | profileType | null;
}

export interface PostEvent extends BaseEvent {
	event: "event.post";
	message: {
		content: string;
	};
	target: null;
}

export interface ReplyEvent extends BaseEvent {
	event: "event.reply";
	message: {
		content: string;
	};
	target: PostData;
}

export interface RepostEvent extends BaseEvent {
	event: "event.repost";
	target: PostData;
}

export interface QuoteRepostEvent extends BaseEvent {
	event: "event.quote_repost";
	message: {
		content: string;
	};
	target: PostData;
}

export type FeedItem = PostEvent | ReplyEvent | RepostEvent | QuoteRepostEvent;
export type FeedItems = FeedItem[];

export function isPostEvent(item: FeedItem): item is PostEvent {
	return (
		item.event === "event.post" &&
		item.message &&
		typeof item.message === "object" &&
		"content" in item.message &&
		typeof item.message.content === "string"
	);
}

export function isReplyEvent(item: FeedItem): item is ReplyEvent {
	return (
		item.event === "event.reply" &&
		item.message &&
		typeof item.message === "object" &&
		"content" in item.message &&
		typeof item.message.content === "string" &&
		item.target !== null &&
		typeof item.target === "object"
	);
}

export function isRepostEvent(item: FeedItem): item is RepostEvent {
	return (
		item.event === "event.repost" &&
		item.target !== null &&
		typeof item.target === "object"
	);
}

export function isQuoteRepostEvent(item: FeedItem): item is QuoteRepostEvent {
	return (
		item.event === "event.quote_repost" &&
		item.message &&
		typeof item.message === "object" &&
		"content" in item.message &&
		typeof item.message.content === "string" &&
		item.target !== null &&
		typeof item.target === "object"
	);
}
