import { forwardRef, type ReactNode } from "react";
import type { PanZoomState } from "../hooks/usePanZoom";

interface Props {
  aspectRatio: number;
  state: PanZoomState;
  isPanned: boolean;
  children: ReactNode;
}

export const PanZoomStage = forwardRef<HTMLDivElement, Props>(function PanZoomStage(
  { aspectRatio, state, isPanned, children },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative w-full touch-none select-none"
      style={{
        aspectRatio: String(aspectRatio),
        cursor: state.scale > 1 ? (isPanned ? "grabbing" : "grab") : "default",
      }}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
});
