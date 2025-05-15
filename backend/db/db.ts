import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

export const getDB = (publickey: string) => {
  const sqlite = new Database(`./db/repository/${publickey}.db`);
  const db = drizzle(sqlite);

  migrate(db, { migrationsFolder: "./drizzle" });
  return db;
};
