import type { Theme } from "../hooks/useTheme";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-teal-dim/25 bg-ink/85 backdrop-blur-md light:border-paper-3 light:bg-paper/90">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal/40 bg-ink-2 light:bg-paper-2">
            <img
              src="/images/logo.png"
              alt="Accra Water Watch logo"
              className="h-7 w-7 object-contain"
              width={28}
              height={28}
            />
          </div>
          <div>
            <h1 className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight text-paper light:text-ink">
              Accra Water Watch
            </h1>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-teal">
              Satellite Change Monitor · GH-GA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
