import { Hono } from "hono";
import { validator } from "hono/validator";
import { defaultEventSchema } from "./db/schema.ts";
import { cors } from "hono/cors";
import { z } from "zod";
import { type documentType } from "./lib/ipfs/db.ts";
import {
  getAllDocument,
  putEvent,
  resolveRepositoryDocument,
  searchDocument,
} from "./lib/ipfs/events/index.ts";
import { serve } from "@hono/node-server";
import { findProfileDoc, updateUser } from "./lib/ipfs/user/index.ts";
import { profileSchema } from "./lib/ipfs/ipfs.ts";
import { getRecord } from "./db/index.ts";
import { createFeed } from "./lib/ipfs/feed/index.ts";

const app = new Hono();

// リレーからの要求に対してリポジトリのレコードを返す
const getSchema = z.object({
  publickey: z.string(),
  id: z.string(),
});
export type getSchemaType = z.infer<typeof getSchema>;
app.use("/get", cors());
const getPostRoute = app.get(
  "/get",
  validator("query", (value, c) => {
    const parsed = getSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid Schema.", 400);
    }

    return parsed.data;
  }),
  async (c) => {
    const json = c.req.valid("query");

    //ユーザーリポジトリからデータを取得
    try {
      const record = await getRecord(json);

      if (record) {
        return c.json(record);
      } else {
        c.text("Record is not found.", 400);
      }
    } catch (e) {
      console.log(e);
      return c.text("An error has occurred.", 500);
    }
  }
);
export type getRouteType = typeof getPostRoute;

// イベントをfeedとして返す
const feedSchema = z.object({
  publickey: z.string().optional(),
  event: z.string().optional(),
});
app.use("/feed", cors());
const feedRoute = app.get(
  "/feed",
  validator("query", (value, c) => {
    const parsed = feedSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid Schema.", 400);
    }

    return parsed.data;
  }),
  async (c) => {
    //publickey(投稿者)、eventで絞り込み
    const { publickey, event } = c.req.valid("query");

    //クエリを構築
    const query: Record<string, string> = {};
    if (publickey) {
      query.publickey = publickey;
    }
    if (event) {
      query.event = event;
    }

    try {
      console.log(await getAllDocument());

      const posts =
        publickey || event
          ? await searchDocument(query)
          : await getAllDocument();

      //eventをfeedにして返す
      if (posts) {
        const feed = await createFeed(posts);

        return c.json(feed);
      } else {
        return c.text("Event is not found.", 400);
      }
    } catch (e) {
      console.log(e);
      return c.text("Fetch failed.", 500);
    }
  }
);
export type feedRouteType = typeof feedRoute;

//特定のeventを返す
const eventQuerySchema = z.object({
  id: z.string(),
});
app.use("/event", cors());
const eventRoute = app
  .get(
    "/event",
    validator("query", (value, c) => {
      const parsed = eventQuerySchema.safeParse(value);
      if (!parsed.success) {
        return c.text("Invalid Schema.", 400);
      }

      return parsed.data;
    }),
    async (c) => {
      const { id } = c.req.valid("query");

      //eventを検索
      try {
        const data = await searchDocument({ _id: id });

        if (data[0]) {
          const event: documentType = data[0].value;

          //eventを解決
          const record = await resolveRepositoryDocument(event);

          if (record) {
            return c.json(record);
          } else {
            return c.text("Event is not found.", 400);
          }
        } else {
          return c.text("Event is not found.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("Fetch failed.", 500);
      }
    }
  )
  //eventを投稿
  .post(
    "/event",
    validator("json", (value, c) => {
      const parsed = defaultEventSchema.safeParse(value);
      if (!parsed.success) {
        return c.text("Invalid Schema.", 400);
      }

      return parsed.data;
    }),
    async (c) => {
      const json = c.req.valid("json");

      try {
        const data = await putEvent(json);
        if (data) {
          return c.json(data);
        } else {
          return c.text("Verify failed.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("Post failed.", 500);
      }
    }
  );
export type eventRouteType = typeof eventRoute;

//profileの取得
const profileQuerySchema = z.object({
  publickey: z.string(),
});
app.use("/profile", cors());
const profileRoute = app
  .get(
    "/profile",
    validator("query", (value, c) => {
      const parsed = profileQuerySchema.safeParse(value);
      if (!parsed.success) {
        return c.text("Invalid Schema.", 400);
      }

      return parsed.data;
    }),
    async (c) => {
      const { publickey } = c.req.valid("query");

      try {
        //orbitdbからprofileの更新eventを探す
        const doc = await findProfileDoc(publickey);

        if (doc) {
          return c.json(doc);
        } else {
          return c.text("User is not found.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("An error has occurred.", 500);
      }
    }
  )
  //profileの更新
  .post(
    "/profile",
    validator("json", (value, c) => {
      const parsed = profileSchema.safeParse(value);
      if (!parsed.success) {
        return c.text("Invalid Schema.", 400);
      }

      return parsed.data;
    }),
    async (c) => {
      const json = c.req.valid("json");

      try {
        const doc = await updateUser(json);
        if (doc) {
          return c.json(doc);
        } else {
          return c.text("Verify failed.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("An error has occurred.", 500);
      }
    }
  );
export type profileRouteType = typeof profileRoute;

serve({
  fetch: app.fetch,
  port: 8000,
});
