import { defaultEvent } from "../../../@types";

export class UserRepository {
  directory: FileSystemDirectoryHandle | null = null;

  async initialize(publickey: string) {
    const root = await navigator.storage.getDirectory();
    this.directory = await root.getDirectoryHandle(publickey, { create: true });
  }

  async saveMessage(id: string, json: string) {
    if (this.isInitialized()) {
      const messageFile = await this.directory.getFileHandle(`${id}.json`, {
        create: true,
      });
      const writable = await messageFile.createWritable();
      await writable.write(json);
      await writable.close();
    } else {
      throw new Error("Repository not initialized");
    }
  }

  async getAllMessages(): Promise<defaultEvent[]> {
    if (this.isInitialized()) {
      const messages: defaultEvent[] = [];

      for await (const [name] of this.directory.entries()) {
        if (name.endsWith(".json")) {
          const file = await this.directory.getFileHandle(name);
          const text = await (await file.getFile()).text();
          messages.push(JSON.parse(text));
        }
      }

      return messages;
    } else {
      throw new Error("Repository not initialized");
    }
  }

  isInitialized(): this is { directory: FileSystemDirectoryHandle } {
    return this.directory !== null;
  }
}
