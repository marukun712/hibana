import { unknownEventSchema, type unknownSchemaType } from "@hibana/schema";
import { z } from "zod";

async function executeMigration(data: unknownSchemaType[]): Promise<void> {}

export async function fromBackup(
	backupFilename: string,
	getBackupData: (filename: string) => Promise<unknownSchemaType[]>,
): Promise<void> {
	const backupData = await getBackupData(backupFilename);
	await executeMigration(backupData);
}

export async function fromLatest(
	getLatestRepositoryData: () => Promise<unknownSchemaType[]>,
): Promise<void> {
	const latestData = await getLatestRepositoryData();
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
