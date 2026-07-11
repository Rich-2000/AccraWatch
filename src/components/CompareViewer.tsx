import { useState } from "react";
import type { River } from "../types/river";
import { usePanZoom } from "../hooks/usePanZoom";
import { PanZoomStage } from "./PanZoomStage";
import { ViewerFrame } from "./ViewerFrame";
import { SplitSlider } from "./SplitSlider";
import { SingleView } from "./SingleView";
import { RiverOutlineOverlay, type OutlineStatus } from "./RiverOutlineOverlay";
import { FullscreenViewer } from "./FullscreenViewer";

type Mode = "split" | "then" | "now" | "change";

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: "split", label: "Split compare", icon: "M8 3v18M3 3h18v18H3z" },
  { id: "then", label: "Then only", icon: "M4 4h16v16H4z" },
  { id: "now", label: "Now only", icon: "M4 4h16v16H4z" },
  { id: "change", label: "Change map", icon: "M12 2l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 9l6-1z" },
];

export function CompareViewer({ river }: { river: River }) {
  const [mode, setMode] = useState<Mode>("split");
  const [outlineIntensity, setOutlineIntensity] = useState(0.95);
  const [outlineStatus, setOutlineStatus] = useState<OutlineStatus>({
    loading: true,
    error: false,
    shrinkagePct: null,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { containerRef, state, zoomIn, zoomOut, reset, isDragging } = usePanZoom<HTMLDivElement>();

  const zoomPct = Math.round(state.scale * 100);

  const toolbar = (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="glass-panel flex flex-wrap gap-1.5 rounded-lg p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-all ${
              mode === m.id
                ? "bg-teal text-ink shadow-[0_0_14px_rgba(0,209,255,0.35)]"
                : "text-mist hover:bg-white/5 hover:text-teal light:text-ink-2 light:hover:bg-black/5"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={m.icon} />
            </svg>
            {m.label}
          </button>
        ))}
      </div>

      <div className="glass-panel ml-auto flex items-center gap-1.5 rounded-lg p-1">
        <button
          onClick={zoomOut}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center rounded-md text-mist transition-colors hover:bg-white/5 hover:text-teal light:text-ink-2 light:hover:bg-black/5"
        >
          −
        </button>
        <span className="min-w-[3.2rem] text-center font-mono text-[11px] text-mist light:text-ink-2">
          {zoomPct}%
        </span>
        <button
          onClick={zoomIn}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center rounded-md text-mist transition-colors hover:bg-white/5 hover:text-teal light:text-ink-2 light:hover:bg-black/5"
        >
          +
        </button>
        <button
          onClick={reset}
          aria-label="Reset zoom"
          className="ml-1 flex h-7 items-center rounded-md px-2 font-mono text-[10px] uppercase tracking-wide text-mist transition-colors hover:bg-white/5 hover:text-teal light:text-ink-2 light:hover:bg-black/5"
        >
          Reset
        </button>
        <div className="mx-0.5 h-5 w-px bg-white/10 light:bg-black/10" />
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-mist transition-colors hover:bg-white/5 hover:text-teal light:text-ink-2 light:hover:bg-black/5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      </div>
    </div>
  );

  const frame = (
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
          <RiverOutlineOverlay river={river} lineOpacity={outlineIntensity} onStatus={setOutlineStatus} />
        )}
      </PanZoomStage>
    </ViewerFrame>
  );

  const changePanel = mode === "change" && (
    <div className="glass-panel mt-3 rounded-lg px-3.5 py-2.5">
      {outlineStatus.loading && (
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-teal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          Tracing the {river.then.year} waterway boundary…
        </p>
      )}
      {outlineStatus.error && (
        <p className="font-mono text-[11px] text-danger">
          Couldn't trace a boundary for this pair. Showing the current-year image only.
        </p>
      )}
      {!outlineStatus.loading && !outlineStatus.error && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2 font-mono text-[13px] font-medium text-paper">
            <span
              className="h-1.5 w-4 shrink-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 7px)",
              }}
            />
            River extent reduced by ≈{outlineStatus.shrinkagePct ?? "–"}% since {river.then.year}
          </span>
          <label className="flex flex-1 min-w-[160px] items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-mist/80 light:text-ink-2/70">
            Outline intensity
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={outlineIntensity}
              onChange={(e) => setOutlineIntensity(Number(e.target.value))}
              className="h-1 flex-1 accent-paper"
              aria-label="Outline line opacity"
            />
          </label>
        </div>
      )}
      <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-mist/60 light:text-ink-2/60">
        The dashed line traces the water body's detected boundary in the {river.then.year} photograph —
        found on-device via smoothness/texture segmentation of the actual pixels — overlaid on the{" "}
        {river.now.year} photograph so you can see how far the bank has receded and where settlement now
        stands. This is a computed approximation from two photographs, not an official hydrological survey.
      </p>
    </div>
  );

  const footerNote = (
    <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] text-mist/50 light:text-ink-2/50">
      <span className="hidden h-1 w-1 rounded-full bg-teal/50 sm:inline-block" />
      Scroll or pinch to zoom · drag to pan when zoomed · {river.sourceCredit}
    </p>
  );

  const body = (
    <div>
      {toolbar}
      {frame}
      {changePanel}
      {footerNote}
    </div>
  );

  if (isFullscreen) {
    return <FullscreenViewer onClose={() => setIsFullscreen(false)}>{body}</FullscreenViewer>;
  }
  return body;
}
