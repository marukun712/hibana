export { HibanaClient } from "./src/client";

export const createClient = () => new HibanaClient();

// 型エクスポート
export type { BackupFile } from "./src/backup";
export { BackupAPI } from "./src/backup";
export { EventsAPI } from "./src/events";
export { MigrationAPI } from "./src/migration";
// 直接アクセス用のエクスポート（後方互換性のため）
export { UsersAPI } from "./src/users";
