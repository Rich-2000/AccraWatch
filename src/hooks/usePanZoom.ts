import { useCallback, useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export interface PanZoomState {
  scale: number;
  x: number;
  y: number;
}

function clampPan(state: PanZoomState, containerW: number, containerH: number): PanZoomState {
  if (state.scale <= 1) return { ...state, x: 0, y: 0 };
  const maxX = ((state.scale - 1) * containerW) / 2;
  const maxY = ((state.scale - 1) * containerH) / 2;
  return {
    ...state,
    x: Math.min(maxX, Math.max(-maxX, state.x)),
    y: Math.min(maxY, Math.max(-maxY, state.y)),
  };
}

export function usePanZoom<T extends HTMLElement>() {
  // A state-backed callback ref (rather than a plain useRef) so that if the
  // underlying DOM node is ever swapped out — e.g. the container remounts
  // when the viewer moves in/out of the fullscreen portal — the effect
  // below reliably reattaches its listeners to the *new* node instead of
  // silently keeping stale listeners on a detached element.
  const [container, setContainer] = useState<T | null>(null);
  const containerRef = useCallback((node: T | null) => setContainer(node), []);

  const [state, setState] = useState<PanZoomState>({ scale: 1, x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);

  const reset = useCallback(() => setState({ scale: 1, x: 0, y: 0 }), []);

  const zoomBy = useCallback(
    (delta: number, cx?: number, cy?: number) => {
      setState((prev) => {
        const rect = container?.getBoundingClientRect();
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta));
        if (nextScale === prev.scale) return prev;
        if (!rect) return { ...prev, scale: nextScale };

        const originX = cx !== undefined ? cx - rect.left - rect.width / 2 : 0;
        const originY = cy !== undefined ? cy - rect.top - rect.height / 2 : 0;
        const ratio = nextScale / prev.scale;
        const nextX = originX - (originX - prev.x) * ratio;
        const nextY = originY - (originY - prev.y) * ratio;

        return clampPan({ scale: nextScale, x: nextX, y: nextY }, rect.width, rect.height);
      });
    },
    [container]
  );

  useEffect(() => {
    const el = container;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.35 : 0.35;
      zoomBy(delta, e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (state.scale <= 1) return;
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      const rect = el.getBoundingClientRect();
      setState((prev) => clampPan({ ...prev, x: prev.x + dx, y: prev.y + dy }, rect.width, rect.height));
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    const onDoubleClick = () => reset();

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (pinchDist.current != null) {
          const delta = (dist - pinchDist.current) * 0.01;
          const cx = (t1.clientX + t2.clientX) / 2;
          const cy = (t1.clientY + t2.clientY) / 2;
          zoomBy(delta, cx, cy);
        }
        pinchDist.current = dist;
      }
    };
    const onTouchEnd = () => {
      pinchDist.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("dblclick", onDoubleClick);
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("dblclick", onDoubleClick);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, zoomBy, reset, state.scale]);

  const zoomIn = useCallback(() => zoomBy(0.5), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(-0.5), [zoomBy]);

  return { containerRef, state, zoomIn, zoomOut, reset, isDragging: dragging };
}
