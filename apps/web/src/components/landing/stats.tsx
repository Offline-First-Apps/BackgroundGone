const STATS = [
  { value: "40k+", label: "Makers on board", accent: false },
  { value: "5.2M", label: "Backgrounds removed", accent: false },
  { value: "0", label: "Images ever uploaded", accent: true },
  { value: "4.9", suffix: "/5", label: "Average rating", accent: false },
];

export function Stats() {
  return (
    <section className="px-[34px] pb-[60px] pt-[38px]">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-card-border bg-card-border md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[var(--float-bg)] px-[26px] py-8">
            <div
              className={`font-serif text-[46px] leading-none tracking-[-0.01em] ${
                s.accent ? "text-brand" : "text-fg"
              }`}
            >
              {s.value}
              {s.suffix && (
                <span className="text-[22px] text-faint">{s.suffix}</span>
              )}
            </div>
            <div className="mt-2 text-[13.5px] text-body">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
