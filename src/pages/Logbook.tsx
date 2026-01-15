/**
 * @file Logbook.tsx
 * @description The core problem-solving tracker where users can log, filter, and manage their competitive programming problems.
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */
import { useState } from 'react';
import { useProblemStore } from '@/stores';
import {
    Plus,
    Search,
    Filter,
    ExternalLink,
    Trash2,
    Edit2,
    X,
    Clock
} from 'lucide-react';
import type { Problem, Platform, ProblemStatus } from '@/types';
import toast from 'react-hot-toast';

const PLATFORMS: Platform[] = ['Codeforces', 'LeetCode', 'Beecrowd', 'AtCoder', 'Other'];
const STATUSES: ProblemStatus[] = ['AC', 'WA', 'TLE', 'MLE', 'RE', 'DOING'];

const COMMON_TAGS = [
    'math', 'dp', 'greedy', 'graphs', 'binary-search',
    'sorting', 'strings', 'trees', 'dfs', 'bfs',
    'two-pointers', 'segment-tree', 'number-theory'
];

type ModalMode = 'create' | 'edit';

export function Logbook() {
    const problems = useProblemStore((state) => state.problems);
    const addProblem = useProblemStore((state) => state.addProblem);
    const deleteProblem = useProblemStore((state) => state.deleteProblem);
    const updateProblem = useProblemStore((state) => state.updateProblem);

    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<ProblemStatus | 'all'>('all');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        platform: 'Codeforces' as Platform,
        link: '',
        difficulty: '',
        status: 'DOING' as ProblemStatus,
        tags: [] as string[],
        quickNotes: '',
    });
    const [tagInput, setTagInput] = useState('');

    // Filtered problems
    const filteredProblems = problems.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesPlatform && matchesStatus;
    });

    const openCreateModal = () => {
        setModalMode('create');
        setEditingId(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (problem: Problem) => {
        setModalMode('edit');
        setEditingId(problem.id);
        setFormData({
            title: problem.title,
            platform: problem.platform,
            link: problem.link || '',
            difficulty: problem.difficulty?.toString() || '',
            status: problem.status,
            tags: [...problem.tags],
            quickNotes: problem.quickNotes || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const problemData = {
            title: formData.title,
            platform: formData.platform,
            link: formData.link || undefined,
            difficulty: formData.difficulty ? parseInt(formData.difficulty) : undefined,
            status: formData.status,
            tags: formData.tags,
            quickNotes: formData.quickNotes || undefined,
        };

        if (modalMode === 'create') {
            addProblem(problemData);
            toast.success('Questão adicionada!');
        } else if (editingId) {
            updateProblem(editingId, problemData);
            toast.success('Questão atualizada!');
        }

        setShowModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            platform: 'Codeforces',
            link: '',
            difficulty: '',
            status: 'DOING',
            tags: [],
            quickNotes: '',
        });
        setTagInput('');
        setEditingId(null);
    };

    const addTag = (tag: string) => {
        const normalizedTag = tag.toLowerCase().trim();
        if (normalizedTag && !formData.tags.includes(normalizedTag)) {
            setFormData({ ...formData, tags: [...formData.tags, normalizedTag] });
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Deletar "${title}"?`)) {
            deleteProblem(id);
            toast.success('Questão removida');
        }
    };

    const cycleStatus = (problem: Problem) => {
        const statusIndex = STATUSES.indexOf(problem.status);
        const nextStatus = STATUSES[(statusIndex + 1) % STATUSES.length];
        updateProblem(problem.id, { status: nextStatus });
    };

    return (
        <div className="logbook">
            <header className="page-header animate-fade-in">
                <div>
                    <h1>Logbook</h1>
                    <p className="subtitle">Registre e acompanhe suas questões</p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    Nova Questão
                </button>
            </header>

            {/* Filters */}
            <div className="filters-bar animate-fade-in delay-1">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar questões..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value as Platform | 'all')}
                    >
                        <option value="all">Todas Plataformas</option>
                        {PLATFORMS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ProblemStatus | 'all')}
                    >
                        <option value="all">Todos Status</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Problems List */}
            <div className="problems-container animate-fade-in delay-2">
                {filteredProblems.length === 0 ? (
                    <div className="empty-state">
                        <h3>Nenhuma questão encontrada</h3>
                        <p>Clique em "Nova Questão" para adicionar</p>
                    </div>
                ) : (
                    <div className="problems-list">
                        {filteredProblems.map((problem, index) => (
                            <div
                                key={problem.id}
                                className="problem-card"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="problem-main">
                                    <button
                                        className={`status-badge status-${problem.status.toLowerCase()}`}
                                        onClick={() => cycleStatus(problem)}
                                        title="Clique para mudar status"
                                    >
                                        {problem.status}
                                    </button>
                                    <div className="problem-info">
                                        <div className="problem-title-row">
                                            <span className="problem-title">{problem.title}</span>
                                            {problem.link && (
                                                <a
                                                    href={problem.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="problem-link"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                        <div className="problem-meta">
                                            <span className={`platform-badge platform-${problem.platform.toLowerCase()}`}>
                                                {problem.platform}
                                            </span>
                                            {problem.difficulty && (
                                                <span className="difficulty">Rating: {problem.difficulty}</span>
                                            )}
                                            <span className="date">
                                                <Clock size={12} />
                                                {new Date(problem.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="problem-tags">
                                    {problem.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {problem.tags.length > 3 && (
                                        <span className="tag tag-more">+{problem.tags.length - 3}</span>
                                    )}
                                </div>

                                <div className="problem-actions">
                                    <button
                                        className="action-btn"
                                        title="Editar"
                                        onClick={() => openEditModal(problem)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn action-delete"
                                        title="Deletar"
                                        onClick={() => handleDelete(problem.id, problem.title)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? 'Nova Questão' : 'Editar Questão'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Título *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Two Sum"
                                        required
                                    />
                                </div>
                                <div className="form-group form-group-small">
                                    <label>Plataforma</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                                    >
                                        {PLATFORMS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Link</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-group form-group-xs">
                                    <label>Rating</label>
                                    <input
                                        type="number"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        placeholder="800"
                                    />
                                </div>
                                <div className="form-group form-group-xs">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProblemStatus })}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <div className="tags-input-container">
                                    <div className="selected-tags">
                                        {formData.tags.map((tag) => (
                                            <span key={tag} className="tag tag-selected" onClick={() => removeTag(tag)}>
                                                {tag} <X size={12} />
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTag(tagInput);
                                            }
                                        }}
                                        placeholder="Adicionar tag (Enter)"
                                    />
                                </div>
                                <div className="common-tags">
                                    {COMMON_TAGS.filter((t) => !formData.tags.includes(t)).slice(0, 6).map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className="tag tag-suggestion"
                                            onClick={() => addTag(tag)}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notas rápidas</label>
                                <textarea
                                    value={formData.quickNotes}
                                    onChange={(e) => setFormData({ ...formData, quickNotes: e.target.value })}
                                    placeholder="Observações sobre a questão..."
                                    rows={3}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'create' ? 'Adicionar' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .logbook {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .subtitle {
          color: var(--color-text-muted);
          font-size: 0.95rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .btn-secondary {
          padding: 12px 20px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          background: var(--color-bg-hover);
        }

        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .search-box:focus-within {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(124, 110, 246, 0.15);
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        .search-box svg {
          color: var(--color-text-muted);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-text-muted);
        }

        .filter-group select {
          padding: 12px 16px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .problems-container {
          min-height: 300px;
        }

        .empty-state {
          text-align: center;
          padding: 64px 32px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--color-text-muted);
          margin-bottom: 20px;
        }

        .problems-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .problem-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          animation: fadeIn var(--transition-slow) ease forwards;
        }

        .problem-card:hover {
          border-color: var(--color-border-hover);
          box-shadow: var(--shadow-md);
        }

        .problem-main {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .status-badge:hover {
          transform: scale(1.05);
        }

        .problem-info {
          flex: 1;
          min-width: 0;
        }

        .problem-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .problem-title {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .problem-link {
          color: var(--color-text-muted);
          transition: color var(--transition-fast);
        }

        .problem-link:hover {
          color: var(--color-accent-primary);
        }

        .problem-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .platform-badge {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 600;
        }

        .difficulty {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .problem-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          max-width: 180px;
        }

        @media (max-width: 800px) {
          .problem-tags {
            display: none;
          }
        }

        .tag {
          padding: 4px 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .tag-more {
          background: var(--color-accent-primary);
          color: white;
        }

        .problem-actions {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          padding: 10px;
          background: var(--color-bg-tertiary);
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .action-delete:hover {
          color: var(--color-error);
          background: var(--color-error-bg);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
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
          padding: 28px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-close {
          padding: 8px;
          background: var(--color-bg-tertiary);
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .form-row {
          display: flex;
          gap: 14px;
          margin-bottom: 16px;
        }

        @media (max-width: 500px) {
          .form-row {
            flex-direction: column;
          }
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-small {
          flex: 0 0 150px;
        }

        .form-group-xs {
          flex: 0 0 100px;
        }

        @media (max-width: 500px) {
          .form-group-small,
          .form-group-xs {
            flex: 1;
          }
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 14px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: all var(--transition-fast);
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(124, 110, 246, 0.15);
        }

        .tags-input-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 14px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .tags-input-container input {
          flex: 1;
          min-width: 100px;
          padding: 4px;
          background: none;
          border: none;
          box-shadow: none;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag-selected {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          background: var(--color-accent-primary);
          color: white;
        }

        .tag-selected:hover {
          background: var(--color-error);
        }

        .common-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }

        .tag-suggestion {
          cursor: pointer;
          border: 1px dashed var(--color-border);
          background: transparent;
          transition: all var(--transition-fast);
        }

        .tag-suggestion:hover {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: white;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }
      `}</style>
        </div>
    );
}
