import type { eventReturnType } from "@hibana/schema";

export type PostEvent = eventReturnType<"event.post", { content: string }>;
export type ReplyEvent = eventReturnType<
	"event.reply",
	{ target: string; content: string }
>;
export type RepostEvent = eventReturnType<"event.repost", { target: string }>;
export type QuoteRepostEvent = eventReturnType<
	"event.quote_repost",
	{ target: string; content: string }
>;
export type FollowEvent = eventReturnType<"event.follow", { target: string }>;
export type PinEvent = eventReturnType<"event.pin", { target: string }>;
