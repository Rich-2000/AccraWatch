import { useEffect, useState } from "react";
import type { River } from "../types/river";
import { computeChangeOverlay } from "../utils/imageDiff";
import { YearBadge } from "./YearBadge";

export interface ChangeStatus {
  loading: boolean;
  error: boolean;
  changedPct: number | null;
  overlay: string | null;
}

export function ChangeOverlay({
  river,
  opacity,
  onStatus,
}: {
  river: River;
  opacity: number;
  onStatus: (status: ChangeStatus) => void;
}) {
  const [overlay, setOverlay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOverlay(null);
    onStatus({ loading: true, error: false, changedPct: null, overlay: null });

    computeChangeOverlay(river.then.src, river.now.src, river.aspectRatio)
      .then((res) => {
        if (cancelled) return;
        setOverlay(res.overlayDataUrl);
        onStatus({ loading: false, error: false, changedPct: res.changedPct, overlay: res.overlayDataUrl });
      })
      .catch(() => {
        if (cancelled) return;
        onStatus({ loading: false, error: true, changedPct: null, overlay: null });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [river.id, river.then.src, river.now.src, river.aspectRatio]);

  return (
    <div className="absolute inset-0">
      <img
        src={river.now.src}
        alt={`${river.name}, ${river.now.year} satellite view`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {overlay && (
        <img
          src={overlay}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
          style={{ opacity }}
          draggable={false}
        />
      )}
      <YearBadge year={river.now.year} label="Now + change" align="left" tone="danger" />
    </div>
  );
}
