import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Type definition for electron API
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      store: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
        getAll: () => Promise<Record<string, unknown>>;
      };
    };
  }
}

// Sync localStorage to electron-store on changes
const STORAGE_KEYS = ['upsolve-problems', 'upsolve-notes', 'upsolve-snippets', 'upsolve-goals', 'upsolve-badges'];

async function syncToElectronStore() {
  if (!window.electronAPI?.store) return;

  for (const key of STORAGE_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        const storeKey = key.replace('upsolve-', '');
        // Zustand wraps state in { state: { ... }, version: 0 }
        const data = parsed.state?.[storeKey] ?? parsed.state ?? parsed;
        await window.electronAPI.store.set(storeKey, data);
      } catch { /* ignore parse errors */ }
    }
  }
}

async function loadFromElectronStore() {
  if (!window.electronAPI?.store) return;

  for (const key of STORAGE_KEYS) {
    const storeKey = key.replace('upsolve-', '');
    const value = await window.electronAPI.store.get(storeKey);
    if (value && !localStorage.getItem(key)) {
      // Only load if localStorage is empty (first run after install)
      const wrapped = { state: { [storeKey]: value }, version: 0 };
      localStorage.setItem(key, JSON.stringify(wrapped));
    }
  }
}

// Load from electron-store on startup (if in Electron)
loadFromElectronStore().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});

// Sync to electron-store before closing (if in Electron)
window.addEventListener('beforeunload', () => {
  syncToElectronStore();
});
