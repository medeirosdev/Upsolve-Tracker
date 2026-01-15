import { useState, useMemo, useEffect } from 'react';
import { Target, Trophy, Flame, Settings, X, Check } from 'lucide-react';
import { useGoalStore, useProblemStore, getTodayCount, getWeeklyStats } from '@/stores';
import toast from 'react-hot-toast';

export function GoalsWidget() {
    const problems = useProblemStore((state) => state.problems);
    const { dailyTarget, weeklyTarget, setDailyTarget, setWeeklyTarget, completedDays, markDayComplete } = useGoalStore();

    const [showSettings, setShowSettings] = useState(false);
    const [tempDaily, setTempDaily] = useState(dailyTarget);
    const [tempWeekly, setTempWeekly] = useState(weeklyTarget);

    const todayCount = useMemo(() => getTodayCount(problems), [problems]);
    const weeklyStats = useMemo(() => getWeeklyStats(problems), [problems]);

    const dailyProgress = Math.min((todayCount / dailyTarget) * 100, 100);
    const weeklyProgress = Math.min((weeklyStats.total / weeklyTarget) * 100, 100);

    const dailyComplete = todayCount >= dailyTarget;
    const weeklyComplete = weeklyStats.total >= weeklyTarget;

    const today = new Date().toISOString().split('T')[0];
    const alreadyMarked = completedDays.includes(today);

    // Auto-mark day as complete
    useEffect(() => {
        if (dailyComplete && !alreadyMarked) {
            markDayComplete(today);
            toast.success('🎉 Meta diária alcançada!', { duration: 4000 });
        }
    }, [dailyComplete, alreadyMarked, markDayComplete, today]);

    // Notify weekly completion
    useEffect(() => {
        if (weeklyComplete && weeklyStats.total === weeklyTarget) {
            toast.success('🏆 Meta semanal alcançada!', { duration: 4000 });
        }
    }, [weeklyComplete, weeklyStats.total, weeklyTarget]);

    const handleSaveSettings = () => {
        setDailyTarget(tempDaily);
        setWeeklyTarget(tempWeekly);
        setShowSettings(false);
        toast.success('Metas atualizadas!');
    };

    return (
        <div className="goals-widget">
            <div className="goals-header">
                <div className="goals-title">
                    <Target size={18} />
                    <span>Metas</span>
                </div>
                <button className="goals-settings-btn" onClick={() => setShowSettings(true)}>
                    <Settings size={16} />
                </button>
            </div>

            {/* Daily Goal */}
            <div className={`goal-card ${dailyComplete ? 'complete' : ''}`}>
                <div className="goal-info">
                    <div className="goal-icon daily">
                        {dailyComplete ? <Check size={20} /> : <Flame size={20} />}
                    </div>
                    <div className="goal-text">
                        <span className="goal-label">Hoje</span>
                        <span className="goal-count">
                            <strong>{todayCount}</strong> / {dailyTarget}
                        </span>
                    </div>
                </div>
                <div className="goal-progress-bar">
                    <div
                        className="goal-progress-fill daily"
                        style={{ width: `${dailyProgress}%` }}
                    />
                </div>
                {dailyComplete && (
                    <div className="goal-badge">
                        <Trophy size={12} />
                        Completo!
                    </div>
                )}
            </div>

            {/* Weekly Goal */}
            <div className={`goal-card ${weeklyComplete ? 'complete' : ''}`}>
                <div className="goal-info">
                    <div className="goal-icon weekly">
                        {weeklyComplete ? <Check size={20} /> : <Trophy size={20} />}
                    </div>
                    <div className="goal-text">
                        <span className="goal-label">Semana</span>
                        <span className="goal-count">
                            <strong>{weeklyStats.total}</strong> / {weeklyTarget}
                        </span>
                    </div>
                </div>
                <div className="goal-progress-bar">
                    <div
                        className="goal-progress-fill weekly"
                        style={{ width: `${weeklyProgress}%` }}
                    />
                </div>
                {weeklyComplete && (
                    <div className="goal-badge gold">
                        <Trophy size={12} />
                        Completo!
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="goals-stats">
                <div className="stat">
                    <span className="stat-value">{completedDays.length}</span>
                    <span className="stat-label">Dias ativos</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{weeklyStats.ac}</span>
                    <span className="stat-label">ACs semana</span>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="goals-modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="goals-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Configurar Metas</h3>
                            <button onClick={() => setShowSettings(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="setting-group">
                                <label>Meta Diária</label>
                                <div className="setting-input">
                                    <button onClick={() => setTempDaily(Math.max(1, tempDaily - 1))}>-</button>
                                    <span>{tempDaily}</span>
                                    <button onClick={() => setTempDaily(tempDaily + 1)}>+</button>
                                </div>
                                <p>Questões por dia</p>
                            </div>

                            <div className="setting-group">
                                <label>Meta Semanal</label>
                                <div className="setting-input">
                                    <button onClick={() => setTempWeekly(Math.max(1, tempWeekly - 5))}>-</button>
                                    <span>{tempWeekly}</span>
                                    <button onClick={() => setTempWeekly(tempWeekly + 5)}>+</button>
                                </div>
                                <p>Questões por semana</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowSettings(false)}>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={handleSaveSettings}>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .goals-widget {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
        }

        .goals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .goals-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 1rem;
        }

        .goals-settings-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .goals-settings-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .goal-card {
          padding: 14px 16px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          margin-bottom: 10px;
          position: relative;
          transition: all var(--transition-fast);
        }

        .goal-card.complete {
          background: var(--color-success-bg);
          border: 1px solid var(--color-success);
        }

        .goal-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .goal-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .goal-icon.daily {
          background: var(--color-warning-bg);
          color: var(--color-warning);
        }

        .goal-icon.weekly {
          background: var(--color-info-bg);
          color: var(--color-info);
        }

        .goal-card.complete .goal-icon {
          background: var(--color-success);
          color: white;
        }

        .goal-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .goal-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .goal-count {
          font-size: 0.9rem;
        }

        .goal-count strong {
          font-size: 1.1rem;
        }

        .goal-progress-bar {
          height: 6px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .goal-progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .goal-progress-fill.daily {
          background: linear-gradient(90deg, var(--color-warning) 0%, #e9b84a 100%);
        }

        .goal-progress-fill.weekly {
          background: linear-gradient(90deg, var(--color-info) 0%, #6bb5e0 100%);
        }

        .goal-card.complete .goal-progress-fill {
          background: var(--color-success);
        }

        .goal-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--color-success);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 600;
        }

        .goal-badge.gold {
          background: linear-gradient(135deg, #f9a825 0%, #ff6f00 100%);
        }

        .goals-stats {
          display: flex;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
        }

        .goals-stats .stat {
          flex: 1;
          text-align: center;
        }

        .goals-stats .stat-value {
          display: block;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .goals-stats .stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Settings Modal */
        .goals-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .goals-modal {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 360px;
          animation: slideDown 150ms ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .goals-modal .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .goals-modal .modal-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .goals-modal .modal-header button {
          padding: 6px;
          background: var(--color-bg-tertiary);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .goals-modal .modal-body {
          padding: 24px 20px;
        }

        .setting-group {
          margin-bottom: 24px;
        }

        .setting-group:last-child {
          margin-bottom: 0;
        }

        .setting-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .setting-input {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .setting-input button {
          width: 40px;
          height: 40px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .setting-input button:hover {
          background: var(--color-bg-hover);
        }

        .setting-input span {
          font-size: 1.5rem;
          font-weight: 700;
          min-width: 50px;
          text-align: center;
        }

        .setting-group p {
          text-align: center;
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .goals-modal .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
        }

        .btn-primary {
          padding: 10px 20px;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}
