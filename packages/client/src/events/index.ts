import type { profileType } from "@hibana/schema/Profile";
import { FeedAPI } from "./feed";
import { FollowAPI } from "./follow";
import { PinAPI } from "./pin";
import { PostAPI } from "./post";
import { ReplyAPI } from "./reply";
import { QuoteRepostAPI, RepostAPI } from "./repost";
import { StatusAPI } from "./status";

export class EventsAPI {
	public post = new PostAPI();
	public reply = new ReplyAPI();
	public repost = new RepostAPI();
	public quoteRepost = new QuoteRepostAPI();
	public follow = new FollowAPI();
	public pin = new PinAPI();
	public feed: FeedAPI;
	public status: StatusAPI;

	constructor(getCurrentUser: () => Promise<profileType>) {
		this.feed = new FeedAPI(getCurrentUser);
		this.status = new StatusAPI(getCurrentUser);
	}
}
