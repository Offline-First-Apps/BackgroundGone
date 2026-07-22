const BASE = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Something went wrong");
  }
  return res.json() as Promise<T>;
}

export function joinWaitlist(input: { name: string; email: string }) {
  return post<{ ok: true; id: string }>("/api/waitlist", input);
}

export function createCheckout(input: { email?: string; name?: string } = {}) {
  return post<{ url: string; orderId: string }>("/api/payments/checkout", input);
}

export interface OrderStatus {
  id: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  email: string;
  licenseKey?: string | null;
}

export async function getOrder(id: string): Promise<OrderStatus> {
  const res = await fetch(`${BASE}/api/payments/order/${id}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json() as Promise<OrderStatus>;
}
