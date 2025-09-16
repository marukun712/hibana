import Database from "better-sqlite3";
import {
	type BetterSQLite3Database,
	drizzle,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export const getDB = (publickey: string) => {
	//パストラバーサルできるかもしれないので気を付ける

	const sqlite = new Database(`./repository/${publickey}.hibana`);
	const db: BetterSQLite3Database = drizzle(sqlite);

	migrate(db, { migrationsFolder: "./drizzle" });
	return db;
};
