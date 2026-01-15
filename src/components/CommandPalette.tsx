import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    LayoutDashboard,
    BookOpen,
    ScrollText,
    Code2,
    Bookmark,
    Settings,
    Plus,
    FileText,
    Target,
    Moon,
    Sun,
} from 'lucide-react';
import { useProblemStore, useNoteStore, useSnippetStore } from '@/stores';
import { useTheme } from '@/contexts';

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    action: () => void;
    category: 'navigation' | 'action' | 'problem' | 'note' | 'snippet';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const problems = useProblemStore((state) => state.problems);
    const notes = useNoteStore((state) => state.notes);
    const snippets = useSnippetStore((state) => state.snippets);

    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Build command list
    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-dashboard', title: 'Dashboard', icon: <LayoutDashboard size={18} />, action: () => { navigate('/'); onClose(); }, category: 'navigation' },
        { id: 'nav-logbook', title: 'Logbook', icon: <BookOpen size={18} />, action: () => { navigate('/logbook'); onClose(); }, category: 'navigation' },
        { id: 'nav-grimoire', title: 'Grimório', icon: <ScrollText size={18} />, action: () => { navigate('/grimoire'); onClose(); }, category: 'navigation' },
        { id: 'nav-snippets', title: 'Snippets', icon: <Code2 size={18} />, action: () => { navigate('/snippets'); onClose(); }, category: 'navigation' },
        { id: 'nav-bookmarks', title: 'Bookmarks', icon: <Bookmark size={18} />, action: () => { navigate('/bookmarks'); onClose(); }, category: 'navigation' },
        { id: 'nav-settings', title: 'Configurações', icon: <Settings size={18} />, action: () => { navigate('/settings'); onClose(); }, category: 'navigation' },

        // Actions
        { id: 'action-new-problem', title: 'Nova Questão', subtitle: 'Adicionar ao logbook', icon: <Plus size={18} />, action: () => { navigate('/logbook?new=true'); onClose(); }, category: 'action' },
        { id: 'action-new-note', title: 'Nova Nota', subtitle: 'Criar no grimório', icon: <FileText size={18} />, action: () => { navigate('/grimoire?new=true'); onClose(); }, category: 'action' },
        { id: 'action-theme', title: theme === 'dark' ? 'Modo Claro' : 'Modo Escuro', subtitle: 'Alternar tema', icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />, action: () => { toggleTheme(); onClose(); }, category: 'action' },

        // Recent problems
        ...problems.slice(-5).reverse().map((p) => ({
            id: `problem-${p.id}`,
            title: p.title,
            subtitle: `${p.platform} • ${p.status}`,
            icon: <Target size={18} />,
            action: () => { navigate('/logbook'); onClose(); },
            category: 'problem' as const,
        })),

        // Recent notes
        ...notes.slice(-3).reverse().map((n) => ({
            id: `note-${n.id}`,
            title: n.title,
            subtitle: n.category || 'Nota',
            icon: <FileText size={18} />,
            action: () => { navigate('/grimoire'); onClose(); },
            category: 'note' as const,
        })),

        // Snippets
        ...snippets.slice(0, 4).map((s) => ({
            id: `snippet-${s.id}`,
            title: s.title,
            subtitle: `${s.language.toUpperCase()} • ${s.category}`,
            icon: <Code2 size={18} />,
            action: () => { navigate('/snippets'); onClose(); },
            category: 'snippet' as const,
        })),
    ];

    // Filter commands
    const filteredCommands = query
        ? commands.filter((cmd) =>
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query.toLowerCase()))
        )
        : commands;

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        const list = listRef.current;
        if (list) {
            const selectedEl = list.children[selectedIndex] as HTMLElement;
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'navigation': return 'Navegação';
            case 'action': return 'Ações';
            case 'problem': return 'Questões Recentes';
            case 'note': return 'Notas Recentes';
            case 'snippet': return 'Snippets';
            default: return category;
        }
    };

    // Group commands by category
    const groupedCommands: { category: string; items: (CommandItem & { globalIndex: number })[] }[] = [];
    let currentCategory = '';
    let globalIndex = 0;

    filteredCommands.forEach((cmd) => {
        if (cmd.category !== currentCategory) {
            currentCategory = cmd.category;
            groupedCommands.push({ category: cmd.category, items: [] });
        }
        groupedCommands[groupedCommands.length - 1].items.push({ ...cmd, globalIndex });
        globalIndex++;
    });

    return (
        <div className="command-overlay" onClick={onClose}>
            <div className="command-palette" onClick={(e) => e.stopPropagation()}>
                <div className="command-search">
                    <Search size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar comandos, questões, notas..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd>ESC</kbd>
                </div>

                <div className="command-list" ref={listRef}>
                    {filteredCommands.length === 0 ? (
                        <div className="command-empty">
                            <p>Nenhum resultado encontrado</p>
                        </div>
                    ) : (
                        groupedCommands.map((group) => (
                            <div key={group.category} className="command-group">
                                <div className="command-category">{getCategoryLabel(group.category)}</div>
                                {group.items.map((cmd) => (
                                    <button
                                        key={cmd.id}
                                        className={`command-item ${cmd.globalIndex === selectedIndex ? 'selected' : ''}`}
                                        onClick={cmd.action}
                                        onMouseEnter={() => setSelectedIndex(cmd.globalIndex)}
                                    >
                                        <span className="command-icon">{cmd.icon}</span>
                                        <div className="command-text">
                                            <span className="command-title">{cmd.title}</span>
                                            {cmd.subtitle && <span className="command-subtitle">{cmd.subtitle}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                <div className="command-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
                    <span><kbd>Enter</kbd> selecionar</span>
                    <span><kbd>Esc</kbd> fechar</span>
                </div>
            </div>

            <style>{`
        .command-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 15vh;
          z-index: 9999;
          animation: fadeIn 150ms ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .command-palette {
          width: 100%;
          max-width: 580px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: slideDown 150ms ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .command-search {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 22px;
          border-bottom: 1px solid var(--color-border);
        }

        .command-search svg {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .command-search input {
          flex: 1;
          background: none;
          border: none;
          font-size: 1.05rem;
          color: var(--color-text-primary);
          outline: none;
        }

        .command-search input::placeholder {
          color: var(--color-text-muted);
        }

        .command-search kbd {
          padding: 4px 10px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 0.7rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }

        .command-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }

        .command-empty {
          padding: 40px;
          text-align: center;
          color: var(--color-text-muted);
        }

        .command-group {
          margin-bottom: 8px;
        }

        .command-category {
          padding: 10px 14px 6px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .command-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all 100ms ease;
        }

        .command-item:hover,
        .command-item.selected {
          background: var(--color-bg-tertiary);
        }

        .command-item.selected {
          background: var(--color-accent-primary);
          color: white;
        }

        .command-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
        }

        .command-item.selected .command-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .command-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .command-title {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .command-subtitle {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .command-item.selected .command-subtitle {
          color: rgba(255, 255, 255, 0.7);
        }

        .command-footer {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding: 14px;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-tertiary);
        }

        .command-footer span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .command-footer kbd {
          padding: 3px 6px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 0.65rem;
          font-family: var(--font-mono);
        }
      `}</style>
        </div>
    );
}
