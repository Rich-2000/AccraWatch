import type { River } from "../types/river";

const statusStyles: Record<River["status"], string> = {
  critical: "bg-danger shadow-[0_0_8px_var(--color-danger)]",
  severe: "bg-amber shadow-[0_0_8px_var(--color-amber)]",
  watch: "bg-teal shadow-[0_0_8px_var(--color-teal)]",
};

const statusLabels: Record<River["status"], string> = {
  critical: "Critical",
  severe: "Severe",
  watch: "Watch",
};

export function RiverSelector({
  rivers,
  activeId,
  onSelect,
}: {
  rivers: River[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {rivers.map((river) => {
        const active = river.id === activeId;
        return (
          <button
            key={river.id}
            onClick={() => onSelect(river.id)}
            aria-pressed={active}
            className={`group relative flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
              active
                ? "border-teal/60 bg-teal/10 shadow-[0_0_0_1px_var(--color-teal),0_0_20px_rgba(0,209,255,0.15)]"
                : "glass-panel border-white/5 hover:border-teal/30 hover:shadow-[0_0_14px_rgba(0,209,255,0.08)] light:border-black/5"
            }`}
          >
            <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-white/10 light:border-black/10">
              <img
                src={river.now.src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span
                className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${statusStyles[river.status]}`}
                title={statusLabels[river.status]}
              />
            </div>
            <div className="min-w-0">
              <div
                className={`truncate font-display text-[13px] font-semibold ${
                  active ? "text-teal" : "text-paper light:text-ink-3"
                }`}
              >
                {river.shortName}
              </div>
              <div className="truncate font-mono text-[10px] uppercase tracking-wide text-mist/60">
                {river.then.year} → {river.now.year}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
