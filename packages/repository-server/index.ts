import {
	baseEventSchema,
	deleteEventSchema,
	eventRequestSchema,
	feedRequestSchema,
	getRequestSchema,
	migrateEventSchema,
	profileRequestSchema,
	profileSchema,
	repoRequestSchema,
} from "@hibana/schema";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validator } from "hono/validator";
import { getAllEvents, getEvent } from "./db/index.ts";
import {
	deleteDoc,
	getAllDocs,
	getDoc,
	putDoc,
	searchDocs,
} from "./lib/docs/index.ts";
import { createFeed } from "./lib/feed/index.ts";
import { migrateRepo } from "./lib/migrate/index.ts";
import { findProfileDoc, updateUser } from "./lib/user/index.ts";

const app = new Hono();
const port = Number(process.env.PORT) || 8080;

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
		const { id, publickey, event, target } = c.req.valid("query");

		//クエリを構築
		const query: Record<string, string> = {};
		if (id) {
			query.id = id;
		}
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
			const parsed = baseEventSchema.safeParse(value);
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
			const parsed = deleteEventSchema.safeParse(value);
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

app.use("/repo", cors());
const repoRoute = app.get(
	"/repo",
	validator("query", (value, c) => {
		const parsed = repoRequestSchema.safeParse(value);
		if (!parsed.success) {
			return c.json({ error: "Invalid Schema." }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const { publickey } = c.req.valid("query");
		try {
			const data = await getAllEvents(publickey);
			return c.json(data);
		} catch (e) {
			console.log(e);
			return c.json({ error: "An error has occurred." }, 500);
		}
	},
);
export type repoRouteType = typeof repoRoute;

app.use("/migrate", cors());
const migrateRoute = app.post(
	"/migrate",
	validator("json", (value, c) => {
		const parsed = migrateEventSchema.safeParse(value);
		if (!parsed.success) {
			return c.json({ error: "Invalid Schema." }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const json = c.req.valid("json");
		try {
			await migrateRepo(json);
			return c.json({ success: true });
		} catch (e) {
			console.log(e);
			return c.json({ error: "An error has occurred." }, 500);
		}
	},
);
export type migrateRouteType = typeof migrateRoute;

serve({
	fetch: app.fetch,
	port: port,
});
console.log(`Server listening on port ${port}`);
