import { useMemo, useState } from "react";
import { rivers } from "./data/rivers";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { DisasterBanner } from "./components/DisasterBanner";
import { RiverSelector } from "./components/RiverSelector";
import { CompareViewer } from "./components/CompareViewer";
import { InfoPanel } from "./components/InfoPanel";
import { Footer } from "./components/Footer";

function App() {
  const { theme, toggle } = useTheme();
  const [activeId, setActiveId] = useState(rivers[0].id);
  const activeRiver = useMemo(() => rivers.find((r) => r.id === activeId) ?? rivers[0], [activeId]);

  return (
    <div className="min-h-screen bg-ink text-mist light:bg-paper light:text-ink-3">
      <Header theme={theme} onToggleTheme={toggle} />
      <DisasterBanner />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h2 className="mb-1 font-mono text-[11px] uppercase tracking-widest text-teal">
            Select a waterway
          </h2>
          <RiverSelector rivers={rivers} activeId={activeId} onSelect={setActiveId} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <CompareViewer key={activeRiver.id} river={activeRiver} />
          <InfoPanel river={activeRiver} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
