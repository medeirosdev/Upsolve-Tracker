// Problem Types
export type ProblemStatus = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'DOING';
export type Platform = 'Codeforces' | 'LeetCode' | 'Beecrowd' | 'AtCoder' | 'Other';

export interface Problem {
    id: string;
    title: string;
    platform: Platform;
    link?: string;
    difficulty?: number;
    status: ProblemStatus;
    tags: string[];
    timeSpent?: number; // minutes
    quickNotes?: string;
    linkedNoteId?: string;
    createdAt: string;
    solvedAt?: string;
}

// Note Types
export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category?: string;
    createdAt: string;
    updatedAt: string;
}

// Snippet Types
export interface Snippet {
    id: string;
    title: string;
    language: 'cpp' | 'python' | 'java' | 'javascript';
    code: string;
    category?: string;
    createdAt: string;
}

// Bookmark Types
export interface Bookmark {
    id: string;
    title: string;
    url: string;
    category?: string;
    createdAt: string;
}

// Goal Types
export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface Goal {
    id: string;
    type: GoalType;
    target: number;
    current: number;
    startDate: string;
    endDate: string;
}

// Stats Types
export interface DailyStats {
    date: string;
    count: number;
    acCount: number;
}

export interface TagStats {
    tag: string;
    total: number;
    acCount: number;
}
