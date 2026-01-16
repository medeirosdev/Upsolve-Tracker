/**
 * @file useSounds.ts
 * @description Custom hook for playing sound effects using Web Audio API synthesis.
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */

// Audio context (lazy initialization)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

// Check if sounds are enabled (defaults to true)
function isSoundEnabled(): boolean {
    const stored = localStorage.getItem('upsolve-sound-enabled');
    return stored === null ? true : stored === 'true';
}

// Set sound enabled state
export function setSoundEnabled(enabled: boolean): void {
    localStorage.setItem('upsolve-sound-enabled', String(enabled));
}

// Get sound enabled state  
export function getSoundEnabled(): boolean {
    return isSoundEnabled();
}

/**
 * Play a zen bell sound (for timer completion)
 */
function playBellSound(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillator for bell tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Bell-like frequency
    osc.frequency.setValueAtTime(830, now); // A5
    osc.type = 'sine';

    // Bell envelope (quick attack, long decay)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

    osc.start(now);
    osc.stop(now + 2);
}

/**
 * Play a success chime (for AC status)
 */
function playSuccessSound(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play ascending arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, now);
        osc.type = 'sine';

        const noteStart = now + i * 0.1;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

        osc.start(noteStart);
        osc.stop(noteStart + 0.4);
    });
}

/**
 * Play a fanfare sound (for badge unlock)
 */
function playFanfareSound(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play triumphant fanfare pattern
    const pattern = [
        { freq: 523.25, time: 0, duration: 0.15 },     // C5
        { freq: 659.25, time: 0.15, duration: 0.15 },  // E5
        { freq: 783.99, time: 0.30, duration: 0.15 },  // G5
        { freq: 1046.50, time: 0.45, duration: 0.5 },  // C6 (hold)
    ];

    pattern.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, now + time);
        osc.type = 'triangle';

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.start(now + time);
        osc.stop(now + time + duration);
    });
}

// Sound player functions
export function playTimerComplete(): void {
    if (!isSoundEnabled()) return;
    try {
        playBellSound();
    } catch { /* ignore errors */ }
}

export function playSuccess(): void {
    if (!isSoundEnabled()) return;
    try {
        playSuccessSound();
    } catch { /* ignore errors */ }
}

export function playBadgeUnlock(): void {
    if (!isSoundEnabled()) return;
    try {
        playFanfareSound();
    } catch { /* ignore errors */ }
}

// React hook for sound effects
export function useSounds() {
    return {
        playTimerComplete,
        playSuccess,
        playBadgeUnlock,
        isSoundEnabled: getSoundEnabled,
        setSoundEnabled,
    };
}
