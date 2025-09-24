import type { repoRouteType } from "@hibana/repository-server";
import { eventSchema, type eventType } from "@hibana/schema/Event";
import { hc } from "hono/client";
import { z } from "zod";
import { getCurrentUser } from "../users";

export interface BackupFile {
	name: string;
}

export const createBackup = async (): Promise<void> => {
	const user = await getCurrentUser();
	const client = hc<repoRouteType>(user.repository);

	const response = await client.repo.$get({
		query: { publickey: user.publickey },
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
	const fileHandle = await backupDir.getFileHandle(filename, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(JSON.stringify(data, null, 2));
	await writable.close();
};

export const getBackupList = async (): Promise<BackupFile[]> => {
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
};

export const deleteBackup = async (filename: string): Promise<void> => {
	const opfsRoot = await navigator.storage.getDirectory();
	const backupDir = await opfsRoot.getDirectoryHandle("backups", {
		create: true,
	});
	await backupDir.removeEntry(filename);
};

export const getBackupData = async (filename: string): Promise<eventType[]> => {
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
};

export const getLatestRepositoryData = async (): Promise<eventType[]> => {
	const user = await getCurrentUser();
	const client = hc<repoRouteType>(user.repository);
	const response = await client.repo.$get({
		query: { publickey: user.publickey },
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
};
