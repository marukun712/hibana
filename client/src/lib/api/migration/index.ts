import { hc } from "hono/client";
import { z } from "zod";
import type { migrateRouteType } from "../../../../backend";
import { eventSchema, type eventType } from "../../../../backend/schema/Event";
import { CryptoUtils } from "../../../../utils/crypto";
import { getBackupData, getLatestRepositoryData } from "../backup";
import { calculateHash } from "../hash";

export const migrateFromBackup = async (
	backupFilename: string,
	repositoryUrl: string,
): Promise<void> => {
	const backupData = await getBackupData(backupFilename);
	await executeMigration(backupData, repositoryUrl);
};

export const migrateFromLatest = async (
	repositoryUrl: string,
): Promise<void> => {
	const latestData = await getLatestRepositoryData();
	await executeMigration(latestData, repositoryUrl);
};

export const migrateFromFile = async (
	file: File,
	repositoryUrl: string,
): Promise<void> => {
	const text = await file.text();
	const parsed = z.array(eventSchema).safeParse(JSON.parse(text));
	if (!parsed.success) {
		throw new Error("リポジトリデータのスキーマが不正です。");
	}
	await executeMigration(parsed.data, repositoryUrl);
};

const executeMigration = async (
	data: eventType[],
	repositoryUrl: string,
): Promise<void> => {
	const client = hc<migrateRouteType>(repositoryUrl);
	const timestamp = new Date().toISOString();
	const crypto = new CryptoUtils(calculateHash);
	const migrateMessage = {
		url: repositoryUrl,
		body: data,
	};
	const secureMessage = await crypto.createSecureMessage(
		"event.migrate",
		timestamp,
		migrateMessage,
	);
	if (!secureMessage) {
		throw new Error("メッセージの作成に失敗しました");
	}
	const response = await client.migrate.$post({ json: secureMessage });
	if (!response.ok) {
		throw new Error(`マイグレーションに失敗しました。`);
	}
};
