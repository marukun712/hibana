import { FeedAPI } from "../feed/feed";
import { FollowAPI } from "./follow";
import { PinAPI } from "./pin";
import { PostAPI } from "./post";
import { ReplyAPI } from "./reply";
import { QuoteRepostAPI, RepostAPI } from "./repost";
import { StatusAPI } from "./status";

export class EventsAPI {
	public post: PostAPI;
	public reply: ReplyAPI;
	public repost: RepostAPI;
	public quoteRepost: QuoteRepostAPI;
	public follow: FollowAPI;
	public pin: PinAPI;
	public feed: FeedAPI;
	public status: StatusAPI;

	constructor(repository: string, publickey: string) {
		this.post = new PostAPI(repository, publickey);
		this.reply = new ReplyAPI(repository, publickey);
		this.repost = new RepostAPI(repository, publickey);
		this.quoteRepost = new QuoteRepostAPI(repository, publickey);
		this.follow = new FollowAPI(repository, publickey);
		this.pin = new PinAPI(repository, publickey);
		this.feed = new FeedAPI(repository, publickey);
		this.status = new StatusAPI(repository, publickey);
	}
}
