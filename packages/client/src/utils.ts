import type { baseSchemaType } from "@hibana/schema";
import type {
	FollowEvent,
	PinEvent,
	PostEvent,
	QuoteRepostEvent,
	ReplyEvent,
	RepostEvent,
} from "./types";

export const isPostEvent = (item: baseSchemaType): item is PostEvent =>
	item.event === "event.post";

export const isReplyEvent = (item: baseSchemaType): item is ReplyEvent =>
	item.event === "event.reply";

export const isRepostEvent = (item: baseSchemaType): item is RepostEvent =>
	item.event === "event.repost";

export const isQuoteRepostEvent = (
	item: baseSchemaType,
): item is QuoteRepostEvent => item.event === "event.quote_repost";

export const isFollowEvent = (item: baseSchemaType): item is FollowEvent =>
	item.event === "event.follow";

export const isPinEvent = (item: baseSchemaType): item is PinEvent =>
	item.event === "event.pin";
