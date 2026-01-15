/**
 * @file Grimoire.tsx
 * @description A personal knowledge base notebook for documenting algorithms, data structures, and study notes (Markdown support).
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */
import { useState } from 'react';
import { useNoteStore } from '@/stores';
import {
    Plus,
    Search,
    FileText,
    Trash2,
    Edit2,
    X,
    Save,
    BookOpen,
    Clock
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';

const CATEGORIES = ['Algoritmos', 'Estruturas de Dados', 'Math', 'Grafos', 'DP', 'Dicas', 'Outros'];

export function Grimoire() {
    const notes = useNoteStore((state) => state.notes);
    const addNote = useNoteStore((state) => state.addNote);
    const updateNote = useNoteStore((state) => state.updateNote);
    const deleteNote = useNoteStore((state) => state.deleteNote);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showNewNote, setShowNewNote] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');

    const filteredNotes = notes.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewNote = () => {
        setShowNewNote(true);
        setSelectedNote(null);
        setIsEditing(true);
        setFormData({ title: '', content: '# Nova Nota\n\nComece a escrever aqui...', category: '', tags: [] });
    };

    const handleSelectNote = (id: string) => {
        const note = notes.find((n) => n.id === id);
        if (note) {
            setSelectedNote(id);
            setShowNewNote(false);
            setIsEditing(false);
            setFormData({
                title: note.title,
                content: note.content,
                category: note.category || '',
                tags: note.tags,
            });
        }
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            toast.error('Título é obrigatório');
            return;
        }

        if (showNewNote) {
            addNote({
                title: formData.title,
                content: formData.content,
                category: formData.category || undefined,
                tags: formData.tags,
            });
            toast.success('Nota criada!');
            setShowNewNote(false);
        } else if (selectedNote) {
            updateNote(selectedNote, {
                title: formData.title,
                content: formData.content,
                category: formData.category || undefined,
                tags: formData.tags,
            });
            toast.success('Nota salva!');
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (selectedNote && confirm('Deletar esta nota?')) {
            deleteNote(selectedNote);
            setSelectedNote(null);
            setFormData({ title: '', content: '', category: '', tags: [] });
            toast.success('Nota deletada');
        }
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

    return (
        <div className="grimoire">
            {/* Notes Sidebar */}
            <aside className="notes-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        <BookOpen size={20} />
                        <span>Grimório</span>
                    </div>
                    <button className="btn-new" onClick={handleNewNote}>
                        <Plus size={18} />
                    </button>
                </div>

                <div className="search-container">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar notas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="notes-list">
                    {filteredNotes.length === 0 ? (
                        <div className="empty-list">
                            <FileText size={40} strokeWidth={1} />
                            <p>Nenhuma nota</p>
                            <button onClick={handleNewNote}>Criar primeira</button>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <button
                                key={note.id}
                                className={`note-item ${selectedNote === note.id ? 'active' : ''}`}
                                onClick={() => handleSelectNote(note.id)}
                            >
                                <div className="note-item-content">
                                    <span className="note-item-title">{note.title}</span>
                                    <div className="note-item-meta">
                                        <Clock size={12} />
                                        <span>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                {note.category && (
                                    <span className="note-item-category">{note.category}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="note-main">
                {!selectedNote && !showNewNote ? (
                    <div className="placeholder">
                        <div className="placeholder-icon">📚</div>
                        <h2>Seu Grimório</h2>
                        <p>Selecione uma nota ou crie uma nova para documentar seus aprendizados</p>
                        <button className="btn-primary" onClick={handleNewNote}>
                            <Plus size={18} />
                            Nova Nota
                        </button>
                    </div>
                ) : (
                    <div className="editor-container">
                        {/* Header */}
                        <header className="editor-header">
                            <div className="header-left">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="title-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Título da nota..."
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="note-title">{formData.title}</h1>
                                )}
                            </div>
                            <div className="header-actions">
                                {isEditing ? (
                                    <>
                                        <button className="btn-ghost" onClick={() => {
                                            setIsEditing(false);
                                            if (showNewNote) {
                                                setShowNewNote(false);
                                                setFormData({ title: '', content: '', category: '', tags: [] });
                                            }
                                        }}>
                                            <X size={18} />
                                            Cancelar
                                        </button>
                                        <button className="btn-primary" onClick={handleSave}>
                                            <Save size={18} />
                                            Salvar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-ghost" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={18} />
                                            Editar
                                        </button>
                                        <button className="btn-danger" onClick={handleDelete}>
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Metadata */}
                        {isEditing && (
                            <div className="editor-meta">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Categoria...</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>

                                <div className="tags-container">
                                    {formData.tags.map((tag) => (
                                        <span key={tag} className="tag" onClick={() => removeTag(tag)}>
                                            {tag} <X size={12} />
                                        </span>
                                    ))}
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
                                        placeholder="+ tag"
                                        className="tag-input"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Editor */}
                        <div className="editor-wrapper" data-color-mode="dark">
                            {isEditing ? (
                                <MDEditor
                                    value={formData.content}
                                    onChange={(val) => setFormData({ ...formData, content: val || '' })}
                                    height="100%"
                                    preview="live"
                                    visibleDragbar={false}
                                />
                            ) : (
                                <div className="markdown-view">
                                    <MDEditor.Markdown source={formData.content || '*Sem conteúdo*'} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
        .grimoire {
          display: flex;
          height: 100%;
          width: 100%;
          background: var(--color-bg-primary);
        }

        /* Notes Sidebar */
        .notes-sidebar {
          width: 300px;
          min-width: 300px;
          height: 100%;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 900px) {
          .notes-sidebar {
            width: 260px;
            min-width: 260px;
          }
        }

        @media (max-width: 600px) {
          .notes-sidebar {
            display: none;
          }
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .btn-new {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-new:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-glow);
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px;
          padding: 12px 14px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
        }

        .search-container input {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px 20px;
        }

        .empty-list {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-text-muted);
        }

        .empty-list svg {
          opacity: 0.3;
          margin-bottom: 12px;
        }

        .empty-list p {
          margin-bottom: 16px;
        }

        .empty-list button {
          padding: 10px 20px;
          background: var(--color-accent-gradient);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
        }

        .note-item {
          width: 100%;
          text-align: left;
          padding: 16px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-bottom: 6px;
          transition: all var(--transition-fast);
        }

        .note-item:hover {
          background: var(--color-bg-tertiary);
        }

        .note-item.active {
          background: var(--color-accent-gradient);
          color: white;
        }

        .note-item-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .note-item-title {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .note-item-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .note-item.active .note-item-meta {
          color: rgba(255,255,255,0.7);
        }

        .note-item-category {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 10px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          color: var(--color-text-secondary);
        }

        .note-item.active .note-item-category {
          background: rgba(255,255,255,0.2);
          color: white;
        }

        /* Main Area */
        .note-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100%;
          overflow: hidden;
        }

        .placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--color-text-muted);
          padding: 40px;
        }

        .placeholder-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .placeholder h2 {
          font-size: 1.5rem;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .placeholder p {
          max-width: 300px;
          margin-bottom: 24px;
        }

        .editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
          gap: 20px;
        }

        .header-left {
          flex: 1;
          min-width: 0;
        }

        .note-title {
          font-size: 1.4rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .title-input {
          width: 100%;
          font-size: 1.4rem;
          font-weight: 600;
          background: none;
          border: none;
          border-bottom: 2px solid var(--color-accent-primary);
          color: var(--color-text-primary);
          padding: 4px 0;
          outline: none;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .btn-primary {
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
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          box-shadow: var(--shadow-glow);
        }

        .btn-ghost {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-ghost:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .btn-danger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-danger:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
          border-color: var(--color-error);
        }

        .editor-meta {
          display: flex;
          gap: 16px;
          padding: 16px 28px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        .editor-meta select {
          padding: 10px 16px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .tags-container {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          min-width: 200px;
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          background: var(--color-accent-primary);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tag:hover {
          background: var(--color-error);
        }

        .tag-input {
          flex: 1;
          min-width: 80px;
          background: none;
          border: none;
          color: var(--color-text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        /* Editor Wrapper */
        .editor-wrapper {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .editor-wrapper .w-md-editor {
          flex: 1;
          background: var(--color-bg-primary) !important;
          border: none !important;
          box-shadow: none !important;
        }

        .editor-wrapper .w-md-editor-toolbar {
          background: var(--color-bg-secondary) !important;
          border-bottom: 1px solid var(--color-border) !important;
          padding: 8px 16px !important;
        }

        .editor-wrapper .w-md-editor-toolbar li > button {
          color: var(--color-text-secondary) !important;
        }

        .editor-wrapper .w-md-editor-toolbar li > button:hover {
          color: var(--color-text-primary) !important;
          background: var(--color-bg-tertiary) !important;
        }

        .editor-wrapper .w-md-editor-content {
          background: var(--color-bg-primary) !important;
        }

        .editor-wrapper .w-md-editor-text-pre,
        .editor-wrapper .w-md-editor-text-input,
        .editor-wrapper .w-md-editor-text {
          color: var(--color-text-primary) !important;
        }

        .editor-wrapper .w-md-editor-preview {
          background: var(--color-bg-secondary) !important;
          border-left: 1px solid var(--color-border) !important;
          padding: 20px 24px !important;
        }

        .editor-wrapper .wmde-markdown {
          background: transparent !important;
          color: var(--color-text-primary) !important;
          font-family: var(--font-sans) !important;
        }

        .editor-wrapper .wmde-markdown h1,
        .editor-wrapper .wmde-markdown h2,
        .editor-wrapper .wmde-markdown h3 {
          color: var(--color-text-primary) !important;
          border-color: var(--color-border) !important;
        }

        .editor-wrapper .wmde-markdown code {
          background: var(--color-bg-tertiary) !important;
          color: var(--color-accent-primary) !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-family: var(--font-mono) !important;
        }

        .editor-wrapper .wmde-markdown pre {
          background: var(--color-bg-tertiary) !important;
          border-radius: var(--radius-md) !important;
          padding: 16px !important;
        }

        .editor-wrapper .wmde-markdown pre code {
          background: transparent !important;
          color: var(--color-text-primary) !important;
        }

        .editor-wrapper .wmde-markdown blockquote {
          border-left-color: var(--color-accent-primary) !important;
          color: var(--color-text-secondary) !important;
          background: var(--color-bg-tertiary) !important;
        }

        .editor-wrapper .wmde-markdown a {
          color: var(--color-accent-primary) !important;
        }

        .editor-wrapper .wmde-markdown hr {
          border-color: var(--color-border) !important;
        }

        .editor-wrapper .wmde-markdown table th,
        .editor-wrapper .wmde-markdown table td {
          border-color: var(--color-border) !important;
        }

        .editor-wrapper .wmde-markdown table tr:nth-child(2n) {
          background: var(--color-bg-tertiary) !important;
        }

        /* Read-only view */
        .markdown-view {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          background: var(--color-bg-primary);
        }

        .markdown-view .wmde-markdown {
          max-width: 800px;
          margin: 0 auto;
        }
      `}</style>
        </div>
    );
}
