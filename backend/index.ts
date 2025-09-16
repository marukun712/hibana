import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validator } from "hono/validator";
import { getEvent } from "./db/index.ts";
import {
	deleteDoc,
	getAllDocs,
	getDoc,
	putDoc,
	searchDocs,
} from "./lib/docs/index.ts";
import { createFeed } from "./lib/feed/index.ts";
import { findProfileDoc, updateUser } from "./lib/user/index.ts";
import { eventSchema } from "./schema/Event.ts";
import { profileSchema } from "./schema/Profile.ts";
import {
	deleteRequestSchema,
	eventRequestSchema,
	feedRequestSchema,
	getRequestSchema,
	profileRequestSchema,
} from "./schema/Query.ts";

const app = new Hono();

app.use(logger());
//イベント解決用エンドポイント
app.use("/get", cors());
const getPostRoute = app.get(
	"/get",
	validator("query", (value, c) => {
		const parsed = getRequestSchema.safeParse(value);
		if (!parsed.success) {
			return c.json({ error: "Invalid Schema." }, 400);
		}

		return parsed.data;
	}),
	async (c) => {
		const json = c.req.valid("query");

		//ユーザーリポジトリからデータを取得
		try {
			const record = await getEvent(json);

			return c.json(record);
		} catch (e) {
			console.log(e);
			return c.json({ error: "An error has occurred." }, 500);
		}
	},
);
export type getRouteType = typeof getPostRoute;

// イベントをfeedとして返す
app.use("/feed", cors());
const feedRoute = app.get(
	"/feed",
	validator("query", (value, c) => {
		const parsed = feedRequestSchema.safeParse(value);
		if (!parsed.success) {
			return c.json({ error: "Invalid Schema." }, 400);
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
				publickey || event ? await searchDocs(query) : await getAllDocs();

			//eventをfeedにして返す
			if (documents) {
				const feed = await createFeed(documents);

				return c.json(feed);
			} else {
				return c.json({ error: "Document is not found." }, 400);
			}
		} catch (e) {
			console.log(e);
			return c.json({ error: "An error has occurred." }, 500);
		}
	},
);
export type feedRouteType = typeof feedRoute;

//特定のeventを返す
app.use("/event", cors());
const eventRoute = app
	.get(
		"/event",
		validator("query", (value, c) => {
			const parsed = eventRequestSchema.safeParse(value);
			if (!parsed.success) {
				return c.json({ error: "Invalid Schema." }, 400);
			}

			return parsed.data;
		}),
		async (c) => {
			const { id } = c.req.valid("query");

			//eventを検索
			try {
				const record = await getDoc(id);

				if (record) {
					return c.json(record);
				} else {
					return c.json({ error: "Event is not found." }, 400);
				}
			} catch (e) {
				console.log(e);
				return c.json({ error: "An error has occurred." }, 500);
			}
		},
	)
	//eventを投稿
	.post(
		"/event",
		validator("json", (value, c) => {
			const parsed = eventSchema.safeParse(value);
			if (!parsed.success) {
				return c.json({ error: "Invalid Schema." }, 400);
			}

			return parsed.data;
		}),
		async (c) => {
			const json = c.req.valid("json");

			try {
				const data = await putDoc(json);
				return c.json(data);
			} catch (e) {
				console.log(e);
				return c.json({ error: "An error has occurred." }, 500);
			}
		},
	)
	//eventを削除(repoのみ)
	.delete(
		"/event",
		validator("json", (value, c) => {
			const parsed = deleteRequestSchema.safeParse(value);
			if (!parsed.success) {
				return c.json({ error: "Invalid Schema." }, 400);
			}

			return parsed.data;
		}),
		async (c) => {
			const json = c.req.valid("json");

			//ユーザーリポジトリからデータを取得
			try {
				await deleteDoc(json);
				return c.json({ success: true });
			} catch (e) {
				console.log(e);
				return c.json({ error: "An error has occurred." }, 500);
			}
		},
	);
export type eventRouteType = typeof eventRoute;

//profileの取得
app.use("/profile", cors());
const profileRoute = app
	.get(
		"/profile",
		validator("query", (value, c) => {
			const parsed = profileRequestSchema.safeParse(value);
			if (!parsed.success) {
				return c.json({ error: "Invalid Schema." }, 400);
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
					return c.json({ error: "User is not found." }, 400);
				}
			} catch (e) {
				console.log(e);
				return c.json({ error: "An error has occurred." }, 500);
			}
		},
	)
	//profileの更新
	.post(
		"/profile",
		validator("json", (value, c) => {
			const parsed = profileSchema.safeParse(value);
			if (!parsed.success) {
				return c.json({ error: "Invalid Schema." }, 400);
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
					return c.json({ error: "Verify failed." }, 400);
				}
			} catch (e) {
				console.log(e);
				return c.json({ error: "An error has occurred." }, 500);
			}
		},
	);
export type profileRouteType = typeof profileRoute;

serve({
	fetch: app.fetch,
	port: 8000,
});

console.log("Server listening on port 8000");
