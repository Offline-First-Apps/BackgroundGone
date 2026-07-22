function CheckDot() {
  return (
    <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[rgba(255,107,107,0.15)] text-brand">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

const BULLETS = [
  { strong: "Runs on your device", rest: " — nothing is uploaded, ever." },
  { strong: "No account, no login", rest: " — open it and go." },
  { strong: "Pay once, keep forever", rest: " — no subscription, no expiry." },
];

const ROWS = [
  ["License", "Lifetime · Personal"],
  ["Renews", "Never"],
  ["Devices", "Unlimited"],
  ["Updates", "Included"],
];

export function YouOwnIt() {
  return (
    <section
      id="own"
      className="relative mx-[10px] mb-[10px] overflow-hidden rounded-[22px] border border-[var(--own-border)] bg-[var(--own-bg)] px-6 py-12 text-white sm:px-12 sm:py-[60px]"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-[340px] rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.16),transparent_70%)]" />

      <div className="relative z-[2] flex flex-wrap items-center gap-8 sm:gap-[52px]">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            The whole point
          </div>
          <h2 className="mt-4 font-serif text-[38px] font-normal leading-[1.04] tracking-[-0.01em] sm:text-[50px] sm:leading-[1.02]">
            You bought it.
            <br />
            <span className="italic text-brand-soft">You own it.</span>
          </h2>
          <p className="mt-5 max-w-[440px] text-[16px] leading-[1.6] text-[#a5a5ab]">
            Most background removers rent you access — they hold your images on
            their servers and charge every month. BackgroundGone is a tool you
            keep. It lives on your machine and works whether you&apos;re online or
            not.
          </p>
          <div className="mt-[26px] flex flex-col gap-[14px]">
            {BULLETS.map((b) => (
              <div key={b.strong} className="flex items-center gap-3">
                <CheckDot />
                <span className="text-[14.5px] text-[#e4e4e7]">
                  <b className="text-white">{b.strong}</b>
                  {b.rest}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full sm:flex-[0_0_360px]">
          <div className="rounded-[18px] border border-[var(--own-card-border)] bg-[var(--own-card-bg)] p-[26px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between border-b border-dashed border-[#333] pb-[18px]">
              <div className="flex items-center gap-2.5">
                <span className="flex size-[30px] items-center justify-center rounded-lg bg-brand">
                  <span className="size-[15px] rounded-[4px] bg-[var(--own-card-bg)]" />
                </span>
                <span className="text-[15px] font-semibold">BackgroundGone</span>
              </div>
              <span className="rounded-full border border-[rgba(40,200,64,0.25)] bg-[rgba(40,200,64,0.12)] px-[9px] py-[3px] font-mono text-[11px] text-[#28c840]">
                ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-[14px] py-5">
              {ROWS.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[13px] text-[#7c7c82]">{k}</span>
                  <span className="font-mono text-[13px] text-[#e4e4e7]">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-[#333] pt-[18px]">
              <span className="text-[13px] text-[#7c7c82]">Total paid</span>
              <span className="text-[22px] font-bold tracking-[-0.02em]">
                $49.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
