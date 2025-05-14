import { Hono } from "hono";

const app = new Hono();
app.get("/post", (c) => {
  const json = c.req.parseBody();

  return c.body("");
});

export default app;
