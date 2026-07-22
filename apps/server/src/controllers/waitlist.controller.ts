import prisma from "@backgroundgone/db";
import type { Context } from "hono";
import { z } from "zod";

const waitlistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
});

/** Store (or refresh) a Mac-waitlist signup. Idempotent on email. */
export async function joinWaitlist(c: Context) {
  const body = await c.req.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      400,
    );
  }

  const email = parsed.data.email.toLowerCase();
  const subscriber = await prisma.waitlistSubscriber.upsert({
    where: { email },
    update: { name: parsed.data.name },
    create: { email, name: parsed.data.name, platform: "mac" },
  });

  return c.json({ ok: true, id: subscriber.id }, 201);
}
