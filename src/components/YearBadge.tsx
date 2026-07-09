export function YearBadge({
  year,
  label,
  align = "left",
  tone = "default",
}: {
  year: number;
  label: string;
  align?: "left" | "right";
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`pointer-events-none absolute top-2.5 z-10 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 backdrop-blur-md ${
        align === "left" ? "left-2.5" : "right-2.5"
      } ${
        tone === "danger"
          ? "border-danger/50 bg-danger/15 text-danger shadow-[0_0_16px_rgba(255,92,102,0.2)]"
          : "border-teal/40 bg-ink/70 text-teal shadow-[0_0_16px_rgba(0,209,255,0.15)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      <span className="font-mono text-[11px] font-semibold tracking-wide">{year}</span>
      <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}
