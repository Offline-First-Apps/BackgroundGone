import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutResult } from "./checkout-result";

export const metadata: Metadata = {
  title: "Checkout — BackgroundGone",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="text-[14px] text-faint">Loading your order…</div>
        }
      >
        <CheckoutResult />
      </Suspense>
    </main>
  );
}
