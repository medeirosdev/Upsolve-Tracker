import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Badge definitions
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji
    category: 'milestone' | 'streak' | 'skill' | 'special' | 'custom';
    requirement: {
        type: 'problems_solved' | 'streak_days' | 'ac_count' | 'tag_count' | 'total_problems' | 'notes_count' | 'custom';
        value: number;
        tag?: string;
    };
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: string;
    isCustom?: boolean;
}

// Pre-defined badges
export const DEFAULT_BADGES: Omit<Badge, 'unlockedAt'>[] = [
    // === MILESTONES ===
    { id: 'first-blood', name: 'First Blood', description: 'Resolva sua primeira questão', icon: '🎯', category: 'milestone', requirement: { type: 'problems_solved', value: 1 }, rarity: 'common' },
    { id: 'getting-started', name: 'Começando', description: 'Resolva 5 questões', icon: '🌱', category: 'milestone', requirement: { type: 'problems_solved', value: 5 }, rarity: 'common' },
    { id: 'double-digits', name: 'Double Digits', description: 'Resolva 10 questões', icon: '🔟', category: 'milestone', requirement: { type: 'problems_solved', value: 10 }, rarity: 'common' },
    { id: 'quarter-century', name: 'Quarter Century', description: 'Resolva 25 questões', icon: '🎖️', category: 'milestone', requirement: { type: 'problems_solved', value: 25 }, rarity: 'rare' },
    { id: 'half-century', name: 'Half Century', description: 'Resolva 50 questões', icon: '🏅', category: 'milestone', requirement: { type: 'problems_solved', value: 50 }, rarity: 'rare' },
    { id: 'centurion', name: 'Centurion', description: 'Resolva 100 questões', icon: '💯', category: 'milestone', requirement: { type: 'problems_solved', value: 100 }, rarity: 'epic' },
    { id: 'grinder', name: 'Grinder', description: 'Resolva 200 questões', icon: '⚙️', category: 'milestone', requirement: { type: 'problems_solved', value: 200 }, rarity: 'epic' },
    { id: 'veteran', name: 'Veteran', description: 'Resolva 500 questões', icon: '🎗️', category: 'milestone', requirement: { type: 'problems_solved', value: 500 }, rarity: 'legendary' },
    { id: 'grandmaster', name: 'Grandmaster', description: 'Resolva 1000 questões', icon: '👑', category: 'milestone', requirement: { type: 'problems_solved', value: 1000 }, rarity: 'legendary' },

    // === STREAKS ===
    { id: 'streak-3', name: 'On Fire', description: '3 dias seguidos', icon: '🔥', category: 'streak', requirement: { type: 'streak_days', value: 3 }, rarity: 'common' },
    { id: 'streak-7', name: 'Week Warrior', description: '7 dias seguidos', icon: '📅', category: 'streak', requirement: { type: 'streak_days', value: 7 }, rarity: 'rare' },
    { id: 'streak-14', name: 'Fortnight Fighter', description: '14 dias seguidos', icon: '⚔️', category: 'streak', requirement: { type: 'streak_days', value: 14 }, rarity: 'rare' },
    { id: 'streak-30', name: 'Monthly Master', description: '30 dias seguidos', icon: '🗓️', category: 'streak', requirement: { type: 'streak_days', value: 30 }, rarity: 'epic' },
    { id: 'streak-60', name: 'Discipline God', description: '60 dias seguidos', icon: '🧘', category: 'streak', requirement: { type: 'streak_days', value: 60 }, rarity: 'epic' },
    { id: 'streak-100', name: 'Unstoppable', description: '100 dias seguidos', icon: '💎', category: 'streak', requirement: { type: 'streak_days', value: 100 }, rarity: 'legendary' },
    { id: 'streak-365', name: 'Year of Code', description: '365 dias seguidos', icon: '🏆', category: 'streak', requirement: { type: 'streak_days', value: 365 }, rarity: 'legendary' },

    // === AC MILESTONES ===
    { id: 'first-ac', name: 'Accepted!', description: 'Primeiro AC', icon: '✅', category: 'milestone', requirement: { type: 'ac_count', value: 1 }, rarity: 'common' },
    { id: 'ac-10', name: 'Green Machine', description: '10 ACs', icon: '🟢', category: 'milestone', requirement: { type: 'ac_count', value: 10 }, rarity: 'common' },
    { id: 'ac-50', name: 'AC Collector', description: '50 ACs', icon: '🎯', category: 'milestone', requirement: { type: 'ac_count', value: 50 }, rarity: 'rare' },
    { id: 'ac-100', name: 'AC Hunter', description: '100 ACs', icon: '🎖️', category: 'milestone', requirement: { type: 'ac_count', value: 100 }, rarity: 'epic' },
    { id: 'ac-500', name: 'AC Legend', description: '500 ACs', icon: '🌟', category: 'milestone', requirement: { type: 'ac_count', value: 500 }, rarity: 'legendary' },

    // === SKILL BADGES (by tag) ===
    { id: 'dp-beginner', name: 'DP Initiate', description: '5 questões de DP', icon: '📊', category: 'skill', requirement: { type: 'tag_count', value: 5, tag: 'dp' }, rarity: 'common' },
    { id: 'dp-master', name: 'DP Master', description: '25 questões de DP', icon: '📈', category: 'skill', requirement: { type: 'tag_count', value: 25, tag: 'dp' }, rarity: 'epic' },
    { id: 'graph-beginner', name: 'Graph Explorer', description: '5 questões de grafos', icon: '🕸️', category: 'skill', requirement: { type: 'tag_count', value: 5, tag: 'graphs' }, rarity: 'common' },
    { id: 'graph-master', name: 'Graph Architect', description: '25 questões de grafos', icon: '🏗️', category: 'skill', requirement: { type: 'tag_count', value: 25, tag: 'graphs' }, rarity: 'epic' },
    { id: 'math-beginner', name: 'Math Enthusiast', description: '5 questões de math', icon: '🔢', category: 'skill', requirement: { type: 'tag_count', value: 5, tag: 'math' }, rarity: 'common' },
    { id: 'math-master', name: 'Mathematician', description: '25 questões de math', icon: '🧮', category: 'skill', requirement: { type: 'tag_count', value: 25, tag: 'math' }, rarity: 'epic' },
    { id: 'greedy-beginner', name: 'Greedy Thinker', description: '5 questões greedy', icon: '💡', category: 'skill', requirement: { type: 'tag_count', value: 5, tag: 'greedy' }, rarity: 'common' },
    { id: 'greedy-master', name: 'Optimization Guru', description: '25 questões greedy', icon: '⚡', category: 'skill', requirement: { type: 'tag_count', value: 25, tag: 'greedy' }, rarity: 'epic' },
    { id: 'binary-search-pro', name: 'Binary Search Pro', description: '10 questões de binary search', icon: '🔍', category: 'skill', requirement: { type: 'tag_count', value: 10, tag: 'binary-search' }, rarity: 'rare' },
    { id: 'tree-climber', name: 'Tree Climber', description: '10 questões de trees', icon: '🌳', category: 'skill', requirement: { type: 'tag_count', value: 10, tag: 'trees' }, rarity: 'rare' },
    { id: 'string-master', name: 'String Maestro', description: '15 questões de strings', icon: '🎻', category: 'skill', requirement: { type: 'tag_count', value: 15, tag: 'strings' }, rarity: 'rare' },
    { id: 'segment-tree-pro', name: 'Segment Tree Pro', description: '5 questões de segment tree', icon: '🌲', category: 'skill', requirement: { type: 'tag_count', value: 5, tag: 'segment-tree' }, rarity: 'epic' },

    // === SPECIAL ===
    { id: 'note-taker', name: 'Note Taker', description: 'Crie sua primeira nota', icon: '📝', category: 'special', requirement: { type: 'notes_count', value: 1 }, rarity: 'common' },
    { id: 'knowledge-base', name: 'Knowledge Base', description: 'Crie 10 notas', icon: '📚', category: 'special', requirement: { type: 'notes_count', value: 10 }, rarity: 'rare' },
    { id: 'grimoire-master', name: 'Grimoire Master', description: 'Crie 50 notas', icon: '📖', category: 'special', requirement: { type: 'notes_count', value: 50 }, rarity: 'epic' },
    { id: 'early-bird', name: 'Early Bird', description: 'Resolva antes das 8h', icon: '🐦', category: 'special', requirement: { type: 'custom', value: 1 }, rarity: 'rare' },
    { id: 'night-owl', name: 'Night Owl', description: 'Resolva após meia-noite', icon: '🦉', category: 'special', requirement: { type: 'custom', value: 1 }, rarity: 'rare' },
    { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Resolva 10 questões no fim de semana', icon: '🎮', category: 'special', requirement: { type: 'custom', value: 10 }, rarity: 'rare' },
];

interface BadgeStore {
    unlockedBadges: string[]; // Array of badge IDs
    customBadges: Badge[];
    totalXP: number;
    level: number;

    unlockBadge: (badgeId: string) => void;
    addCustomBadge: (badge: Omit<Badge, 'id' | 'unlockedAt' | 'isCustom'>) => void;
    deleteCustomBadge: (badgeId: string) => void;
    addXP: (amount: number) => void;
    checkAndUnlockBadges: (stats: {
        problemsSolved: number;
        acCount: number;
        streakDays: number;
        notesCount: number;
        tagCounts: Record<string, number>;
    }) => string[]; // Returns newly unlocked badge IDs
}

const XP_PER_LEVEL = 100;

export const useBadgeStore = create<BadgeStore>()(
    persist(
        (set, get) => ({
            unlockedBadges: [],
            customBadges: [],
            totalXP: 0,
            level: 1,

            unlockBadge: (badgeId) => set((state) => {
                if (state.unlockedBadges.includes(badgeId)) return state;
                return { unlockedBadges: [...state.unlockedBadges, badgeId] };
            }),

            addCustomBadge: (badge) => set((state) => ({
                customBadges: [...state.customBadges, {
                    ...badge,
                    id: uuidv4(),
                    isCustom: true,
                }],
            })),

            deleteCustomBadge: (badgeId) => set((state) => ({
                customBadges: state.customBadges.filter(b => b.id !== badgeId),
                unlockedBadges: state.unlockedBadges.filter(id => id !== badgeId),
            })),

            addXP: (amount) => set((state) => {
                const newXP = state.totalXP + amount;
                const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
                return { totalXP: newXP, level: newLevel };
            }),

            checkAndUnlockBadges: (stats) => {
                const state = get();
                const newlyUnlocked: string[] = [];
                const allBadges = [...DEFAULT_BADGES, ...state.customBadges];

                allBadges.forEach((badge) => {
                    if (state.unlockedBadges.includes(badge.id)) return;

                    let shouldUnlock = false;

                    switch (badge.requirement.type) {
                        case 'problems_solved':
                            shouldUnlock = stats.problemsSolved >= badge.requirement.value;
                            break;
                        case 'ac_count':
                            shouldUnlock = stats.acCount >= badge.requirement.value;
                            break;
                        case 'streak_days':
                            shouldUnlock = stats.streakDays >= badge.requirement.value;
                            break;
                        case 'notes_count':
                            shouldUnlock = stats.notesCount >= badge.requirement.value;
                            break;
                        case 'tag_count':
                            if (badge.requirement.tag) {
                                const tagCount = stats.tagCounts[badge.requirement.tag] || 0;
                                shouldUnlock = tagCount >= badge.requirement.value;
                            }
                            break;
                    }

                    if (shouldUnlock) {
                        newlyUnlocked.push(badge.id);
                        state.unlockBadge(badge.id);

                        // Add XP based on rarity
                        const xpReward = badge.rarity === 'legendary' ? 50 :
                            badge.rarity === 'epic' ? 30 :
                                badge.rarity === 'rare' ? 20 : 10;
                        state.addXP(xpReward);
                    }
                });

                return newlyUnlocked;
            },
        }),
        {
            name: 'upsolve-badges',
        }
    )
);

// Helper to get badge by ID
export const getBadgeById = (id: string, customBadges: Badge[] = []): Badge | undefined => {
    return DEFAULT_BADGES.find(b => b.id === id) || customBadges.find(b => b.id === id);
};

// Get rarity color
export const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
        case 'legendary': return '#ffd700';
        case 'epic': return '#a855f7';
        case 'rare': return '#3b82f6';
        default: return '#6b7280';
    }
};

// Get rarity gradient
export const getRarityGradient = (rarity: Badge['rarity']): string => {
    switch (rarity) {
        case 'legendary': return 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)';
        case 'epic': return 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)';
        case 'rare': return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
        default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
};
