import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Bell, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface TimerProps {
    onClose: () => void;
}

const PRESETS = [
    { label: '25 min', seconds: 25 * 60 },
    { label: '45 min', seconds: 45 * 60 },
    { label: '1 hora', seconds: 60 * 60 },
    { label: '2 horas', seconds: 2 * 60 * 60 },
    { label: 'Custom', seconds: 0 },
];

export function Timer({ onClose }: TimerProps) {
    const [totalSeconds, setTotalSeconds] = useState(25 * 60);
    const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [customMinutes, setCustomMinutes] = useState(25);


    // Timer logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isRunning && remainingSeconds > 0) {
            interval = setInterval(() => {
                setRemainingSeconds((prev) => prev - 1);
            }, 1000);
        } else if (remainingSeconds === 0 && isRunning) {
            setIsRunning(false);
            playAlarm();
            toast.success('⏰ Tempo esgotado! Hora de descansar.', { duration: 10000 });
        }

        return () => clearInterval(interval);
    }, [isRunning, remainingSeconds]);

    const playAlarm = useCallback(() => {
        // Use Web Audio API for notification sound
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();

            // Beep pattern
            setTimeout(() => oscillator.stop(), 200);
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                osc2.connect(gainNode);
                osc2.frequency.value = 800;
                osc2.type = 'sine';
                osc2.start();
                setTimeout(() => osc2.stop(), 200);
            }, 300);
            setTimeout(() => {
                const osc3 = audioContext.createOscillator();
                osc3.connect(gainNode);
                osc3.frequency.value = 1000;
                osc3.type = 'sine';
                osc3.start();
                setTimeout(() => osc3.stop(), 400);
            }, 600);
        } catch {
            // Fallback: browser notification
            if (Notification.permission === 'granted') {
                new Notification('UpSolve Timer', {
                    body: 'Tempo esgotado! Hora de descansar.',
                    icon: '⏰',
                });
            }
        }
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePresetChange = (index: number) => {
        setSelectedPreset(index);
        if (PRESETS[index].seconds > 0) {
            setTotalSeconds(PRESETS[index].seconds);
            setRemainingSeconds(PRESETS[index].seconds);
            setIsRunning(false);
        }
    };

    const handleCustomSet = () => {
        const seconds = customMinutes * 60;
        setTotalSeconds(seconds);
        setRemainingSeconds(seconds);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        if (!isRunning && remainingSeconds === 0) {
            setRemainingSeconds(totalSeconds);
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setRemainingSeconds(totalSeconds);
    };

    const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="timer-overlay" onClick={onClose}>
            <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
                <button className="timer-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="timer-header">
                    <Clock size={24} />
                    <h2>Timer de Sessão</h2>
                </div>

                {/* Circular Progress */}
                <div className="timer-circle-container">
                    <svg className="timer-circle" viewBox="0 0 200 200">
                        <circle
                            className="timer-bg"
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            strokeWidth="8"
                        />
                        <circle
                            className="timer-progress"
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                    <div className="timer-display">
                        <span className="timer-time">{formatTime(remainingSeconds)}</span>
                        <span className="timer-label">{isRunning ? 'Em andamento' : 'Pausado'}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="timer-controls">
                    <button className="timer-btn secondary" onClick={resetTimer}>
                        <RotateCcw size={20} />
                    </button>
                    <button className={`timer-btn primary ${isRunning ? 'pause' : ''}`} onClick={toggleTimer}>
                        {isRunning ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button className="timer-btn secondary" onClick={playAlarm}>
                        <Bell size={20} />
                    </button>
                </div>

                {/* Presets */}
                <div className="timer-presets">
                    {PRESETS.map((preset, i) => (
                        <button
                            key={i}
                            className={`preset-btn ${selectedPreset === i ? 'active' : ''}`}
                            onClick={() => handlePresetChange(i)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom Input */}
                {selectedPreset === PRESETS.length - 1 && (
                    <div className="timer-custom">
                        <input
                            type="number"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            max={999}
                        />
                        <span>minutos</span>
                        <button onClick={handleCustomSet}>Definir</button>
                    </div>
                )}

                <style>{`
          .timer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 150ms ease;
          }

          .timer-modal {
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: 32px;
            width: 100%;
            max-width: 380px;
            text-align: center;
            position: relative;
            animation: slideUp 200ms ease;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .timer-close {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 8px;
            background: var(--color-bg-tertiary);
            border: none;
            border-radius: var(--radius-md);
            color: var(--color-text-muted);
            cursor: pointer;
          }

          .timer-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 24px;
          }

          .timer-header h2 {
            font-size: 1.2rem;
            font-weight: 600;
          }

          .timer-circle-container {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 auto 28px;
          }

          .timer-circle {
            width: 100%;
            height: 100%;
          }

          .timer-bg {
            stroke: var(--color-bg-tertiary);
          }

          .timer-progress {
            stroke: var(--color-accent-primary);
            stroke-linecap: round;
            transition: stroke-dashoffset 1s linear;
          }

          .timer-display {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .timer-time {
            font-size: 2.5rem;
            font-weight: 700;
            font-family: var(--font-mono);
            letter-spacing: -0.02em;
          }

          .timer-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-top: 4px;
          }

          .timer-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }

          .timer-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .timer-btn.primary {
            width: 64px;
            height: 64px;
            background: var(--color-accent-gradient);
            color: white;
          }

          .timer-btn.primary:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-glow);
          }

          .timer-btn.primary.pause {
            background: var(--color-warning);
          }

          .timer-btn.secondary {
            width: 48px;
            height: 48px;
            background: var(--color-bg-tertiary);
            color: var(--color-text-secondary);
          }

          .timer-btn.secondary:hover {
            background: var(--color-bg-hover);
            color: var(--color-text-primary);
          }

          .timer-presets {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
          }

          .preset-btn {
            padding: 8px 16px;
            background: var(--color-bg-tertiary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-full);
            color: var(--color-text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .preset-btn:hover {
            background: var(--color-bg-hover);
          }

          .preset-btn.active {
            background: var(--color-accent-primary);
            border-color: var(--color-accent-primary);
            color: white;
          }

          .timer-custom {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .timer-custom input {
            width: 80px;
            padding: 10px 12px;
            background: var(--color-bg-tertiary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-primary);
            font-size: 1rem;
            text-align: center;
          }

          .timer-custom span {
            color: var(--color-text-muted);
            font-size: 0.9rem;
          }

          .timer-custom button {
            padding: 10px 18px;
            background: var(--color-accent-gradient);
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-weight: 500;
            cursor: pointer;
          }
        `}</style>
            </div>
        </div>
    );
}
