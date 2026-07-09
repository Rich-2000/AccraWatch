import { useEffect, useState } from "react";
import { useFloodNews } from "../hooks/useFloodNews";
import { relativeTime } from "../utils/relativeTime";
import { fallbackBrief } from "../data/floodFallback";

function StatusBadge({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink shadow-[0_0_14px_rgba(255,92,102,0.4)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
        Live
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink shadow-[0_0_14px_rgba(255,138,61,0.35)]">
      <span className="h-1.5 w-1.5 rounded-full bg-ink" />
      Verified
    </span>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function DisasterBanner() {
  const { articles, status, lastUpdated, refresh } = useFloodNews();
  const [mobileIndex, setMobileIndex] = useState(0);
  const [briefOpen, setBriefOpen] = useState(false);

  const isLive = status === "success";
  const isFallback = status === "fallback";

  useEffect(() => {
    if (articles.length < 2) return;
    const cycleLength = Math.min(articles.length, 8);
    const id = setInterval(() => setMobileIndex((i) => (i + 1) % cycleLength), 5500);
    return () => clearInterval(id);
  }, [articles.length]);

  const tickerItems = articles.length > 0 ? [...articles, ...articles] : [];
  const activeMobileArticle = articles.length > 0 ? articles[mobileIndex % articles.length] : null;

  return (
    <div className="relative">
      {/* Mobile: short, well-defined rectangular card */}
      <div className="px-3 pt-2 sm:hidden">
        <div className="glass-panel rounded-lg border-danger/25">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <StatusBadge isLive={isLive} />

            <div className="min-w-0 flex-1">
              {status === "loading" && (
                <p className="truncate font-mono text-[11px] text-mist/70 light:text-ink-2/70">
                  Loading live flood news…
                </p>
              )}

              {status !== "loading" && activeMobileArticle && (
                <a
                  href={activeMobileArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={activeMobileArticle.title}
                  className="block truncate text-[12px] font-medium leading-tight text-mist light:text-ink-2"
                >
                  {activeMobileArticle.title}
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-mist/50 light:text-ink-2/50">
                    · {activeMobileArticle.domain}
                  </span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh live news"
              className="shrink-0 rounded-full p-1 text-danger/80 active:bg-danger/15"
            >
              <RefreshIcon />
            </button>
          </div>

          {isFallback && (
            <button
              type="button"
              onClick={() => setBriefOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 border-t border-danger/20 px-2.5 py-1.5 text-left"
            >
              <span className="font-mono text-[10px] text-mist/60 light:text-ink-2/60">
                Live feed unavailable · verified summary as of {fallbackBrief.asOf} · tap for full brief
              </span>
              <ChevronIcon open={briefOpen} />
            </button>
          )}
        </div>

        {isFallback && briefOpen && <CrisisBrief />}
      </div>

      {/* Desktop: full-width live ticker */}
      <div className="hidden overflow-hidden border-y border-danger/25 bg-danger/[0.07] backdrop-blur-sm sm:block">
        <div className="flex items-center gap-3 px-4 py-2">
          <StatusBadge isLive={isLive} />

          <div className="relative flex-1 overflow-hidden">
            {status === "loading" && (
              <p className="font-mono text-xs text-mist/70 light:text-ink-2/70">Loading live flood news…</p>
            )}

            {status !== "loading" && articles.length > 0 && (
              <div className="flex w-max animate-ticker gap-10 whitespace-nowrap font-mono text-xs">
                {tickerItems.map((a, i) => (
                  <a
                    key={`${a.id}-${i}`}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mist transition-colors hover:text-teal light:text-ink-3"
                  >
                    <span className="font-semibold text-danger">{a.domain}</span>{" "}
                    <span className="opacity-90">{a.title}</span>
                    <span className="opacity-50"> · {relativeTime(a.publishedAt)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {isLive && lastUpdated && (
            <span
              className="hidden shrink-0 font-mono text-[10px] text-mist/50 light:text-ink-2/50 lg:block"
              title={lastUpdated.toLocaleString()}
            >
              updated {relativeTime(lastUpdated)}
            </span>
          )}

          {isFallback && (
            <button
              type="button"
              onClick={() => setBriefOpen((v) => !v)}
              className="hidden shrink-0 items-center gap-1 font-mono text-[10px] text-amber underline underline-offset-2 lg:flex"
            >
              Verified summary ({fallbackBrief.asOf}) · full brief
              <ChevronIcon open={briefOpen} />
            </button>
          )}

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh live news"
            title="Refresh live news"
            className="shrink-0 rounded-full border border-danger/30 p-1.5 text-danger transition-colors hover:bg-danger/10"
          >
            <RefreshIcon />
          </button>
        </div>

        {isFallback && briefOpen && (
          <div className="border-t border-danger/20 px-4 py-4 sm:px-6">
            <CrisisBrief />
          </div>
        )}
      </div>
    </div>
  );
}

function CrisisBrief() {
  return (
    <div className="glass-panel mt-2 rounded-lg p-3.5 text-[13px] leading-relaxed sm:mt-0 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:[backdrop-filter:none]">
      <p className="mb-3 max-w-3xl text-mist light:text-ink-2">{fallbackBrief.headline}</p>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {fallbackBrief.keyFacts.map((f) => (
          <div key={f.label} className="rounded-lg border border-white/10 bg-black/20 p-2.5 light:border-black/10 light:bg-white/40">
            <div className="font-mono text-lg font-semibold text-danger">{f.value}</div>
            <div className="mt-0.5 text-[11px] font-medium text-paper light:text-ink">{f.label}</div>
            <div className="text-[10px] text-mist/60 light:text-ink-2/60">{f.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BriefList title="Causes" items={fallbackBrief.causes} />
        <BriefGeoList title="Geography & areas affected" items={fallbackBrief.geography} />
        <BriefList title="Damages reported" items={fallbackBrief.damages} />
        <BriefList title="Government response" items={fallbackBrief.response} />
      </div>

      <div className="mt-4 border-t border-teal-dim/20 pt-3">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-teal">
          Rainfall trend (30-day June totals)
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-mist/80 light:text-ink-2/80">
          {fallbackBrief.rainfallTrend.map((r) => (
            <span key={r.period}>
              {r.period}: <span className="font-semibold text-danger">{r.value}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-teal-dim/20 pt-3">
        {fallbackBrief.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-mist/60 underline-offset-2 hover:text-teal hover:underline light:text-ink-2/60"
          >
            {s.label} · {s.date}
          </a>
        ))}
      </div>
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-teal">{title}</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5 text-[12px] leading-snug text-mist/85 light:text-ink-2/85">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-danger" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BriefGeoList({ title, items }: { title: string; items: { area: string; note: string }[] }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-teal">{title}</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.area} className="text-[12px] leading-snug text-mist/85 light:text-ink-2/85">
            <span className="font-medium text-paper light:text-ink">{item.area}</span>
            <span className="text-mist/60 light:text-ink-2/60"> — {item.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
