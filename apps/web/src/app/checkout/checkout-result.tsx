"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BuyButton } from "@/components/landing/buy-button";
import { Button } from "@/components/ui/button";
import { getOrder, type OrderStatus } from "@/lib/api";

type Phase = "pending" | "succeeded" | "failed" | "cancelled" | "unknown";

export function CheckoutResult() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const hintedStatus = params.get("status"); // Dodo may append this
  const [phase, setPhase] = useState<Phase>(
    hintedStatus === "succeeded" ? "succeeded" : "pending",
  );
  const [order, setOrder] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!orderId) {
      setPhase(hintedStatus === "succeeded" ? "succeeded" : "unknown");
      return;
    }
    let active = true;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const o = await getOrder(orderId);
        if (!active) return;
        setOrder(o);
        if (o.status !== "pending") {
          setPhase(o.status);
          clearInterval(timer);
        }
      } catch {
        // keep trying briefly; the webhook may not have landed yet
      }
      if (tries >= 15) {
        clearInterval(timer);
        if (active)
          setPhase((p) => (p === "pending" && hintedStatus === "succeeded" ? "succeeded" : p));
      }
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId, hintedStatus]);

  if (phase === "succeeded") {
    return (
      <Card
        tone="ok"
        eyebrow="Order confirmed"
        icon={<path d="M20 6L9 17l-5-5" />}
        title="Payment complete."
        emphasis="It's yours."
        body="Thanks for buying BackgroundGone. Your download link and license key are on their way to your inbox — check your email to install."
      >
        {order?.licenseKey && (
          <div className="mt-1 w-full rounded-xl border border-card-border bg-page px-4 py-3 text-center font-mono text-[13px] text-fg">
            {order.licenseKey}
          </div>
        )}
        <Button variant="brand" size="lg" className="mt-2 w-full" asChild>
          <a href="/">Back to home</a>
        </Button>
      </Card>
    );
  }

  if (phase === "failed" || phase === "cancelled") {
    return (
      <Card
        tone="error"
        eyebrow={phase === "cancelled" ? "Cancelled" : "Payment issue"}
        icon={<path d="M18 6L6 18M6 6l12 12" />}
        title={phase === "cancelled" ? "Checkout cancelled." : "That didn't go through."}
        body="No charge was made. You can try again — it only takes a moment."
      >
        <BuyButton variant="brand" size="lg" className="mt-2 w-full" />
        <a
          href="/"
          className="mt-1 text-[14px] font-medium text-body transition-colors hover:text-brand"
        >
          Back to home
        </a>
      </Card>
    );
  }

  if (phase === "unknown") {
    return (
      <Card
        tone="error"
        eyebrow="Hmm"
        icon={<path d="M12 8v5M12 16h.01" />}
        title="We couldn't find that order."
        body="If you just paid, check your email for your download link. Otherwise, head back and try again."
      >
        <Button variant="brand" size="lg" className="mt-2 w-full" asChild>
          <a href="/">Back to home</a>
        </Button>
      </Card>
    );
  }

  // pending
  return (
    <Card
      tone="pending"
      eyebrow="Almost there"
      icon={<path d="M12 3a9 9 0 1 0 9 9" />}
      spin
      title="Confirming your payment…"
      body="Hang tight for a moment while we confirm the transaction. This usually takes just a few seconds."
    />
  );
}

function Card({
  tone,
  eyebrow,
  icon,
  title,
  emphasis,
  body,
  spin,
  children,
}: {
  tone: "ok" | "error" | "pending";
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
  emphasis?: string;
  body: string;
  spin?: boolean;
  children?: React.ReactNode;
}) {
  const ring =
    tone === "pending"
      ? "bg-[var(--card)] text-faint"
      : "bg-[rgba(255,107,107,0.14)] text-brand";
  return (
    <div className="relative z-[1] flex w-full max-w-[460px] flex-col items-center rounded-[24px] border border-card-border bg-card p-9 text-center shadow-[0_40px_90px_-46px_rgba(0,0,0,0.5)]">
      <span
        className={`mb-5 flex size-14 items-center justify-center rounded-full ${ring}`}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={spin ? "animate-spin" : undefined}
        >
          {icon}
        </svg>
      </span>
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
        {eyebrow}
      </div>
      <h1 className="mt-2 font-serif text-[32px] leading-[1.05] text-fg">
        {title}
        {emphasis && (
          <>
            {" "}
            <span className="italic text-[var(--serif-em)]">{emphasis}</span>
          </>
        )}
      </h1>
      <p className="mx-auto mt-2.5 max-w-[360px] text-[15px] leading-[1.55] text-body">
        {body}
      </p>
      <div className="mt-6 flex w-full flex-col items-center gap-2">
        {children}
      </div>
    </div>
  );
}
