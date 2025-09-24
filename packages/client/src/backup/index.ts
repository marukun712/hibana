import type { repoRouteType } from "@hibana/repository-server";
import { eventSchema, type eventType } from "@hibana/schema/Event";
import { hc } from "hono/client";
import { z } from "zod";

export interface BackupFile {
	name: string;
}

export class BackupAPI {
	async create(repository: string, publickey: string): Promise<void> {
		const client = hc<repoRouteType>(repository);

		const response = await client.repo.$get({
			query: { publickey: publickey },
		});
		if (!response.ok) {
			throw new Error("リポジトリデータの取得に失敗しました");
		}
		const data = await response.json();
		const opfsRoot = await navigator.storage.getDirectory();
		const backupDir = await opfsRoot.getDirectoryHandle("backups", {
			create: true,
		});
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `backup-${timestamp}.json`;
		const fileHandle = await backupDir.getFileHandle(filename, {
			create: true,
		});
		const writable = await fileHandle.createWritable();
		await writable.write(JSON.stringify(data, null, 2));
		await writable.close();
	}

	async list(): Promise<BackupFile[]> {
		try {
			const opfsRoot = await navigator.storage.getDirectory();
			const backupDir = await opfsRoot.getDirectoryHandle("backups", {
				create: true,
			});
			const backups: BackupFile[] = [];
			for await (const [name, handle] of backupDir.entries()) {
				if (handle.kind === "file" && name.endsWith(".json")) {
					backups.push({
						name: name,
					});
				}
			}
			return backups || [];
		} catch (error) {
			console.error("バックアップ一覧の取得に失敗:", error);
			return [];
		}
	}

	async delete(filename: string): Promise<void> {
		const opfsRoot = await navigator.storage.getDirectory();
		const backupDir = await opfsRoot.getDirectoryHandle("backups", {
			create: true,
		});
		await backupDir.removeEntry(filename);
	}

	async getData(filename: string): Promise<eventType[]> {
		const opfsRoot = await navigator.storage.getDirectory();
		const backupDir = await opfsRoot.getDirectoryHandle("backups", {
			create: true,
		});

		const fileHandle = await backupDir.getFileHandle(filename);
		const file = await fileHandle.getFile();
		const text = await file.text();

		const json = JSON.parse(text);
		const parsed = z.array(eventSchema).safeParse(json);
		if (!parsed.success) {
			throw new Error("リポジトリデータのスキーマが不正です。");
		}
		return parsed.data;
	}

	async getLatestRepositoryData(
		repository: string,
		publickey: string,
	): Promise<eventType[]> {
		const client = hc<repoRouteType>(repository);
		const response = await client.repo.$get({
			query: { publickey: publickey },
		});
		if (!response.ok) {
			throw new Error("リポジトリデータの取得に失敗しました");
		}
		const json = await response.json();
		const parsed = z.array(eventSchema).safeParse(json);
		if (!parsed.success) {
			throw new Error("リポジトリデータのスキーマが不正です。");
		}
		return parsed.data;
	}
}
