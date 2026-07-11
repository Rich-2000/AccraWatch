import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function FullscreenViewer({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-2xl animate-[fadeIn_0.18s_ease-out] sm:p-6 lg:p-10"
      onMouseDown={(e) => {
        // Tapping the dimmed backdrop — anywhere outside the frame and its
        // controls — closes the viewer. Interacting with the image, the
        // slider, or the mode/zoom buttons never does.
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen satellite comparison"
    >
      <button
        onClick={onClose}
        aria-label="Close fullscreen view"
        className="glass-hud absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-paper transition-colors hover:border-danger/50 hover:text-danger sm:right-6 sm:top-6"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="max-h-full w-full max-w-[1600px] overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
