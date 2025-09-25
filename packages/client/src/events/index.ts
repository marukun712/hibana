import { FeedAPI } from "../feed/feed";
import { FollowAPI } from "./follow";
import { PinAPI } from "./pin";
import { PostAPI } from "./post";
import { ReplyAPI } from "./reply";
import { QuoteRepostAPI, RepostAPI } from "./repost";

export class EventsAPI {
	public post: PostAPI;
	public reply: ReplyAPI;
	public repost: RepostAPI;
	public quoteRepost: QuoteRepostAPI;
	public follow: FollowAPI;
	public pin: PinAPI;
	public feed: FeedAPI;

	constructor(repository: string) {
		this.post = new PostAPI(repository);
		this.reply = new ReplyAPI(repository);
		this.repost = new RepostAPI(repository);
		this.quoteRepost = new QuoteRepostAPI(repository);
		this.follow = new FollowAPI(repository);
		this.pin = new PinAPI(repository);
		this.feed = new FeedAPI(repository);
	}
}
