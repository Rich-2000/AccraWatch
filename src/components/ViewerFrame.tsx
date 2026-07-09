import { useEffect, useState, type ReactNode } from "react";

export function ViewerFrame({ children, scanKey }: { children: ReactNode; scanKey: string }) {
  const [showScan, setShowScan] = useState(true);

  useEffect(() => {
    setShowScan(true);
    const t = setTimeout(() => setShowScan(false), 2500);
    return () => clearTimeout(t);
  }, [scanKey]);

  const ticks = Array.from({ length: 13 });

  return (
    <div className="glass-panel relative rounded-xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-3">
      {/* corner brackets */}
      {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
        <span
          key={pos}
          className={`pointer-events-none absolute ${pos} h-4 w-4 border-teal/60 ${
            i === 0 ? "border-l-2 border-t-2 rounded-tl-md" : ""
          } ${i === 1 ? "border-r-2 border-t-2 rounded-tr-md" : ""} ${
            i === 2 ? "border-l-2 border-b-2 rounded-bl-md" : ""
          } ${i === 3 ? "border-r-2 border-b-2 rounded-br-md" : ""}`}
        />
      ))}

      {/* top tick ruler */}
      <div className="pointer-events-none absolute inset-x-3 top-0.5 hidden h-2 items-end justify-between sm:flex">
        {ticks.map((_, i) => (
          <span key={i} className="w-px bg-teal-dim/50" style={{ height: i % 2 === 0 ? 6 : 3 }} />
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black light:border-black/10">
        {children}
        {showScan && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-teal/25 via-teal/5 to-transparent animate-scan"
          />
        )}
        {/* corner readout, purely decorative — reinforces the "mission control" feel */}
        <div className="pointer-events-none absolute bottom-2 right-2 hidden rounded border border-white/10 bg-black/50 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-teal/70 backdrop-blur-sm sm:block">
          Feed: SAT_01
        </div>
      </div>
    </div>
  );
}
