/**
 * @file Dashboard.tsx
 * @description The main landing page of the application used to display user statistics, streak status, and recent activity.
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProblemStore, useNoteStore, getStreak, getTodayCount, getWeeklyStats } from '@/stores';
import { GoalsWidget } from '@/components/GoalsWidget';
import {
    TrendingUp,
    CheckCircle,
    Target,
    Flame,
    Clock,
    Calendar,
    BookOpen,
    ArrowRight,
    FileText,
    Sparkles
} from 'lucide-react';

export function Dashboard() {
    const problems = useProblemStore((state) => state.problems);
    const notes = useNoteStore((state) => state.notes);

    const streak = useMemo(() => getStreak(problems), [problems]);
    const todayCount = useMemo(() => getTodayCount(problems), [problems]);
    const weeklyStats = useMemo(() => getWeeklyStats(problems), [problems]);

    const totalAC = useMemo(() =>
        problems.filter((p) => p.status === 'AC').length,
        [problems]
    );

    const accuracy = problems.length > 0
        ? Math.round((totalAC / problems.length) * 100)
        : 0;

    const recentNote = notes.length > 0 ? notes[notes.length - 1] : null;

    const topTags = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        problems.forEach((p) => {
            p.tags.forEach((tag) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [problems]);

    // Heatmap data (12 weeks)
    const heatmapData = useMemo(() => {
        const data: { date: string; count: number }[] = [];
        const today = new Date();

        for (let i = 83; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = problems.filter(p => p.createdAt.startsWith(dateStr)).length;
            data.push({ date: dateStr, count });
        }
        return data;
    }, [problems]);

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header animate-fade-in">
                <div className="header-text">
                    <h1>Bom dia! ☀️</h1>
                    <p>Vamos continuar evoluindo hoje?</p>
                </div>
                <div className="header-date">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}</span>
                </div>
            </header>

            {/* Hero Stats */}
            <div className="hero-stats animate-fade-in delay-1">
                <div className="hero-card hero-today">
                    <div className="hero-icon">
                        <Sparkles size={28} />
                    </div>
                    <div className="hero-content">
                        <span className="hero-value">{todayCount}</span>
                        <span className="hero-label">Questões hoje</span>
                    </div>
                </div>
                <div className="hero-card hero-streak">
                    <div className="hero-icon">
                        <Flame size={28} />
                    </div>
                    <div className="hero-content">
                        <span className="hero-value">{streak}</span>
                        <span className="hero-label">Dias de streak</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid animate-fade-in delay-2">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{totalAC}</span>
                        <span className="stat-label">Resolvidas</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                        <Target size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{accuracy}%</span>
                        <span className="stat-label">Precisão</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-lavender-bg)', color: 'var(--color-lavender)' }}>
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{weeklyStats.total}</span>
                        <span className="stat-label">Esta semana</span>
                        <span className="stat-sub">{weeklyStats.ac} ACs</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                        <BookOpen size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{notes.length}</span>
                        <span className="stat-label">Notas</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="main-grid">
                {/* Heatmap */}
                <div className="card card-heatmap animate-fade-in delay-3">
                    <div className="card-header">
                        <h2><Calendar size={18} /> Atividade</h2>
                        <span className="card-meta">últimas 12 semanas</span>
                    </div>
                    <div className="heatmap-wrapper">
                        <div className="heatmap-grid">
                            {heatmapData.map((day, i) => (
                                <div
                                    key={i}
                                    className={`heatmap-cell level-${Math.min(day.count, 4)}`}
                                    title={`${day.date}: ${day.count} questões`}
                                />
                            ))}
                        </div>
                        <div className="heatmap-legend">
                            <span>Menos</span>
                            {[0, 1, 2, 3, 4].map((level) => (
                                <div key={level} className={`heatmap-cell level-${level}`} />
                            ))}
                            <span>Mais</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card animate-fade-in delay-3">
                    <div className="card-header">
                        <h2><Clock size={18} /> Recentes</h2>
                        <Link to="/logbook" className="card-link">
                            Ver tudo <ArrowRight size={14} />
                        </Link>
                    </div>
                    {problems.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-emoji">📝</div>
                            <p>Nenhuma questão ainda</p>
                            <Link to="/logbook" className="btn-primary">Adicionar primeira</Link>
                        </div>
                    ) : (
                        <ul className="activity-list">
                            {problems.slice(-5).reverse().map((p) => (
                                <li key={p.id} className="activity-item">
                                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                                        {p.status}
                                    </span>
                                    <div className="activity-info">
                                        <span className="activity-title">{p.title}</span>
                                        <span className="activity-platform">{p.platform}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Note */}
                <div className="card animate-fade-in delay-4">
                    <div className="card-header">
                        <h2><FileText size={18} /> Última Nota</h2>
                        <Link to="/grimoire" className="card-link">
                            Grimório <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentNote ? (
                        <div className="note-preview">
                            <h3>{recentNote.title}</h3>
                            <p>{recentNote.content.slice(0, 150)}...</p>
                            {recentNote.category && (
                                <span className="note-tag">{recentNote.category}</span>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state small">
                            <p>Nenhuma nota ainda</p>
                            <Link to="/grimoire" className="btn-secondary">Criar nota</Link>
                        </div>
                    )}
                </div>

                {/* Goals Widget */}
                <div className="animate-fade-in delay-4">
                    <GoalsWidget />
                </div>

                {/* Top Tags */}
                <div className="card animate-fade-in delay-4">
                    <div className="card-header">
                        <h2>Tópicos</h2>
                    </div>
                    {topTags.length === 0 ? (
                        <p className="text-muted">Adicione tags às questões</p>
                    ) : (
                        <div className="tags-chart">
                            {topTags.map(([tag, count]) => (
                                <div key={tag} className="tag-row">
                                    <span className="tag-name">{tag}</span>
                                    <div className="tag-bar">
                                        <div
                                            className="tag-fill"
                                            style={{ width: `${(count / topTags[0][1]) * 100}%` }}
                                        />
                                    </div>
                                    <span className="tag-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .dashboard {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-text h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .header-text p {
          color: var(--color-text-muted);
        }

        .header-date {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          text-transform: capitalize;
        }

        /* Hero Stats */
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 600px) {
          .hero-stats {
            grid-template-columns: 1fr;
          }
        }

        .hero-card {
          padding: 24px 28px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .hero-today {
          background: linear-gradient(135deg, var(--color-success-bg) 0%, rgba(93, 184, 130, 0.2) 100%);
          border: 1px solid var(--color-success);
        }

        .hero-today .hero-icon {
          background: var(--color-success);
          color: white;
        }

        .hero-streak {
          background: linear-gradient(135deg, var(--color-warning-bg) 0%, rgba(217, 166, 65, 0.2) 100%);
          border: 1px solid var(--color-warning);
        }

        .hero-streak .hero-icon {
          background: var(--color-warning);
          color: white;
        }

        .hero-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
        }

        .hero-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .hero-label {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all var(--transition-fast);
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .stat-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .card-heatmap {
          grid-column: span 2;
        }

        @media (max-width: 900px) {
          .card-heatmap {
            grid-column: span 1;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h2 {
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-meta {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .card-link {
          font-size: 0.85rem;
          color: var(--color-accent-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        /* Heatmap */
        .heatmap-wrapper {
          overflow-x: auto;
        }

        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 16px;
        }

        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: 4px;
          min-width: 14px;
          min-height: 14px;
        }

        .heatmap-cell.level-0 { background: var(--color-bg-tertiary); }
        .heatmap-cell.level-1 { background: rgba(93, 184, 130, 0.3); }
        .heatmap-cell.level-2 { background: rgba(93, 184, 130, 0.5); }
        .heatmap-cell.level-3 { background: rgba(93, 184, 130, 0.7); }
        .heatmap-cell.level-4 { background: var(--color-success); }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .heatmap-legend .heatmap-cell {
          width: 14px;
          height: 14px;
        }

        /* Activity List */
        .activity-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .status-badge {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .activity-info {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          display: block;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-platform {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        /* Note Preview */
        .note-preview {
          padding: 18px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .note-preview h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .note-preview p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .note-tag {
          display: inline-block;
          padding: 4px 12px;
          background: var(--color-lavender-bg);
          color: var(--color-lavender);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Tags Chart */
        .tags-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tag-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tag-name {
          width: 80px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .tag-bar {
          flex: 1;
          height: 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .tag-fill {
          height: 100%;
          background: var(--color-accent-gradient);
          border-radius: var(--radius-full);
        }

        .tag-count {
          width: 28px;
          text-align: right;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-text-muted);
        }

        .empty-state.small {
          padding: 24px 16px;
        }

        .empty-emoji {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 12px 20px;
          background: var(--color-accent-gradient);
          color: white;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .btn-secondary {
          display: inline-block;
          margin-top: 12px;
          padding: 10px 18px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.85rem;
          border: 1px solid var(--color-border);
        }

        .text-muted {
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    );
}
