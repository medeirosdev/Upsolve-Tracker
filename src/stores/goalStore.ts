import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';

export interface Goal {
    id: string;
    type: 'daily' | 'weekly';
    target: number;
    current: number;
    startDate: string;
    endDate: string;
    completed: boolean;
}

interface GoalStore {
    dailyTarget: number;
    weeklyTarget: number;
    completedDays: string[]; // Array of date strings when daily goal was completed
    weeklyCompletions: number; // Total weeks completed
    setDailyTarget: (target: number) => void;
    setWeeklyTarget: (target: number) => void;
    markDayComplete: (date: string) => void;
    incrementWeeklyCompletions: () => void;
    getTotalCompletedDays: () => number;
}

export const useGoalStore = create<GoalStore>()(
    persist(
        (set, get) => ({
            dailyTarget: 3,
            weeklyTarget: 15,
            completedDays: [],
            weeklyCompletions: 0,

            setDailyTarget: (target) => set({ dailyTarget: target }),
            setWeeklyTarget: (target) => set({ weeklyTarget: target }),

            markDayComplete: (date) => set((state) => {
                if (!state.completedDays.includes(date)) {
                    return { completedDays: [...state.completedDays, date] };
                }
                return state;
            }),

            incrementWeeklyCompletions: () => set((state) => ({
                weeklyCompletions: state.weeklyCompletions + 1,
            })),

            getTotalCompletedDays: () => get().completedDays.length,
        }),
        {
            name: 'upsolve-goals',
            storage: zustandStorage,
        }
    )
);

// Helper functions
export const isToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
};

export const getWeekStart = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
};

export const getWeekEnd = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
    const sunday = new Date(now.setDate(diff));
    return sunday.toISOString().split('T')[0];
};
