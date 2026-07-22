import { env } from "@backgroundgone/env/server";
import DodoPayments from "dodopayments";

/**
 * Returns a configured Dodo Payments client, or null when the API key isn't
 * set (so the server still boots in environments without payment credentials).
 */
export function getDodoClient(): DodoPayments | null {
  if (!env.DODO_PAYMENTS_API_KEY) return null;
  return new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY,
    environment: env.DODO_PAYMENTS_ENVIRONMENT,
  });
}
