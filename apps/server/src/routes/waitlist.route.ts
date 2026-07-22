import { Hono } from "hono";

import { joinWaitlist } from "../controllers/waitlist.controller";

export const waitlistRoute = new Hono();

waitlistRoute.post("/", joinWaitlist);
