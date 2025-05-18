import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

export const getDB = (publickey: string) => {
  //パストラバーサルできるかもしれないので気を付ける

  const sqlite = new Database(`./repository/${publickey}.db`);
  const db: BetterSQLite3Database = drizzle(sqlite);

  migrate(db, { migrationsFolder: "./drizzle" });
  return db;
};
