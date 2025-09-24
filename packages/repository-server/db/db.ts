import path from "node:path";
import Database from "better-sqlite3";
import {
	type BetterSQLite3Database,
	drizzle,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export const getDB = (publickey: string) => {
	const dbName = path.basename(`./repository/${publickey}.hibana`);
	const sqlite = new Database(`./repository/${dbName}`);
	const db: BetterSQLite3Database = drizzle(sqlite);
	migrate(db, { migrationsFolder: "./drizzle" });
	return db;
};
