import { BuyButton } from "./buy-button";
import { MacWaitlistLink } from "./mac-waitlist";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Privacy", href: "#own" },
      { label: "Mac version", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Support", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] px-12 pb-8 pt-[60px] text-white">
      <div className="flex flex-wrap justify-between gap-12 border-b border-[#232323] pb-[44px]">
        <div className="max-w-[400px]">
          <div className="mb-5 flex items-center gap-[11px]">
            <img
              src="/icon1.png"
              alt="BackgroundGone"
              width={32}
              height={32}
              className="size-8 rounded-[9px]"
            />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">
              BackgroundGone
            </span>
          </div>
          <h3 className="font-serif text-[32px] font-normal leading-[1.08] tracking-[-0.01em]">
            Remove the background.
            <br />
            <span className="italic text-brand-soft">Keep everything else.</span>
          </h3>
          <BuyButton variant="brand" size="md" className="mt-[22px]" />
        </div>

        <div className="flex flex-wrap gap-[60px]">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-[13px]">
              <div className="mb-[3px] font-mono text-[11px] uppercase tracking-[0.1em] text-[#5f5f65]">
                {col.title}
              </div>
              {col.links.map((l) =>
                l.label === "Mac version" ? (
                  <MacWaitlistLink
                    key={l.label}
                    className="cursor-pointer text-left text-[14px] text-[#a5a5ab] transition-colors hover:text-white"
                  >
                    {l.label}
                  </MacWaitlistLink>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-[14px] text-[#a5a5ab] transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[14px] pt-[22px]">
        <span className="font-mono text-[12px] text-[#5f5f65]">
          © 2026 BackgroundGone · Made for people who own their tools.
        </span>
        <div className="flex gap-[22px]">
          {["Terms", "Privacy", "License"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[12.5px] text-[#7c7c82] transition-colors hover:text-white"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
