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
      className={`pointer-events-none absolute top-2.5 z-10 flex items-center gap-1.5 rounded-md border px-2 py-1 backdrop-blur-sm ${
        align === "left" ? "left-2.5" : "right-2.5"
      } ${
        tone === "danger"
          ? "border-danger/50 bg-danger/15 text-danger"
          : "border-teal/40 bg-ink/70 text-teal"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="font-mono text-[11px] font-semibold tracking-wide">{year}</span>
      <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}
