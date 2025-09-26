import { EventsAPI } from "./events";
import { FeedAPI } from "./feed/feed";
import { MigrateAPI } from "./migrate";
import { RepositoryAPI } from "./repo";
import { ProfileAPI } from "./users";

export class HibanaClient {
	public event: EventsAPI;
	public feed: FeedAPI;
	public profile: ProfileAPI;
	public repo: RepositoryAPI;
	public migrate: MigrateAPI;

	constructor(repository: string) {
		this.event = new EventsAPI(repository);
		this.feed = new FeedAPI(repository);
		this.profile = new ProfileAPI(repository);
		this.repo = new RepositoryAPI(repository);
		this.migrate = new MigrateAPI();
	}
}
