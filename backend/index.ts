import { createRxServer } from "rxdb-server/plugins/server";
import { RxServerAdapterExpress } from "rxdb-server/plugins/adapter-express";
import { createRxDatabase } from "rxdb";
import { getRxStorageMongoDB } from "rxdb/plugins/storage-mongodb";

const db = await createRxDatabase({
  name: "sns",
  storage: getRxStorageMongoDB({
    connection: process.env.DATABASE_URL ?? "",
  }),
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
        publicKey: { type: "string" },
        timestamp: {
          type: "string",
        },
        signature: {
          type: "string",
        },
      },
      required: ["id", "text", "publicKey", "timestamp", "signature"],
    },
  },
});

const server = await createRxServer({
  database: db,
  adapter: RxServerAdapterExpress,
  port: 8000,
  cors: "*",
});

server.addReplicationEndpoint({
  name: "sync",
  collection: collections.posts,
});

await server.start();
