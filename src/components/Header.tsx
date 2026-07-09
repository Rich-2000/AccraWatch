import type { Theme } from "../hooks/useTheme";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="glass-hud sticky top-0 z-40 border-b border-white/10 light:border-black/10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal/30 bg-ink-2/80 shadow-[0_0_16px_rgba(0,209,255,0.12)] light:bg-paper-2">
            <img
              src="/images/logo.png"
              alt="Accra Water Watch logo"
              className="h-7 w-7 object-contain"
              width={28}
              height={28}
            />
          </div>
          <div>
            <h1 className="font-display text-[1.05rem] font-bold leading-tight tracking-tight text-paper light:text-ink">
              Accra Water Watch
            </h1>
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-teal">
              <span className="h-1 w-1 rounded-full bg-teal shadow-[0_0_6px_var(--color-teal)]" />
              Satellite Change Monitor · GH-GA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-mist/70 md:flex light:border-black/10 light:bg-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            Live monitoring
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
