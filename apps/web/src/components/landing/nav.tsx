import { BuyButton } from "./buy-button";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#own", label: "You own it" },
  { href: "/#pricing", label: "Pricing" },
];

export function Nav() {
  return (
    <nav className="relative z-10 flex items-center justify-between gap-3 px-5 py-4 sm:px-[34px] sm:py-[22px]">
      <a href="#top" className="flex items-center gap-[11px]">
        <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-[var(--logo-sq)]">
          <span className="size-[18px] rounded-[6px] bg-[var(--logo-sq-inner)]" />
        </span>
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">
          BackgroundGone
        </span>
      </a>

      <div className="hidden items-center gap-1 rounded-full border border-[var(--pill-border)] bg-[var(--pill)] p-[5px] md:flex">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-full px-4 py-2 text-[13.5px] font-medium text-[var(--navlink)] transition-colors hover:bg-[var(--navlink-hover-bg)] hover:text-[var(--navlink-hover-fg)]"
          >
            {l.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3.5">
        <div className="hidden items-center gap-[7px] sm:flex">
          <span className="size-[7px] rounded-full bg-[var(--ok)]" />
          <span className="text-[12.5px] font-medium text-fg-2">
            100% on-device
          </span>
        </div>
        <BuyButton variant="nav" size="nav" />
      </div>
    </nav>
  );
}
