import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Problem, ProblemStatus, Platform } from '@/types';
import { zustandStorage } from '@/lib/storage';

interface ProblemState {
    problems: Problem[];
    addProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
    updateProblem: (id: string, updates: Partial<Problem>) => void;
    deleteProblem: (id: string) => void;
}

export const useProblemStore = create<ProblemState>()(
    persist(
        (set) => ({
            problems: [],

            addProblem: (problemData) => {
                const newProblem: Problem = {
                    ...problemData,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    solvedAt: problemData.status === 'AC' ? new Date().toISOString() : undefined,
                };
                set((state) => ({ problems: [...state.problems, newProblem] }));
            },

            updateProblem: (id, updates) => {
                set((state) => ({
                    problems: state.problems.map((p) =>
                        p.id === id
                            ? {
                                ...p,
                                ...updates,
                                solvedAt: updates.status === 'AC' ? new Date().toISOString() : p.solvedAt,
                            }
                            : p
                    ),
                }));
            },

            deleteProblem: (id) => {
                set((state) => ({
                    problems: state.problems.filter((p) => p.id !== id),
                }));
            },
        }),
        {
            name: 'upsolve-problems',
            storage: zustandStorage,
        }
    )
);

// Helper functions (use outside of React render)
export function getProblemsByDate(problems: Problem[], date: string) {
    return problems.filter((p) => p.createdAt.startsWith(date));
}

export function getProblemsByTag(problems: Problem[], tag: string) {
    return problems.filter((p) => p.tags.includes(tag));
}

export function getProblemsByStatus(problems: Problem[], status: ProblemStatus) {
    return problems.filter((p) => p.status === status);
}

export function getProblemsByPlatform(problems: Problem[], platform: Platform) {
    return problems.filter((p) => p.platform === platform);
}

export function getStreak(problems: Problem[]): number {
    if (problems.length === 0) return 0;

    const dates = [...new Set(
        problems.map((p) => p.createdAt.split('T')[0])
    )].sort().reverse();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (dates.includes(expectedDateStr)) {
            streak++;
        } else if (i === 0) {
            continue;
        } else {
            break;
        }
    }

    return streak;
}

export function getTodayCount(problems: Problem[]): number {
    const today = new Date().toISOString().split('T')[0];
    return problems.filter((p) => p.createdAt.startsWith(today)).length;
}

export function getWeeklyStats(problems: Problem[]): { total: number; ac: number } {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekProblems = problems.filter(
        (p) => new Date(p.createdAt) >= weekAgo
    );

    return {
        total: weekProblems.length,
        ac: weekProblems.filter((p) => p.status === 'AC').length,
    };
}
