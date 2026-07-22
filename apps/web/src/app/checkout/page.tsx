import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { CheckoutResult } from "./checkout-result";

export const metadata: Metadata = {
  title: "Checkout — BackgroundGone",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1180px] flex-col overflow-hidden border-hairline bg-page sm:min-h-0 sm:rounded-[28px] sm:border sm:shadow-[0_40px_90px_-50px_rgba(0,0,0,0.4)]">
        <Nav />
        <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[image:var(--hero-glow)]"
          />
          <Suspense
            fallback={
              <div className="text-[14px] text-faint">Loading your order…</div>
            }
          >
            <CheckoutResult />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
