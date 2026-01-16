import { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts';
import { Layout } from '@/components/layout';
import { Dashboard, Logbook, Grimoire, Snippets, Profile, Settings } from '@/pages';
import { CommandPalette } from '@/components/CommandPalette';
import { Timer } from '@/components/Timer';
import { SplashScreen } from '@/components/SplashScreen';

function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Export timer setter globally for other components
  useEffect(() => {
    (window as any).openTimer = () => setTimerOpen(true);
    return () => { delete (window as any).openTimer; };
  }, []);

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="grimoire" element={<Grimoire />} />
            <Route path="snippets" element={<Snippets />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bookmarks" element={<ComingSoon title="Bookmarks" />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {timerOpen && <Timer onClose={() => setTimerOpen(false)} />}
      </HashRouter>
    </ThemeProvider>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh',
      color: 'var(--color-text-muted)',
    }}>
      <h1 style={{
        fontSize: '1.8rem',
        marginBottom: '8px',
        color: 'var(--color-text-primary)',
        fontWeight: 600,
      }}>
        {title}
      </h1>
      <p>Em breve...</p>
    </div>
  );
}

export default App;
