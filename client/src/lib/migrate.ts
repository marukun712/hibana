import { HibanaClient } from "@hibana/client";
import {
	baseEventSchema,
	type baseSchemaType,
	type profileType,
} from "@hibana/schema";
import { z } from "zod";
import { getBackupData } from "./backup";

async function executeMigration(
	repository: string,
	profile: profileType,
	data: baseSchemaType[],
): Promise<void> {
	const client = new HibanaClient(repository);
	await client.migrate.post({ repository, profile, body: data });
}

export async function fromBackup(
	repository: string,
	profile: profileType,
	backupFilename: string,
): Promise<void> {
	const backupData = await getBackupData(backupFilename);
	await executeMigration(repository, profile, backupData);
}

export async function fromLatest(
	repository: string,
	profile: profileType,
): Promise<void> {
	const client = new HibanaClient(profile.repository);
	const latestData = await client.repo.get({ publickey: profile.publickey });
	await executeMigration(repository, profile, latestData);
}

export async function fromFile(
	repository: string,
	profile: profileType,
	file: File,
): Promise<void> {
	const text = await file.text();
	const parsed = z.array(baseEventSchema).safeParse(JSON.parse(text));
	if (!parsed.success) {
		throw new Error("リポジトリデータのスキーマが不正です。");
	}
	await executeMigration(repository, profile, parsed.data);
}
