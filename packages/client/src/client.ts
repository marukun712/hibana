import { EventsAPI } from "./events";
import { FeedAPI } from "./feed/feed";
import { ProfileAPI } from "./users";

export class HibanaClient {
	public event: EventsAPI;
	public feed: FeedAPI;
	public profile: ProfileAPI;

	constructor(repository: string, publickey: string) {
		this.event = new EventsAPI(repository, publickey);
		this.feed = new FeedAPI(repository, publickey);
		this.profile = new ProfileAPI(repository, publickey);
	}
}
