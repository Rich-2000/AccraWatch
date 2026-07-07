import { useEffect, useState, type ReactNode } from "react";

export function ViewerFrame({ children, scanKey }: { children: ReactNode; scanKey: string }) {
  const [showScan, setShowScan] = useState(true);

  useEffect(() => {
    setShowScan(true);
    const t = setTimeout(() => setShowScan(false), 2500);
    return () => clearTimeout(t);
  }, [scanKey]);

  const ticks = Array.from({ length: 9 });

  return (
    <div className="relative rounded-xl border border-teal-dim/40 bg-ink-2 p-2 shadow-[0_0_0_1px_rgba(47,184,172,0.05)] light:border-paper-3 light:bg-paper-2 sm:p-3">
      {/* corner brackets */}
      {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
        <span
          key={pos}
          className={`pointer-events-none absolute ${pos} h-3.5 w-3.5 border-teal/70 ${
            i === 0 ? "border-l-2 border-t-2 rounded-tl-sm" : ""
          } ${i === 1 ? "border-r-2 border-t-2 rounded-tr-sm" : ""} ${
            i === 2 ? "border-l-2 border-b-2 rounded-bl-sm" : ""
          } ${i === 3 ? "border-r-2 border-b-2 rounded-br-sm" : ""}`}
        />
      ))}

      {/* top tick ruler */}
      <div className="pointer-events-none absolute inset-x-3 top-0.5 hidden h-2 items-end justify-between sm:flex">
        {ticks.map((_, i) => (
          <span key={i} className="w-px bg-teal-dim/50" style={{ height: i % 2 === 0 ? 6 : 3 }} />
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-ink-3 bg-black light:border-paper-3">
        {children}
        {showScan && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-teal/25 via-teal/5 to-transparent animate-scan"
          />
        )}
      </div>
    </div>
  );
}
