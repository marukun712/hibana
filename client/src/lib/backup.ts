import { unknownEventSchema, type unknownSchemaType } from "@hibana/schema";
import z from "zod";

export interface BackupFile {
  name: string;
}

export async function createBackup(): Promise<void> {
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

export async function listBackups(): Promise<BackupFile[]> {
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const backupDir = await opfsRoot.getDirectoryHandle("backups", {
      create: true,
    });

    const backups: BackupFile[] = [];
    for await (const [name, handle] of backupDir.entries()) {
      if (handle.kind === "file" && name.endsWith(".json")) {
        backups.push({ name });
      }
    }

    return backups;
  } catch (error) {
    console.error("バックアップ一覧の取得に失敗:", error);
    return [];
  }
}

export async function deleteBackup(filename: string): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();
  const backupDir = await opfsRoot.getDirectoryHandle("backups", {
    create: true,
  });
  await backupDir.removeEntry(filename);
}

export async function getBackupData(
  filename: string,
): Promise<unknownSchemaType[]> {
  const opfsRoot = await navigator.storage.getDirectory();
  const backupDir = await opfsRoot.getDirectoryHandle("backups", {
    create: true,
  });

  const fileHandle = await backupDir.getFileHandle(filename);
  const file = await fileHandle.getFile();
  const text = await file.text();

  const json = JSON.parse(text);
  const parsed = z.array(unknownEventSchema).safeParse(json);
  if (!parsed.success) {
    throw new Error("リポジトリデータのスキーマが不正です。");
  }

  return parsed.data;
}
