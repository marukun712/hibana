import { Hono } from "hono";
import { validator } from "hono/validator";
import { cors } from "hono/cors";
import {
  getAllDocument,
  getEvent,
  putEvent,
  searchDocument,
} from "./lib/events/index.ts";
import { serve } from "@hono/node-server";
import { findProfileDoc, updateUser } from "./lib/user/index.ts";
import { getRecord } from "./db/index.ts";
import { createFeed } from "./lib/feed/index.ts";
import {
  eventQuerySchema,
  feedSchema,
  getSchema,
  profileQuerySchema,
} from "./schema/Query.ts";
import { profileSchema } from "./schema/Profile.ts";
import { EventSchema, type eventType } from "./schema/Event.ts";

const app = new Hono();

// リレーからの要求に対してリポジトリのレコードを返す
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
    const { publickey, event, target } = c.req.valid("query");

    //クエリを構築
    const query: Record<string, string> = {};
    if (publickey) {
      query.publickey = publickey;
    }
    if (event) {
      query.event = event;
    }
    if (target) {
      query.target = target;
    }

    try {
      const documents =
        publickey || event
          ? await searchDocument(query)
          : await getAllDocument();

      //eventをfeedにして返す
      if (documents) {
        const feed = await createFeed(documents);

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
        const record = await getEvent(id);

        if (record) {
          return c.json(record);
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
      const parsed = EventSchema.safeParse(value);
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
