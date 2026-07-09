import type { River } from "../types/river";

const statusStyles: Record<River["status"], string> = {
  critical: "border-danger/50 bg-danger/10 text-danger",
  severe: "border-amber/50 bg-amber/10 text-amber",
  watch: "border-teal/50 bg-teal/10 text-teal",
};

const statusDot: Record<River["status"], string> = {
  critical: "bg-danger shadow-[0_0_8px_var(--color-danger)]",
  severe: "bg-amber shadow-[0_0_8px_var(--color-amber)]",
  watch: "bg-teal shadow-[0_0_8px_var(--color-teal)]",
};

const statusLabels: Record<River["status"], string> = {
  critical: "Critical encroachment",
  severe: "Severe pressure",
  watch: "Under watch",
};

export function InfoPanel({ river }: { river: River }) {
  return (
    <div className="glass-panel rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] lg:sticky lg:top-[80px] lg:self-start">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h2 className="font-display text-xl font-bold tracking-tight text-paper light:text-ink">
          {river.name}
        </h2>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${statusStyles[river.status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[river.status]}`} />
          {statusLabels[river.status]}
        </span>
      </div>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-mist/60">
        {river.waterBody} · {river.area}
      </p>

      <p className="mb-4 text-[14.5px] leading-relaxed text-mist light:text-ink-2">{river.summary}</p>

      <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-teal">
        <span className="h-px w-3 bg-teal/60" />
        What's driving the change
      </h3>
      <ul className="mb-4 space-y-1.5">
        {river.causes.map((cause, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-mist light:text-ink-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal" />
            {cause}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-amber/30 bg-amber/10 p-3.5">
        <h3 className="mb-1 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-amber">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          Link to the flooding crisis
        </h3>
        <p className="text-[13px] leading-relaxed text-mist light:text-ink-2">{river.floodLink}</p>
      </div>

      {river.sources && river.sources.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3.5 light:border-black/10">
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-teal">
            <span className="h-px w-3 bg-teal/60" />
            Verify this · sources
          </h3>
          <ul className="space-y-1.5">
            {river.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5 text-[12.5px] leading-relaxed text-mist/85 underline-offset-2 hover:text-teal hover:underline light:text-ink-2/85"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-teal/70 group-hover:bg-teal" />
                  <span>{source.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-widest text-mist/35 light:border-black/10">
        <span className="h-1 w-1 rounded-full bg-teal/40" />
        Data verified · {river.sourceCredit}
      </div>
    </div>
  );
}
