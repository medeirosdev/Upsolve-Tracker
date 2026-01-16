/**
 * @file storage.ts
 * @description Unified storage API that uses electron-store in Electron and localStorage in browser.
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */

// Type definition for the Electron API exposed via preload
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

const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron === true;

/**
 * Unified storage interface for both Electron and Browser environments.
 * In Electron: uses electron-store (persistent JSON file)
 * In Browser: uses localStorage
 */
export const storage = {
    /**
     * Check if running in Electron
     */
    isElectron,

    /**
     * Get a value from storage
     */
    async get<T>(key: string, defaultValue: T): Promise<T> {
        if (isElectron && window.electronAPI?.store) {
            const value = await window.electronAPI.store.get(key);
            return (value as T) ?? defaultValue;
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(`upsolve-${key}`);
        if (stored) {
            try {
                return JSON.parse(stored) as T;
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    },

    /**
     * Set a value in storage
     */
    async set<T>(key: string, value: T): Promise<void> {
        if (isElectron && window.electronAPI?.store) {
            await window.electronAPI.store.set(key, value);
            return;
        }

        // Fallback to localStorage
        localStorage.setItem(`upsolve-${key}`, JSON.stringify(value));
    },

    /**
     * Delete a key from storage
     */
    async delete(key: string): Promise<void> {
        if (isElectron && window.electronAPI?.store) {
            await window.electronAPI.store.delete(key);
            return;
        }

        // Fallback to localStorage
        localStorage.removeItem(`upsolve-${key}`);
    },

    /**
     * Clear all storage
     */
    async clear(): Promise<void> {
        if (isElectron && window.electronAPI?.store) {
            await window.electronAPI.store.clear();
            return;
        }

        // Fallback: clear only upsolve keys
        const keys = Object.keys(localStorage).filter(k => k.startsWith('upsolve-'));
        keys.forEach(k => localStorage.removeItem(k));
    },

    /**
     * Get all data (for export/backup)
     */
    async getAll(): Promise<Record<string, unknown>> {
        if (isElectron && window.electronAPI?.store) {
            return await window.electronAPI.store.getAll();
        }

        // Fallback to localStorage
        const data: Record<string, unknown> = {};
        const keys = ['problems', 'notes', 'snippets', 'goals', 'badges'];
        for (const key of keys) {
            const stored = localStorage.getItem(`upsolve-${key}`);
            if (stored) {
                try {
                    data[key] = JSON.parse(stored);
                } catch { /* ignore */ }
            }
        }
        return data;
    },

    /**
     * Synchronous get for initial store hydration (localStorage only)
     * Used during store initialization before async is available
     */
    getSync<T>(key: string, defaultValue: T): T {
        const stored = localStorage.getItem(`upsolve-${key}`);
        if (stored) {
            try {
                return JSON.parse(stored) as T;
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    },
};

/**
 * Zustand persist storage adapter
 * Uses localStorage synchronously but also syncs to electron-store asynchronously
 */
export const zustandStorage = {
    getItem: (name: string): { state: unknown; version?: number } | null => {
        const value = localStorage.getItem(name);

        if (value) {
            try {
                return JSON.parse(value);
            } catch {
                return null;
            }
        }

        // If in Electron, sync from electron-store on first load
        if (isElectron && window.electronAPI?.store) {
            const key = name.replace('upsolve-', '');
            window.electronAPI.store.get(key).then((electronValue) => {
                if (electronValue) {
                    const parsed = { state: { [key.replace('upsolve-', '')]: electronValue }, version: 0 };
                    localStorage.setItem(name, JSON.stringify(parsed));
                }
            });
        }

        return null;
    },

    setItem: (name: string, value: { state: unknown; version?: number }): void => {
        localStorage.setItem(name, JSON.stringify(value));

        // Also persist to electron-store if available
        if (isElectron && window.electronAPI?.store) {
            try {
                const key = name.replace('upsolve-', '');
                if (value.state) {
                    // Extract the actual data from Zustand's wrapper
                    const stateObj = value.state as Record<string, unknown>;
                    const data = stateObj[key] ?? stateObj.problems ?? stateObj.notes ?? stateObj.snippets ?? stateObj;
                    window.electronAPI.store.set(key, data);
                }
            } catch { /* ignore parse errors */ }
        }
    },

    removeItem: (name: string): void => {
        localStorage.removeItem(name);

        // Also remove from electron-store if available
        if (isElectron && window.electronAPI?.store) {
            const key = name.replace('upsolve-', '');
            window.electronAPI.store.delete(key);
        }
    },
};
