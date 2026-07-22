import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    // PostgreSQL connection string.
    DATABASE_URL: z.string().min(1),

    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // Public URL of the web app, used for payment return URLs.
    WEB_URL: z.url().default("http://localhost:3001"),

    // Dodo Payments. Optional so the server boots without them in dev;
    // the payment endpoints validate presence at request time.
    DODO_PAYMENTS_API_KEY: z.string().optional(),
    DODO_PAYMENTS_WEBHOOK_SECRET: z.string().optional(),
    DODO_PAYMENTS_PRODUCT_ID: z.string().optional(),
    DODO_PAYMENTS_ENVIRONMENT: z
      .enum(["test_mode", "live_mode"])
      .default("test_mode"),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
