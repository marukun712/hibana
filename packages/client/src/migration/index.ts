import type { migrateRouteType } from "@hibana/repository-server";
import { eventSchema, type eventType } from "@hibana/schema/Event";
import { CryptoUtils } from "@hibana/utils/crypto";
import { hc } from "hono/client";
import { z } from "zod";
import { calculateHash } from "../hash";

export class MigrationAPI {
	async fromBackup(
		backupFilename: string,
		repositoryUrl: string,
		getBackupData: (filename: string) => Promise<eventType[]>,
	): Promise<void> {
		const backupData = await getBackupData(backupFilename);
		await this.executeMigration(backupData, repositoryUrl);
	}

	async fromLatest(
		repositoryUrl: string,
		getLatestRepositoryData: () => Promise<eventType[]>,
	): Promise<void> {
		const latestData = await getLatestRepositoryData();
		await this.executeMigration(latestData, repositoryUrl);
	}

	async fromFile(file: File, repositoryUrl: string): Promise<void> {
		const text = await file.text();
		const parsed = z.array(eventSchema).safeParse(JSON.parse(text));
		if (!parsed.success) {
			throw new Error("リポジトリデータのスキーマが不正です。");
		}
		await this.executeMigration(parsed.data, repositoryUrl);
	}

	private async executeMigration(
		data: eventType[],
		repositoryUrl: string,
	): Promise<void> {
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
	}
}
