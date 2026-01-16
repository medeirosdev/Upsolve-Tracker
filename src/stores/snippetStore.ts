import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import defaultSnippetsData from '@/data/defaultSnippets.json';
import { zustandStorage } from '@/lib/storage';

export interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface SnippetStore {
    snippets: Snippet[];
    addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSnippet: (id: string, updates: Partial<Snippet>) => void;
    deleteSnippet: (id: string) => void;
}

// Load default snippets from JSON and add timestamps
const DEFAULT_SNIPPETS: Snippet[] = defaultSnippetsData.map((snippet) => ({
    ...snippet,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}));

export const useSnippetStore = create<SnippetStore>()(
    persist(
        (set) => ({
            snippets: DEFAULT_SNIPPETS,

            addSnippet: (snippetData) => set((state) => ({
                snippets: [
                    ...state.snippets,
                    {
                        ...snippetData,
                        id: uuidv4(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            })),

            updateSnippet: (id, updates) => set((state) => ({
                snippets: state.snippets.map((s) =>
                    s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
                ),
            })),

            deleteSnippet: (id) => set((state) => ({
                snippets: state.snippets.filter((s) => s.id !== id),
            })),
        }),
        {
            name: 'upsolve-snippets',
            storage: zustandStorage,
        }
    )
);

