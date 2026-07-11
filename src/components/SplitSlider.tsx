import { useCallback, useRef, useState } from "react";
import type { River } from "../types/river";
import { YearBadge } from "./YearBadge";

/** Baseline zoom applied to both layers so the waterway itself is legible
 * immediately, without the visitor needing to pinch/scroll first. Both
 * images are scaled by the exact same factor from the exact same origin,
 * so the two layers stay pixel-aligned as the slider is dragged. */
const BASE_ZOOM = 1.22;

/** Below this slider position the "then" layer is clipped down to a sliver
 * (or nothing) — hide its badge rather than label an essentially invisible
 * strip. Mirrored at the top end for the "now" badge. */
const HIDE_MARGIN = 7;

export function SplitSlider({ river }: { river: River }) {
  const [pos, setPos] = useState(50);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(99, Math.max(1, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(1, p - 3));
    if (e.key === "ArrowRight") setPos((p) => Math.min(99, p + 3));
    if (e.key === "Home") setPos(1);
    if (e.key === "End") setPos(99);
  };

  // At very low `pos`, the "then" layer is clipped to almost nothing, so
  // the viewer is effectively looking at "now" — hide the "Then" badge.
  // At very high `pos`, the reverse is true — hide the "Now" badge.
  const showThenBadge = pos > HIDE_MARGIN;
  const showNowBadge = pos < 100 - HIDE_MARGIN;

  return (
    <div ref={outerRef} className="absolute inset-0 overflow-hidden">
      <img
        src={river.now.src}
        alt={`${river.name}, ${river.now.year} satellite view`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: `scale(${BASE_ZOOM})`, transformOrigin: "center center" }}
        draggable={false}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={river.then.src}
          alt={`${river.name}, ${river.then.year} satellite view`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${BASE_ZOOM})`, transformOrigin: "center center" }}
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-0 z-10 transition-opacity duration-300 ease-out"
        style={{ opacity: showThenBadge ? 1 : 0 }}
      >
        <YearBadge year={river.then.year} label="Then" align="left" />
      </div>
      <div
        className="absolute inset-0 z-10 transition-opacity duration-300 ease-out"
        style={{ opacity: showNowBadge ? 1 : 0 }}
      >
        <YearBadge year={river.now.year} label="Now" align="right" tone="danger" />
      </div>

      {/* handle line */}
      <div
        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-paper/90 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        style={{ left: `${pos}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparison slider: drag left or right, or use arrow keys"
        aria-valuemin={1}
        aria-valuemax={99}
        aria-valuenow={Math.round(pos)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-paper bg-teal text-ink shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-paper"
        style={{ left: `${pos}%` }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 7 3 12l5 5M16 7l5 5-5 5" />
        </svg>
      </div>
    </div>
  );
}
