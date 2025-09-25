import { HibanaClient } from "@hibana/client";
import { unknownEventSchema, type unknownSchemaType } from "@hibana/schema";
import { z } from "zod";
import { getBackupData } from "./backup";

async function executeMigration(_data: unknownSchemaType[]): Promise<void> {}

export async function fromBackup(backupFilename: string): Promise<void> {
	const backupData = await getBackupData(backupFilename);
	await executeMigration(backupData);
}

export async function fromLatest(
	repository: string,
	publickey: string,
): Promise<void> {
	const client = new HibanaClient(repository, publickey);
	const latestData = await client.repo.get();
	await executeMigration(latestData);
}

export async function fromFile(file: File): Promise<void> {
	const text = await file.text();
	const parsed = z.array(unknownEventSchema).safeParse(JSON.parse(text));
	if (!parsed.success) {
		throw new Error("リポジトリデータのスキーマが不正です。");
	}
	await executeMigration(parsed.data);
}
