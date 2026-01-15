import { useState, useMemo, useEffect } from 'react';
import {
  useProblemStore,
  useNoteStore,
  useBadgeStore,
  getStreak,
  DEFAULT_BADGES,
  getBadgeById,
  getRarityGradient,
  type Badge,
} from '@/stores';
import {
  Trophy,
  Target,
  Flame,
  CheckCircle,
  TrendingUp,
  Calendar,
  Plus,
  X,
  Award,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Profile() {
  const problems = useProblemStore((state) => state.problems);
  const notes = useNoteStore((state) => state.notes);
  const {
    unlockedBadges,
    customBadges,
    totalXP,
    level,
    checkAndUnlockBadges,
    addCustomBadge,
    deleteCustomBadge,
  } = useBadgeStore();

  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked' | 'locked' | 'custom'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'custom' as const,
    rarity: 'common' as Badge['rarity'],
    requirement: { type: 'problems_solved' as const, value: 10 },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const acCount = problems.filter((p) => p.status === 'AC').length;
    const streakDays = getStreak(problems);
    const tagCounts: Record<string, number> = {};
    problems.forEach((p) => {
      p.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      problemsSolved: problems.length,
      acCount,
      streakDays,
      notesCount: notes.length,
      tagCounts,
    };
  }, [problems, notes]);

  // Check for new badges
  useEffect(() => {
    const newBadges = checkAndUnlockBadges(stats);
    newBadges.forEach((badgeId) => {
      const badge = getBadgeById(badgeId, customBadges);
      if (badge) {
        toast.success(`🏆 Nova badge: ${badge.name}!`, { duration: 5000 });
      }
    });
  }, [stats, checkAndUnlockBadges, customBadges]);

  // All badges
  const allBadges = [...DEFAULT_BADGES, ...customBadges];

  // Filter badges
  const filteredBadges = useMemo(() => {
    switch (selectedTab) {
      case 'unlocked':
        return allBadges.filter((b) => unlockedBadges.includes(b.id));
      case 'locked':
        return allBadges.filter((b) => !unlockedBadges.includes(b.id));
      case 'custom':
        return customBadges;
      default:
        return allBadges;
    }
  }, [selectedTab, allBadges, unlockedBadges, customBadges]);

  // Progress to next level
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const count = problems.filter((p) => {
        const date = new Date(p.createdAt);
        return date >= weekStart && date <= weekEnd;
      }).length;

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        count,
      });
    }

    return weeks;
  }, [problems]);

  const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);

  const handleCreateBadge = () => {
    if (!newBadge.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    addCustomBadge(newBadge);
    toast.success('Badge criada!');
    setShowCreateModal(false);
    setNewBadge({
      name: '',
      description: '',
      icon: '🏆',
      category: 'custom',
      rarity: 'common',
      requirement: { type: 'problems_solved', value: 10 },
    });
  };

  const EMOJI_OPTIONS = ['🏆', '🎯', '⭐', '💎', '🔥', '⚡', '🎖️', '🌟', '👑', '🚀', '💪', '🎮', '🧠', '💡', '🎪'];

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <header className="profile-header animate-fade-in">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <Sparkles size={40} />
          </div>
          <div className="level-badge">Lv. {level}</div>
        </div>

        <div className="profile-info">
          <h1>Seu Perfil</h1>
          <div className="xp-bar-container">
            <div className="xp-info">
              <span>XP: {totalXP}</span>
              <span>{xpForNextLevel - totalXP} XP para Lv. {level + 1}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="profile-quick-stats">
          <div className="quick-stat">
            <Trophy size={20} />
            <span>{unlockedBadges.length}</span>
            <label>Badges</label>
          </div>
          <div className="quick-stat">
            <Target size={20} />
            <span>{stats.problemsSolved}</span>
            <label>Questões</label>
          </div>
          <div className="quick-stat">
            <Flame size={20} />
            <span>{stats.streakDays}</span>
            <label>Streak</label>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-section animate-fade-in delay-1">
        <h2><TrendingUp size={20} /> Estatísticas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.acCount}</span>
              <span className="stat-label">ACs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><Target size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.problemsSolved > 0 ? Math.round((stats.acCount / stats.problemsSolved) * 100) : 0}%</span>
              <span className="stat-label">Precisão</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Flame size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.streakDays}</span>
              <span className="stat-label">Dias Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Award size={24} /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.notesCount}</span>
              <span className="stat-label">Notas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="chart-section animate-fade-in delay-2">
        <h2><Calendar size={20} /> Evolução Semanal</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {weeklyData.map((week, i) => (
              <div key={i} className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: `${(week.count / maxWeekly) * 100}%` }}
                  title={`${week.label}: ${week.count} questões`}
                >
                  {week.count > 0 && <span className="bar-value">{week.count}</span>}
                </div>
                <span className="bar-label">{week.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="badges-section animate-fade-in delay-3">
        <div className="badges-header">
          <h2><Trophy size={20} /> Badges ({unlockedBadges.length}/{allBadges.length})</h2>
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Criar Badge
          </button>
        </div>

        <div className="badges-tabs">
          {(['all', 'unlocked', 'locked', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab === 'all' && 'Todas'}
              {tab === 'unlocked' && `Desbloqueadas (${unlockedBadges.length})`}
              {tab === 'locked' && `Bloqueadas (${allBadges.length - unlockedBadges.length})`}
              {tab === 'custom' && `Customizadas (${customBadges.length})`}
            </button>
          ))}
        </div>

        <div className="badges-grid">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'} rarity-${badge.rarity}`}
              >
                <div className="badge-icon" style={{ background: isUnlocked ? getRarityGradient(badge.rarity) : undefined }}>
                  <span>{badge.icon}</span>
                </div>
                <div className="badge-info">
                  <span className="badge-name">{badge.name}</span>
                  <span className="badge-desc">{badge.description}</span>
                  <span className={`badge-rarity ${badge.rarity}`}>{badge.rarity}</span>
                </div>
                {badge.isCustom && (
                  <button
                    className="badge-delete"
                    onClick={() => {
                      if (confirm('Deletar esta badge?')) {
                        deleteCustomBadge(badge.id);
                        toast.success('Badge deletada');
                      }
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
                {!isUnlocked && (
                  <div className="badge-lock">🔒</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Create Badge Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Criar Badge Customizada</h3>
              <button onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Ícone</label>
                <div className="emoji-picker">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      className={`emoji-btn ${newBadge.icon === emoji ? 'active' : ''}`}
                      onClick={() => setNewBadge({ ...newBadge, icon: emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="Ex: Speed Demon"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  placeholder="Ex: Resolva 10 questões em um dia"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Raridade</label>
                  <select
                    value={newBadge.rarity}
                    onChange={(e) => setNewBadge({ ...newBadge, rarity: e.target.value as Badge['rarity'] })}
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Requisito</label>
                  <div className="requirement-input">
                    <input
                      type="number"
                      value={newBadge.requirement.value}
                      onChange={(e) => setNewBadge({
                        ...newBadge,
                        requirement: { ...newBadge.requirement, value: parseInt(e.target.value) || 1 },
                      })}
                      min={1}
                    />
                    <span>questões</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreateBadge}>
                Criar Badge
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 28px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .profile-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 100px;
          height: 100px;
          background: var(--color-accent-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .level-badge {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 14px;
          background: var(--color-warning);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .profile-info {
          flex: 1;
          min-width: 200px;
        }

        .profile-info h1 {
          font-size: 1.6rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .xp-bar-container {
          max-width: 400px;
        }

        .xp-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }

        .xp-bar {
          height: 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .xp-fill {
          height: 100%;
          background: var(--color-accent-gradient);
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .profile-quick-stats {
          display: flex;
          gap: 32px;
        }

        .quick-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .quick-stat svg {
          color: var(--color-accent-primary);
        }

        .quick-stat span {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .quick-stat label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Stats Section */
        .stats-section, .chart-section, .badges-section {
          margin-bottom: 28px;
        }

        .stats-section h2, .chart-section h2, .badges-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 800px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.green { background: var(--color-success-bg); color: var(--color-success); }
        .stat-icon.blue { background: var(--color-info-bg); color: var(--color-info); }
        .stat-icon.orange { background: var(--color-warning-bg); color: var(--color-warning); }
        .stat-icon.purple { background: var(--color-lavender-bg); color: var(--color-lavender); }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        /* Chart */
        .chart-container {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 180px;
          gap: 8px;
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .chart-bar {
          width: 100%;
          max-width: 40px;
          background: var(--color-accent-gradient);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          min-height: 4px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          transition: height 0.3s ease;
        }

        .bar-value {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          margin-top: 6px;
        }

        .bar-label {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          margin-top: 8px;
          white-space: nowrap;
        }

        /* Badges */
        .badges-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .btn-create {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
        }

        .badges-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 10px 18px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover {
          background: var(--color-bg-tertiary);
        }

        .tab-btn.active {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: white;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .badge-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .badge-card.locked {
          opacity: 0.5;
        }

        .badge-card.unlocked:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .badge-card.rarity-legendary.unlocked {
          border-color: #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        .badge-card.rarity-epic.unlocked {
          border-color: #a855f7;
        }

        .badge-card.rarity-rare.unlocked {
          border-color: #3b82f6;
        }

        .badge-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          background: var(--color-bg-tertiary);
          flex-shrink: 0;
        }

        .badge-info {
          flex: 1;
          min-width: 0;
        }

        .badge-name {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .badge-desc {
          display: block;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 6px;
        }

        .badge-rarity {
          display: inline-block;
          padding: 2px 10px;
          border-radius: var(--radius-full);
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-rarity.common { background: #6b7280; color: white; }
        .badge-rarity.rare { background: #3b82f6; color: white; }
        .badge-rarity.epic { background: #a855f7; color: white; }
        .badge-rarity.legendary { background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); color: #000; }

        .badge-lock {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 1rem;
        }

        .badge-delete {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          background: var(--color-error-bg);
          border: none;
          border-radius: 50%;
          color: var(--color-error);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 480px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .modal-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .modal-header button {
          padding: 6px;
          background: var(--color-bg-tertiary);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .modal-body {
          padding: 24px 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px 14px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .emoji-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .emoji-btn {
          width: 40px;
          height: 40px;
          background: var(--color-bg-tertiary);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          font-size: 1.2rem;
          cursor: pointer;
        }

        .emoji-btn.active {
          border-color: var(--color-accent-primary);
          background: var(--color-accent-primary);
        }

        .requirement-input {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .requirement-input input {
          width: 80px;
        }

        .requirement-input span {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
        }

        .btn-primary {
          padding: 12px 24px;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary {
          padding: 12px 24px;
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
