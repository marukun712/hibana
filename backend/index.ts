import { Hono } from "hono";
import { validator } from "hono/validator";
import { events, eventSchema, type defaultEvent } from "./db/schema";
import { getDB } from "./db/db";
import { cors } from "hono/cors";
import { Crypto } from "../utils/crypto";
import { calculateHash } from "./lib/hash";
import { z } from "zod";
import { eq } from "drizzle-orm";

const app = new Hono();

const getSchema = z.object({
  publickey: z.string(),
  id: z.string(),
});

app.use("/post", cors());
const postRoute = app.post(
  "/post",
  validator("json", (value, c) => {
    const parsed = eventSchema.safeParse(value);
    if (!parsed.success) {
      return c.text("Invalid Schema.", 400);
    }

    return parsed.data;
  }),
  async (c) => {
    const json = c.req.valid("json");

    console.log(json);

    try {
      const crypto = new Crypto(calculateHash);

      const verify = await crypto.verifySecureMessage(json);

      if (verify) {
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

    console.log(json);

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
      return c.text("Get failed.", 500);
    }
  }
);

export type postType = typeof postRoute;
export type getPostType = typeof getPostRoute;

export default {
  port: 8000,
  fetch: app.fetch,
};
