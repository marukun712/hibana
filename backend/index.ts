import { createRxDatabase } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { WebSocket, WebSocketServer } from "ws";
import {
  calculateHash,
  generateKeyPair,
  verifySecureMessage,
  createSecureMessage,
} from "../src/lib/security";

interface PostDocument {
  id: string;
  text: string;
  timestamp: string;
}

// サーバーのキーペアを生成
const serverKeyPair = generateKeyPair();

const db = await createRxDatabase({
  name: "sns-server",
  storage: getRxStorageMemory(),
});

const collections = await db.addCollections({
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

// WebSocketサーバーの作成
const wsServer = new WebSocketServer({
  port: 3001,
  path: "/sync",
});

// クライアントからの接続を処理
wsServer.on("connection", async (socket: WebSocket) => {
  console.log("Client connected");

  // クライアントに公開鍵を送信
  const keyMessage = await createSecureMessage(
    "server-key",
    {
      publicKey: Array.from(serverKeyPair.publicKey),
    },
    serverKeyPair.privateKey
  );
  socket.send(JSON.stringify(keyMessage));

  // メッセージの処理
  socket.on("message", async (data: Buffer) => {
    try {
      const secureMessage = JSON.parse(data.toString());

      // クライアントの公開鍵でメッセージを検証
      // TODO: クライアントの公開鍵は最初の接続時に交換する必要があります
      const isValid = await verifySecureMessage(
        secureMessage,
        serverKeyPair.publicKey
      );

      if (!isValid) {
        console.error("Invalid or tampered message received");
        const errorMessage = await createSecureMessage(
          "error",
          {
            message: "Invalid signature",
          },
          serverKeyPair.privateKey
        );
        socket.send(JSON.stringify(errorMessage));
        return;
      }

      switch (secureMessage.type) {
        case "pull":
          // 最新のデータを送信
          const docs = await collections.posts.find().exec();
          const response = await createSecureMessage(
            "pull-response",
            {
              docs: docs.map((d) => d.toJSON()),
            },
            serverKeyPair.privateKey
          );
          socket.send(JSON.stringify(response));
          break;

        case "push":
          // クライアントからのデータを保存
          if (Array.isArray(secureMessage.payload.docs)) {
            await Promise.all(
              secureMessage.payload.docs.map((doc: PostDocument) =>
                collections.posts.upsert(doc)
              )
            );
            const successMessage = await createSecureMessage(
              "push-response",
              {
                success: true,
              },
              serverKeyPair.privateKey
            );
            socket.send(JSON.stringify(successMessage));
          }
          break;

        default:
          throw new Error("Unknown message type");
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = await createSecureMessage(
        "error",
        {
          message: error instanceof Error ? error.message : "Unknown error",
        },
        serverKeyPair.privateKey
      );
      socket.send(JSON.stringify(errorMessage));
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("✅ WebSocket server started on ws://localhost:3001/sync");
