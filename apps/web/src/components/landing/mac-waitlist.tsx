"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { joinWaitlist } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * A link that opens an on-theme dialog collecting name + email for the Mac
 * waitlist, posting to the server. Used wherever "Mac version" appears.
 */
export function MacWaitlistLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => nameRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  function close() {
    setOpen(false);
    // reset after the close transition
    setTimeout(() => {
      setStatus("idle");
      setError("");
    }, 200);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !email) return;
    setStatus("submitting");
    setError("");
    try {
      await joinWaitlist({ name, email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Join the Mac waitlist"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative w-full max-w-[420px] rounded-[20px] border border-card-border bg-page p-7 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-[var(--card)] hover:text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {status === "success" ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[rgba(255,107,107,0.14)] text-brand">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="font-serif text-[26px] leading-tight text-fg">
                  You&apos;re on the list.
                </h2>
                <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-[1.55] text-body">
                  We&apos;ll email you the moment the Mac version is ready. No
                  spam, just the one message.
                </p>
                <Button
                  variant="brand"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={close}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
                  Mac — coming soon
                </div>
                <h2 className="mt-2 font-serif text-[28px] leading-[1.05] text-fg">
                  Get notified when the{" "}
                  <span className="italic text-[var(--serif-em)]">
                    Mac build
                  </span>{" "}
                  lands.
                </h2>
                <p className="mt-2 text-[14px] leading-[1.55] text-body">
                  Drop your details and we&apos;ll let you know the day it&apos;s
                  available.
                </p>

                <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
                  <input
                    ref={nameRef}
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    autoComplete="name"
                    className="h-11 w-full rounded-xl border border-[var(--secbtn-border)] bg-[var(--card)] px-3.5 text-[14px] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-[var(--secbtn-border)] bg-[var(--card)] px-3.5 text-[14px] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand"
                  />
                  {status === "error" && (
                    <p className="text-[13px] text-brand">{error}</p>
                  )}
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="mt-1 w-full"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Sending…" : "Notify me"}
                  </Button>
                </form>
                <p className="mt-3 text-center text-[12px] text-faint">
                  Runs 100% on-device. We only use your email for this.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
