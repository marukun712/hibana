import type { unknownSchemaType } from "@hibana/schema";
import type {
	FollowEvent,
	PinEvent,
	PostEvent,
	QuoteRepostEvent,
	ReplyEvent,
	RepostEvent,
} from "./types";

export const isPostEvent = (item: unknownSchemaType): item is PostEvent =>
	item.event === "event.post";

export const isReplyEvent = (item: unknownSchemaType): item is ReplyEvent =>
	item.event === "event.reply";

export const isRepostEvent = (item: unknownSchemaType): item is RepostEvent =>
	item.event === "event.repost";

export const isQuoteRepostEvent = (
	item: unknownSchemaType,
): item is QuoteRepostEvent => item.event === "event.quote_repost";

export const isFollowEvent = (item: unknownSchemaType): item is FollowEvent =>
	item.event === "event.follow";

export const isPinEvent = (item: unknownSchemaType): item is PinEvent =>
	item.event === "event.pin";
