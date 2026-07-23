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
    // Public URL of THIS server, used to build email download links. Optional:
    // when unset it's derived from the request's forwarded headers, so links
    // use the real public host instead of localhost.
    SERVER_PUBLIC_URL: z.url().optional(),

    // Dodo Payments. Optional so the server boots without them in dev;
    // the payment endpoints validate presence at request time.
    DODO_PAYMENTS_API_KEY: z.string().optional(),
    DODO_PAYMENTS_WEBHOOK_SECRET: z.string().optional(),
    DODO_PAYMENTS_PRODUCT_ID: z.string().optional(),
    DODO_PAYMENTS_ENVIRONMENT: z
      .enum(["test_mode", "live_mode"])
      .default("test_mode"),

    // Email (nodemailer over Gmail SMTP). Optional so the server boots
    // without them; the mailer no-ops until SMTP_USER + SMTP_PASS are set.
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().default(465),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().optional(),
    // Direct-download URL of the installer (e.g. an S3/R2 link that forces
    // attachment). The purchase email's button redirects here.
    DOWNLOAD_URL: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
