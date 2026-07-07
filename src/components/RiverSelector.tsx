import type { River } from "../types/river";

const statusStyles: Record<River["status"], string> = {
  critical: "bg-danger",
  severe: "bg-amber",
  watch: "bg-teal",
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
                ? "border-teal bg-teal/10 shadow-[0_0_0_1px_var(--color-teal)]"
                : "border-teal-dim/25 bg-ink-2/60 hover:border-teal-dim/60 hover:bg-ink-2 light:bg-paper-2/60 light:hover:bg-paper-2"
            }`}
          >
            <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-ink-3 light:border-paper-3">
              <img
                src={river.now.src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span
                className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${statusStyles[river.status]}`}
                title={statusLabels[river.status]}
              />
            </div>
            <div className="min-w-0">
              <div
                className={`truncate font-display text-[13px] font-medium ${
                  active ? "text-teal" : "text-paper light:text-ink-3"
                }`}
              >
                {river.shortName}
              </div>
              <div className="truncate font-mono text-[10px] uppercase tracking-wide text-mist/70">
                {river.then.year} → {river.now.year}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
