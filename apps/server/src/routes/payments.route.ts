import { Hono } from "hono";

import {
  createCheckout,
  getOrder,
  handleDodoWebhook,
} from "../controllers/payments.controller";

export const paymentsRoute = new Hono();

paymentsRoute.post("/checkout", createCheckout);
paymentsRoute.get("/order/:id", getOrder);

/** Dodo Payments webhooks (Standard Webhooks signed). Mounted separately. */
export const webhooksRoute = new Hono();
webhooksRoute.post("/dodo", handleDodoWebhook);
