import { Hono } from "hono";

import { waitlistRoute } from "./waitlist.route";

/**
 * Aggregates all API sub-routers under /api. Individual resource routers live
 * alongside this file and are mounted here.
 */
export const apiRoutes = new Hono();

apiRoutes.get("/health", (c) => c.json({ status: "ok" }));
apiRoutes.route("/waitlist", waitlistRoute);
