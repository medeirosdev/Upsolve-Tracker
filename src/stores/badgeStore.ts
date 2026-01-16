import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import defaultBadgesData from '@/data/defaultBadges.json';
import { zustandStorage } from '@/lib/storage';

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

// Load badges from JSON with proper typing
export const DEFAULT_BADGES: Omit<Badge, 'unlockedAt'>[] = defaultBadgesData as Omit<Badge, 'unlockedAt'>[];

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
            storage: zustandStorage,
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
