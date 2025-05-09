import { addRxPlugin, createRxDatabase } from "rxdb";
import { replicateServer } from "rxdb-server/plugins/replication-server";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageLocalstorage } from "rxdb/plugins/storage-localstorage";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

addRxPlugin(RxDBDevModePlugin);

export const db = await createRxDatabase({
  name: "sns",
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage(),
  }),
});

export const collections = await db.addCollections({
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

const replicationState = await replicateServer({
  collection: collections.posts,
  replicationIdentifier: "sns",
  url: "http://localhost:8000/sync/0",
  push: {},
  pull: {},
  live: true,
});
