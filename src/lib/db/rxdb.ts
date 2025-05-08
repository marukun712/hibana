import { addRxPlugin, createRxDatabase } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageLocalstorage } from "rxdb/plugins/storage-localstorage";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import type { RxDocument } from "rxdb";
import {
  createSecureMessage,
  getOrCreateClientKeyPair,
  verifySecureMessage,
} from "../security";

addRxPlugin(RxDBDevModePlugin);

interface PostDocument {
  id: string;
  text: string;
  timestamp: string;
}

// クライアントキーペアの取得
const keyPair = getOrCreateClientKeyPair();

export const db = await createRxDatabase({
  name: "sns",
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage(),
  }),
});

// コレクションの定義
await db.addCollections({
  posts: {
    schema: {
      version: 0,
      primaryKey: "id",
      type: "object",
      properties: {
        id: {
          type: "string",
          maxLength: 64,
        },
        text: {
          type: "string",
        },
        timestamp: {
          type: "string",
        },
      },
      required: ["id", "text", "timestamp"],
    },
  },
});

// WebSocket接続の確立
const socket = new WebSocket("ws://localhost:3001/sync");

// セキュアな同期処理の実装
const sync = {
  async pull() {
    const secureMessage = await createSecureMessage(
      "pull",
      {},
      keyPair.privateKey
    );
    socket.send(JSON.stringify(secureMessage));
  },

  async push(docs: PostDocument[]) {
    const secureMessage = await createSecureMessage(
      "push",
      { docs },
      keyPair.privateKey
    );
    socket.send(JSON.stringify(secureMessage));
  },
};

// メッセージハンドラーの設定
socket.onmessage = async (event) => {
  try {
    const secureMessage = JSON.parse(event.data);

    // サーバーの公開鍵を使用してメッセージを検証
    // TODO: サーバーの公開鍵は適切な方法で取得する必要があります
    const isValid = await verifySecureMessage(secureMessage, keyPair.publicKey);

    if (!isValid) {
      console.error("Invalid or tampered message received");
      return;
    }

    switch (secureMessage.type) {
      case "pull-response":
        if (secureMessage.payload.docs) {
          await Promise.all(
            secureMessage.payload.docs.map((doc: PostDocument) =>
              db.posts.upsert(doc)
            )
          );
        }
        break;

      case "push-response":
        console.log("Push successful:", secureMessage.payload.success);
        break;

      case "error":
        console.error("Server error:", secureMessage.payload.message);
        break;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing message:", error.message);
    }
  }
};

// 変更の監視と同期
let lastSync = Date.now();

db.posts.$.subscribe(async (change) => {
  if (socket.readyState === WebSocket.OPEN && Date.now() - lastSync > 1000) {
    // 1秒以内の頻繁な同期を防ぐ
    lastSync = Date.now();

    // 全データを取得してプッシュ
    const allDocs = await db.posts.find().exec();
    const docsToSync = allDocs.map((doc) => doc.toJSON());

    if (docsToSync.length > 0) {
      await sync.push(docsToSync);
    }

    // 最新データをプル
    await sync.pull();
  }
});

// 接続状態の監視
socket.onopen = () => console.log("Connected to sync server");
socket.onclose = () => console.log("Disconnected from sync server");
socket.onerror = (error) => console.error("WebSocket error:", error);
