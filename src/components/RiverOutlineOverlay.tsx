import { useEffect, useState } from "react";
import type { River } from "../types/river";
import { computeRiverOutline } from "../utils/riverOutline";
import { YearBadge } from "./YearBadge";

export interface OutlineStatus {
  loading: boolean;
  error: boolean;
  shrinkagePct: number | null;
}

function pointsToPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  const toPct = ([x, y]: [number, number]) => `${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`;
  return `M ${toPct(first)} ${rest.map((p) => `L ${toPct(p)}`).join(" ")} Z`;
}

export function RiverOutlineOverlay({
  river,
  lineOpacity,
  onStatus,
}: {
  river: River;
  lineOpacity: number;
  onStatus: (status: OutlineStatus) => void;
}) {
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setPath("");
    onStatus({ loading: true, error: false, shrinkagePct: null });

    computeRiverOutline(river.then.src, river.now.src, river.aspectRatio, river.changeMapFocus)
      .then((res) => {
        if (cancelled) return;
        setPath(pointsToPath(res.thenOutline));
        onStatus({ loading: false, error: false, shrinkagePct: res.shrinkagePct });
      })
      .catch(() => {
        if (cancelled) return;
        onStatus({ loading: false, error: true, shrinkagePct: null });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [river.id, river.then.src, river.now.src, river.aspectRatio, river.changeMapFocus]);

  return (
    <div className="absolute inset-0">
      {/* "now, zoomed out" — the full current-day frame, no baseline zoom, so the
          full extent of change (and the traced historical boundary) is visible. */}
      <img
        src={river.now.src}
        alt={`${river.name}, ${river.now.year} satellite view`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {path && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <filter id={`outline-glow-${river.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.6" floodColor="#ffffff" floodOpacity="0.9" />
            </filter>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.3}
            strokeDasharray="3 2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={lineOpacity}
            filter={`url(#outline-glow-${river.id})`}
          />
        </svg>
      )}

      <YearBadge year={river.now.year} label="Now" align="left" tone="danger" />
      <div className="pointer-events-none absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-md border border-paper/40 bg-ink/70 px-2.5 py-1.5 text-paper backdrop-blur-md shadow-[0_0_16px_rgba(255,255,255,0.2)]">
        <span
          className="h-1.5 w-3 shrink-0"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 7px)",
          }}
        />
        <span className="font-mono text-[9px] uppercase tracking-wider">
          {river.then.year} bank
        </span>
      </div>
    </div>
  );
}
