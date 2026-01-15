import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ScrollText,
    Code2,
    Bookmark,
    Settings,
    Flame,
    Sun,
    Moon,
    Menu,
    X,
    Trophy,
    Clock,
    Heart,
    GraduationCap,
    Calendar,
} from 'lucide-react';
import { useProblemStore, getStreak, getTodayCount } from '@/stores';
import { useTheme } from '@/contexts';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/logbook', icon: BookOpen, label: 'Logbook' },
    { to: '/grimoire', icon: ScrollText, label: 'Grimório' },
    { to: '/snippets', icon: Code2, label: 'Snippets' },
    { to: '/profile', icon: Trophy, label: 'Perfil' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
];

export function Sidebar() {
    const problems = useProblemStore((state) => state.problems);
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const streak = useMemo(() => getStreak(problems), [problems]);
    const todayCount = useMemo(() => getTodayCount(problems), [problems]);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">
                        <span className="gradient-text">Up</span>Solve
                    </h1>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Stats Card */}
                <div className="sidebar-stats">
                    <div className="streak-highlight">
                        <div className="streak-fire">
                            <Flame size={28} />
                        </div>
                        <div className="streak-info">
                            <span className="streak-value">{streak}</span>
                            <span className="streak-label">dias de streak</span>
                        </div>
                    </div>
                    <div className="today-counter">
                        <span className="today-value">{todayCount}</span>
                        <span className="today-label">questões hoje</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'nav-item-active' : ''}`
                            }
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Timer Button */}
                <div className="sidebar-timer">
                    <button
                        className="timer-btn"
                        onClick={() => (window as any).openTimer?.()}
                    >
                        <Clock size={20} />
                        <span>Timer</span>
                    </button>
                </div>

                {/* Footer with Settings and Attribution */}
                <div className="sidebar-footer">
                    <NavLink
                        to="/settings"
                        className="nav-item"
                        onClick={() => setMobileOpen(false)}
                    >
                        <Settings size={20} />
                        <span>Configurações</span>
                    </NavLink>

                    <div className="sidebar-attribution">
                        <p>
                            Feito com <Heart size={12} className="heart-icon" /> por{' '}
                            <button className="creator-link" onClick={() => setShowAbout(true)}>
                                Guilherme de Medeiros
                            </button>
                        </p>
                    </div>
                </div>

                <style>{`
          .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 200;
            width: 44px;
            height: 44px;
            align-items: center;
            justify-content: center;
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-primary);
            cursor: pointer;
            box-shadow: var(--shadow-md);
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 90;
          }

          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: flex;
            }

            .sidebar-overlay {
              display: block;
            }
          }

          .sidebar {
            width: var(--spacing-sidebar);
            height: 100vh;
            background: var(--color-bg-sidebar);
            border-right: 1px solid var(--color-border);
            display: flex;
            flex-direction: column;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 100;
            transition: transform var(--transition-normal);
          }

          @media (max-width: 768px) {
            .sidebar {
              width: 280px;
              transform: translateX(-100%);
            }

            .sidebar.sidebar-open {
              transform: translateX(0);
            }
          }

          .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 20px;
            border-bottom: 1px solid var(--color-border);
          }

          .sidebar-logo {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.02em;
          }

          .theme-toggle {
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-bg-tertiary);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-secondary);
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .theme-toggle:hover {
            background: var(--color-bg-hover);
            color: var(--color-text-primary);
          }

          .sidebar-stats {
            margin: 20px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(224, 123, 58, 0.15) 0%, rgba(224, 123, 58, 0.05) 100%);
            border: 1px solid rgba(224, 123, 58, 0.3);
            border-radius: var(--radius-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .streak-highlight {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .streak-fire {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #e07b3a 0%, #f4a460 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 15px rgba(224, 123, 58, 0.4);
          }

          .streak-info {
            display: flex;
            flex-direction: column;
          }

          .streak-value {
            font-size: 2rem;
            font-weight: 800;
            color: var(--color-text-primary);
            line-height: 1;
          }

          .streak-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }

          .today-counter {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: var(--color-bg-secondary);
            border-radius: var(--radius-full);
            border: 1px solid var(--color-border);
          }

          .today-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-success);
          }

          .today-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }

          .sidebar-nav {
            flex: 1;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow-y: auto;
          }

          .sidebar-timer {
            padding: 0 12px 12px;
          }

          .timer-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            background: linear-gradient(135deg, var(--color-warning-bg) 0%, rgba(217, 166, 65, 0.2) 100%);
            border: 1px solid var(--color-warning);
            border-radius: var(--radius-md);
            color: var(--color-warning);
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .timer-btn:hover {
            background: var(--color-warning);
            color: white;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            border-radius: var(--radius-md);
            color: var(--color-text-secondary);
            text-decoration: none;
            transition: all var(--transition-fast);
            font-weight: 500;
            font-size: 0.95rem;
          }

          .nav-item:hover {
            background: var(--color-bg-hover);
            color: var(--color-text-primary);
          }

          .nav-item-active {
            background: var(--color-accent-gradient);
            color: white;
            box-shadow: var(--shadow-sm);
          }

          .nav-item-active:hover {
            color: white;
          }

          .sidebar-footer {
            padding: 12px;
            border-top: 1px solid var(--color-border);
          }
          
          .sidebar-attribution {
            padding: 16px 0 8px;
            text-align: center;
            font-size: 0.7rem;
            color: var(--color-text-muted);
          }

          .heart-icon {
            display: inline;
            color: #e06060;
            fill: #e06060;
            vertical-align: middle;
            margin: 0 1px;
          }

          .creator-link {
            background: none;
            border: none;
            padding: 0;
            color: var(--color-text-secondary);
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
          }

          .creator-link:hover {
            color: var(--color-accent-primary);
            text-decoration: underline;
          }
          
          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
          }

          .about-modal {
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            width: 100%;
            max-width: 380px;
            padding: 40px 32px;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            text-align: center;
            animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.95) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;
          }

          .modal-close:hover {
            background: var(--color-bg-tertiary);
            color: var(--color-text-primary);
          }

          .about-header {
            margin-bottom: 32px;
          }

          .creator-avatar {
            width: 88px;
            height: 88px;
            background: var(--color-accent-gradient);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2.2rem;
            font-weight: 700;
            box-shadow: 0 10px 25px rgba(124, 110, 246, 0.3);
          }

          .about-header h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 6px;
            color: var(--color-text-primary);
            letter-spacing: -0.02em;
          }

          .about-subtitle {
            color: var(--color-text-muted);
            font-size: 0.95rem;
          }

          .about-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .about-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: var(--color-bg-tertiary);
            border-radius: var(--radius-lg);
            text-align: left;
            transition: transform 0.2s;
          }
          
          .about-item:hover {
            transform: translateY(-2px);
          }

          .about-item svg {
            color: var(--color-accent-primary);
            flex-shrink: 0;
          }

          .item-label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-muted);
            font-weight: 600;
            margin-bottom: 2px;
          }

          .item-value {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .creation-date {
            margin-top: 16px;
            padding-top: 24px;
            border-top: 1px solid var(--color-border);
            font-size: 0.85rem;
            color: var(--color-text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
        `}</style>
            </aside>

            {/* About Modal - Global Overlay */}
            {showAbout && (
                <div className="modal-overlay" onClick={() => setShowAbout(false)}>
                    <div className="modal about-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAbout(false)}>
                            <X size={20} />
                        </button>

                        <div className="about-header">
                            <div className="creator-avatar">GM</div>
                            <h2>Guilherme de Medeiros</h2>
                            <p className="about-subtitle">Full Stack Engineer</p>
                        </div>

                        <div className="about-content">
                            <div className="about-item">
                                <GraduationCap size={24} />
                                <div>
                                    <span className="item-label">UNICAMP</span>
                                    <span className="item-value">Matemática Aplicada e Computacional</span>
                                </div>
                            </div>

                            <div className="about-item">
                                <Code2 size={24} />
                                <div>
                                    <span className="item-label">Profissão</span>
                                    <span className="item-value">Engenheiro de Software</span>
                                </div>
                            </div>

                            <div className="creation-date">
                                <Calendar size={16} />
                                <span>Desenvolvido em 14 de Janeiro de 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
