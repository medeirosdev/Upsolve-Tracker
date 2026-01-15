import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Note } from '@/types';

interface NoteState {
    notes: Note[];
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    getNotesByTag: (tag: string) => Note[];
    getNotesByCategory: (category: string) => Note[];
    searchNotes: (query: string) => Note[];
}

export const useNoteStore = create<NoteState>()(
    persist(
        (set, get) => ({
            notes: [],

            addNote: (noteData) => {
                const now = new Date().toISOString();
                const newNote: Note = {
                    ...noteData,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ notes: [...state.notes, newNote] }));
            },

            updateNote: (id, updates) => {
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id
                            ? { ...n, ...updates, updatedAt: new Date().toISOString() }
                            : n
                    ),
                }));
            },

            deleteNote: (id) => {
                set((state) => ({
                    notes: state.notes.filter((n) => n.id !== id),
                }));
            },

            getNotesByTag: (tag) => {
                return get().notes.filter((n) => n.tags.includes(tag));
            },

            getNotesByCategory: (category) => {
                return get().notes.filter((n) => n.category === category);
            },

            searchNotes: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().notes.filter(
                    (n) =>
                        n.title.toLowerCase().includes(lowerQuery) ||
                        n.content.toLowerCase().includes(lowerQuery)
                );
            },
        }),
        {
            name: 'upsolve-notes',
        }
    )
);
