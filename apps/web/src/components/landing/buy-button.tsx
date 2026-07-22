"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createCheckout } from "@/lib/api";
import { WindowsIcon } from "./icons";

type Variant = "brand" | "nav" | "secondary";
type Size = "nav" | "md" | "lg" | "xl";

/** Purchase CTA — opens a Dodo checkout session and redirects to it. */
export function BuyButton({
  variant = "brand",
  size = "xl",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function buy() {
    setState("loading");
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const label =
    state === "loading"
      ? "Starting…"
      : state === "error"
        ? "Unavailable — try later"
        : "Buy now · $49";

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={buy}
      disabled={state === "loading"}
    >
      <WindowsIcon size={size === "nav" ? 14 : 15} />
      {label}
    </Button>
  );
}
