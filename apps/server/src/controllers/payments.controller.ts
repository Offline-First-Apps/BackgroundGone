import prisma from "@backgroundgone/db";
import { env } from "@backgroundgone/env/server";
import type { Context } from "hono";
import { Webhook } from "standardwebhooks";
import { z } from "zod";

import { getDodoClient } from "../lib/dodo";
import { sendPurchaseEmail } from "../lib/mailer";

const checkoutSchema = z.object({
  email: z.email().optional(),
  name: z.string().trim().min(1).max(120).optional(),
});

/**
 * Create a pending Order, open a Dodo checkout session referencing it via
 * metadata, and return the hosted checkout URL for the client to redirect to.
 */
export async function createCheckout(c: Context) {
  const client = getDodoClient();
  if (!client || !env.DODO_PAYMENTS_PRODUCT_ID) {
    return c.json({ error: "Payments are not configured" }, 503);
  }

  const body = await c.req.json().catch(() => ({}));
  const { email, name } = checkoutSchema.safeParse(body).data ?? {};

  const order = await prisma.order.create({
    data: {
      email: email ?? "",
      name,
      productId: env.DODO_PAYMENTS_PRODUCT_ID,
      status: "pending",
    },
  });

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: env.DODO_PAYMENTS_PRODUCT_ID, quantity: 1 }],
      customer: email ? { email, name: name ?? "" } : undefined,
      return_url: `${env.WEB_URL}/checkout?order=${order.id}`,
      metadata: { orderId: order.id },
    });

    const checkoutId =
      (session as { session_id?: string; id?: string }).session_id ??
      (session as { id?: string }).id ??
      null;
    if (checkoutId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { checkoutId },
      });
    }

    return c.json({ url: session.checkout_url, orderId: order.id });
  } catch (err) {
    await prisma.order
      .update({ where: { id: order.id }, data: { status: "failed" } })
      .catch(() => {});
    console.error("[checkout] failed", err);
    return c.json({ error: "Could not start checkout" }, 502);
  }
}

/** Read an order's current status — polled by the checkout result page. */
export async function getOrder(c: Context) {
  const order = await prisma.order.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!order) return c.json({ error: "Order not found" }, 404);
  return c.json({
    id: order.id,
    status: order.status,
    email: order.email,
    licenseKey: order.licenseKey,
  });
}

function statusFromEvent(type: string): string | undefined {
  if (/succeed|completed|active/i.test(type)) return "succeeded";
  if (/fail/i.test(type)) return "failed";
  if (/cancel/i.test(type)) return "cancelled";
  return undefined;
}

/**
 * Dodo Payments webhook (Standard Webhooks signed). Verifies the signature,
 * then reconciles the referenced Order's status.
 */
export async function handleDodoWebhook(c: Context) {
  if (!env.DODO_PAYMENTS_WEBHOOK_SECRET) {
    return c.json({ error: "Webhooks are not configured" }, 503);
  }

  const raw = await c.req.text();
  const webhook = new Webhook(env.DODO_PAYMENTS_WEBHOOK_SECRET);
  try {
    await webhook.verify(raw, {
      "webhook-id": c.req.header("webhook-id") ?? "",
      "webhook-signature": c.req.header("webhook-signature") ?? "",
      "webhook-timestamp": c.req.header("webhook-timestamp") ?? "",
    });
  } catch {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(raw) as {
    type?: string;
    data?: Record<string, unknown> & {
      metadata?: Record<string, string>;
      customer?: { email?: string };
      license_key?: string;
      license_keys?: string[];
    };
  };

  const data = event.data ?? {};
  const orderId = data.metadata?.orderId;
  const status = statusFromEvent(event.type ?? "");

  if (orderId && status) {
    const prev = await prisma.order
      .findUnique({ where: { id: orderId } })
      .catch(() => null);

    const order = await prisma.order
      .update({
        where: { id: orderId },
        data: {
          status,
          paymentId: (data.payment_id as string) ?? undefined,
          amount: (data.total_amount as number) ?? undefined,
          currency: (data.currency as string) ?? undefined,
          email: data.customer?.email ?? undefined,
          licenseKey:
            data.license_keys?.join(",") ?? data.license_key ?? undefined,
        },
      })
      .catch((err) => {
        console.error("[webhook] order update failed", err);
        return null;
      });

    // Send the purchase email once — only on the transition into "succeeded".
    if (order && status === "succeeded" && prev?.status !== "succeeded") {
      const to = order.email || data.customer?.email;
      if (to) {
        // Prefer the direct installer URL from the env var. Fall back to the
        // gated magic-link endpoint only when DOWNLOAD_URL isn't configured.
        const downloadUrl =
          env.DOWNLOAD_URL ?? `${env.SERVER_PUBLIC_URL}/api/download/${order.id}`;
        void sendPurchaseEmail({
          to,
          name: order.name ?? undefined,
          downloadUrl,
        }).catch((e) => console.error("[mail] send failed", e));
      }
    }
  }

  return c.json({ received: true });
}

/**
 * Gated installer download used by the purchase email's button (a "magic
 * link"). Verifies the order succeeded, then redirects to the installer.
 */
export async function downloadOrder(c: Context) {
  const order = await prisma.order.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!order || order.status !== "succeeded") {
    return c.text("This download link is not valid.", 404);
  }
  if (!env.DOWNLOAD_URL) {
    return c.text("The download isn't available yet — please contact support.", 503);
  }
  return c.redirect(env.DOWNLOAD_URL);
}
