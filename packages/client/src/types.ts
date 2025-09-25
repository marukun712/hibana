import type { feedReturnType, profileType } from "@hibana/schema";

export type PostEvent = feedReturnType<"event.post", { content: string }>;
export type ReplyEvent = feedReturnType<
	"event.reply",
	{ target: string; content: string },
	PostEvent & { user: profileType }
>;
export type RepostEvent = feedReturnType<
	"event.repost",
	{ target: string },
	PostEvent & { user: profileType }
>;
export type QuoteRepostEvent = feedReturnType<
	"event.quote_repost",
	{ target: string; content: string },
	PostEvent & { user: profileType }
>;
export type FollowEvent = feedReturnType<
	"event.follow",
	{ target: string },
	profileType
>;
export type PinEvent = feedReturnType<
	"event.pin",
	{ target: string },
	profileType
>;
