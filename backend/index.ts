import { Hono } from "hono";
import { validator } from "hono/validator";
import { events, eventSchema, type defaultEvent } from "./db/schema.ts";
import { getDB } from "./db/db.ts";
import { cors } from "hono/cors";
import { Crypto } from "../utils/crypto.ts";
import { calculateHash } from "./lib/hash.ts";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { documentSchema, type documentType } from "./lib/ipfs/db.ts";
import {
  getAllDocument,
  searchDocument,
  writeDocument,
} from "./lib/ipfs/events/index.ts";
import { serve } from "@hono/node-server";
import { hc } from "hono/client";
import { getProfileDoc, updateUser } from "./lib/ipfs/user/index.ts";
import { profileSchema } from "./lib/ipfs/helia.ts";

const app = new Hono();

const getSchema = z.object({
  publickey: z.string(),
  id: z.string(),
});

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

    try {
      const db = getDB(json.publickey);
      const data = await db.select().from(events).where(eq(events.id, json.id));

      const post = data[0];

      if (post) {
        const crypto = new Crypto(calculateHash);
        const verify = await crypto.verifySecureMessage(post as defaultEvent);

        if (verify) {
          return c.json(post);
        } else {
          return c.text("Verify failed.", 400);
        }
      } else {
        return c.text("Post is not found.", 400);
      }
    } catch (e) {
      console.log(e);
      return c.text("Fetch failed.", 500);
    }
  }
);

export type getRouteType = typeof getPostRoute;

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
    const { publickey, event } = c.req.valid("query");

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

      if (posts) {
        const feed = await Promise.all(
          posts.map(async (post: { value: documentType }) => {
            const doc = await getProfileDoc(post.value.publickey);
            if (!doc) return null;
            const client = hc<getRouteType>(doc.repository);

            try {
              if (post.value.event == "event.profile") {
                return null;
              }

              const data = await client.get.$get({
                query: { id: post.value._id, publickey: post.value.publickey },
              });

              const json: defaultEvent = await data.json();

              const crypto = new Crypto(calculateHash);
              const verify = await crypto.verifySecureMessage(json);
              if (!verify) {
                return null;
              }

              if (data.status == 200) {
                return { ...json, user: doc };
              } else {
                return null;
              }
            } catch {
              return null;
            }
          })
        );

        return c.json(feed.filter((post) => post !== null));
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

      try {
        const data = await searchDocument({ _id: id });

        const event: documentType = data[0].value;

        if (event) {
          const doc = await getProfileDoc(event.publickey);
          if (!doc) return c.text("User is not found.", 400);
          const client = hc<getRouteType>(doc.repository);

          const data = await client.get.$get({
            query: { id: event._id, publickey: event.publickey },
          });

          if (data.status == 200) {
            const json: defaultEvent = await data.json();

            const crypto = new Crypto(calculateHash);
            const verify = await crypto.verifySecureMessage(json);
            if (!verify) {
              return c.text("Verify failed.", 400);
            }

            return c.json({ ...json, user: doc });
          }
        } else {
          return c.text("Post is not found.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("Fetch failed.", 500);
      }
    }
  )
  .post(
    "/event",
    validator("json", (value, c) => {
      const parsed = eventSchema.safeParse(value);
      if (!parsed.success) {
        return c.text("Invalid Schema.", 400);
      }

      return parsed.data;
    }),
    async (c) => {
      const json = c.req.valid("json");

      try {
        const crypto = new Crypto(calculateHash);
        const verify = await crypto.verifySecureMessage(json);

        if (verify) {
          const document: documentType = {
            _id: json.id,
            event: json.event,
            publickey: json.publickey,
            timestamp: json.timestamp,
          };

          const parsed = documentSchema.safeParse(document);

          if (parsed.success) {
            await writeDocument(parsed.data);
          }

          const db = getDB(json.publickey);
          await db.insert(events).values(json);

          return c.json(json);
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
        const doc = await getProfileDoc(publickey);
        const crypto = new Crypto(calculateHash);
        const verify = await crypto.verifyUserDoc(doc);

        if (verify) {
          return c.json(doc);
        } else {
          return c.text("Verify failed.", 400);
        }
      } catch (e) {
        console.log(e);
        return c.text("Fetch failed.", 500);
      }
    }
  )
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

        if (doc) return c.json(doc);
        else return c.text("Verify failed");
      } catch (e) {
        console.log(e);
        return c.text("Update failed.", 500);
      }
    }
  );

export type profileRouteType = typeof profileRoute;

serve({
  fetch: app.fetch,
  port: 8000,
});
