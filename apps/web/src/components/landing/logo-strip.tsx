function Dot() {
  return <span className="size-1 rounded-full bg-border" />;
}

export function LogoStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-[14px] border-t border-hairline px-[34px] py-[30px]">
      <span className="mr-2 text-[12.5px] text-faint">
        Trusted by designers &amp; shops at
      </span>
      <span className="whitespace-nowrap text-[19px] font-bold tracking-[-0.03em] text-logos">
        Studio North
      </span>
      <Dot />
      <span className="font-serif text-[22px] italic text-logos">Marchetti</span>
      <Dot />
      <span className="text-[18px] font-semibold tracking-[0.14em] text-logos">
        FOLD
      </span>
      <Dot />
      <span className="text-[18px] font-extrabold tracking-[-0.04em] text-logos">
        everly.
      </span>
      <Dot />
      <span className="text-[18px] font-bold italic text-logos">Kova</span>
    </div>
  );
}
