import { env } from "@backgroundgone/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { handleDodoWebhook } from "./controllers/payments.controller";
import { apiRoutes } from "./routes";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

// Dodo Payments webhook. The dashboard endpoint is configured at `<api>/checkout`,
// so the signed handler is mounted here (also available at /api/webhooks/dodo).
app.post("/checkout", handleDodoWebhook);

app.route("/api", apiRoutes);

export default app;
