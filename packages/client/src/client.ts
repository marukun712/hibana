import { BackupAPI } from "./backup";
import { EventsAPI } from "./events";
import { MigrationAPI } from "./migration";
import { UsersAPI } from "./users";

export class HibanaClient {
	public users: UsersAPI;
	public event: EventsAPI;
	public backup: BackupAPI;
	public migration: MigrationAPI;

	constructor() {
		this.users = new UsersAPI();

		// getCurrentUserをバインド
		const getCurrentUser = this.users.getCurrentUser.bind(this.users);

		this.event = new EventsAPI(getCurrentUser);
		this.backup = new BackupAPI();
		this.migration = new MigrationAPI();
	}
}
