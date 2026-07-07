import { useState } from "react";
import type { River } from "../types/river";
import { usePanZoom } from "../hooks/usePanZoom";
import { PanZoomStage } from "./PanZoomStage";
import { ViewerFrame } from "./ViewerFrame";
import { SplitSlider } from "./SplitSlider";
import { SingleView } from "./SingleView";
import { ChangeOverlay, type ChangeStatus } from "./ChangeOverlay";

type Mode = "split" | "then" | "now" | "change";

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: "split", label: "Split compare", icon: "M8 3v18M3 3h18v18H3z" },
  { id: "then", label: "Then only", icon: "M4 4h16v16H4z" },
  { id: "now", label: "Now only", icon: "M4 4h16v16H4z" },
  { id: "change", label: "Change map", icon: "M12 2l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 9l6-1z" },
];

export function CompareViewer({ river }: { river: River }) {
  const [mode, setMode] = useState<Mode>("split");
  const [changeOpacity, setChangeOpacity] = useState(0.9);
  const [changeStatus, setChangeStatus] = useState<ChangeStatus>({
    loading: true,
    error: false,
    changedPct: null,
    overlay: null,
  });
  const { containerRef, state, zoomIn, zoomOut, reset, isDragging } = usePanZoom<HTMLDivElement>();

  const zoomPct = Math.round(state.scale * 100);

  return (
    <div>
      {/* Mode toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-teal-dim/30 bg-ink-2/60 p-1 light:bg-paper-2/60">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                mode === m.id
                  ? "bg-teal text-ink"
                  : "text-mist hover:bg-ink-3 light:text-ink-2 light:hover:bg-paper-3"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={m.icon} />
              </svg>
              {m.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-teal-dim/30 bg-ink-2/60 p-1 light:bg-paper-2/60">
          <button
            onClick={zoomOut}
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-md text-mist transition-colors hover:bg-ink-3 hover:text-teal light:text-ink-2 light:hover:bg-paper-3"
          >
            −
          </button>
          <span className="min-w-[3.2rem] text-center font-mono text-[11px] text-mist light:text-ink-2">
            {zoomPct}%
          </span>
          <button
            onClick={zoomIn}
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-md text-mist transition-colors hover:bg-ink-3 hover:text-teal light:text-ink-2 light:hover:bg-paper-3"
          >
            +
          </button>
          <button
            onClick={reset}
            aria-label="Reset zoom"
            className="ml-1 flex h-7 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-wide text-mist transition-colors hover:bg-ink-3 hover:text-teal light:text-ink-2 light:hover:bg-paper-3"
          >
            Reset
          </button>
        </div>
      </div>

      <ViewerFrame scanKey={`${river.id}-${mode}`}>
        <PanZoomStage
          ref={containerRef}
          aspectRatio={river.aspectRatio}
          state={state}
          isPanned={isDragging.current}
        >
          {mode === "split" && <SplitSlider river={river} />}
          {mode === "then" && <SingleView river={river} which="then" />}
          {mode === "now" && <SingleView river={river} which="now" />}
          {mode === "change" && (
            <ChangeOverlay river={river} opacity={changeOpacity} onStatus={setChangeStatus} />
          )}
        </PanZoomStage>
      </ViewerFrame>

      {mode === "change" && (
        <div className="mt-3 rounded-lg border border-teal/25 bg-ink-2/60 px-3.5 py-2.5 light:bg-paper-2/60">
          {changeStatus.loading && (
            <p className="font-mono text-[11px] uppercase tracking-widest text-teal">
              Computing change map from image pixels…
            </p>
          )}
          {changeStatus.error && (
            <p className="font-mono text-[11px] text-danger">
              Couldn't compute a change overlay for this pair. Showing the current-year image only.
            </p>
          )}
          {!changeStatus.loading && !changeStatus.error && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-mono text-[11px] text-teal">
                ≈{changeStatus.changedPct ?? "–"}% of the frame flagged as visually changed
              </span>
              <label className="flex flex-1 min-w-[160px] items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-mist/80 light:text-ink-2/70">
                Overlay strength
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.05}
                  value={changeOpacity}
                  onChange={(e) => setChangeOpacity(Number(e.target.value))}
                  className="h-1 flex-1 accent-teal"
                  aria-label="Change overlay opacity"
                />
              </label>
            </div>
          )}
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-mist/60 light:text-ink-2/60">
            White outlines are computed live from the two photographs' pixel differences — an
            approximate visual change map, not a scientific land-cover survey. Framing and zoom
            vary slightly between captures.
          </p>
        </div>
      )}

      <p className="mt-2.5 text-center font-mono text-[10px] text-mist/50 light:text-ink-2/50">
        Scroll or pinch to zoom · drag to pan when zoomed · {river.sourceCredit}
      </p>
    </div>
  );
}
