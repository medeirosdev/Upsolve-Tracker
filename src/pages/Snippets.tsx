/**
 * @file Snippets.tsx
 * @description A code library for competitive programming templates with syntax highlighting (Monaco Editor).
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */
import { useState, useMemo } from 'react';
import { useSnippetStore, type Snippet } from '@/stores';
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Edit2,
  X,
  Save,
  Code2,
  FolderOpen,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/contexts';

const CATEGORIES = ['Algoritmos', 'Estruturas de Dados', 'Grafos', 'Matemática', 'Strings', 'Geometria', 'Outros'];
const LANGUAGES = ['cpp', 'python', 'java', 'javascript', 'rust', 'go'];

export function Snippets() {
  const { theme } = useTheme();
  const snippets = useSnippetStore((state) => state.snippets);
  const addSnippet = useSnippetStore((state) => state.addSnippet);
  const updateSnippet = useSnippetStore((state) => state.updateSnippet);
  const deleteSnippet = useSnippetStore((state) => state.deleteSnippet);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'cpp',
    code: '',
    category: 'Algoritmos',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  // Get unique categories from snippets
  const categories = useMemo(() => {
    const cats = new Set(snippets.map(s => s.category));
    return Array.from(cats).sort();
  }, [snippets]);

  // Filter snippets
  const filteredSnippets = useMemo(() => {
    return snippets.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [snippets, searchQuery, selectedCategory]);

  // Group snippets by category
  const groupedSnippets = useMemo(() => {
    const groups: Record<string, Snippet[]> = {};
    filteredSnippets.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSnippets]);

  const currentSnippet = snippets.find(s => s.id === selectedSnippet);

  const handleSelectSnippet = (id: string) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      setSelectedSnippet(id);
      setShowNewForm(false);
      setIsEditing(false);
      setFormData({
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        code: snippet.code,
        category: snippet.category,
        tags: [...snippet.tags],
      });
    }
  };

  const handleNewSnippet = () => {
    setShowNewForm(true);
    setSelectedSnippet(null);
    setIsEditing(true);
    setFormData({
      title: '',
      description: '',
      language: 'cpp',
      code: '// Seu código aqui...',
      category: 'Algoritmos',
      tags: [],
    });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (showNewForm) {
      addSnippet(formData);
      toast.success('Snippet criado!');
      setShowNewForm(false);
    } else if (selectedSnippet) {
      updateSnippet(selectedSnippet, formData);
      toast.success('Snippet atualizado!');
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (selectedSnippet && confirm('Deletar este snippet?')) {
      deleteSnippet(selectedSnippet);
      setSelectedSnippet(null);
      toast.success('Snippet deletado');
    }
  };

  const handleCopy = async () => {
    if (currentSnippet) {
      await navigator.clipboard.writeText(currentSnippet.code);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
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
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="snippets-page">
      {/* Sidebar */}
      <aside className="snippets-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Code2 size={20} />
            <span>Snippets</span>
          </div>
          <button className="btn-new" onClick={handleNewSnippet}>
            <Plus size={18} />
          </button>
        </div>

        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <button
            className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="snippets-list">
          {Object.entries(groupedSnippets).map(([category, items]) => (
            <div key={category} className="category-group">
              <div className="category-label">
                <FolderOpen size={14} />
                {category}
              </div>
              {items.map((snippet) => (
                <button
                  key={snippet.id}
                  className={`snippet-item ${selectedSnippet === snippet.id ? 'active' : ''}`}
                  onClick={() => handleSelectSnippet(snippet.id)}
                >
                  <span className="snippet-lang">{snippet.language}</span>
                  <span className="snippet-name">{snippet.title}</span>
                </button>
              ))}
            </div>
          ))}
          {filteredSnippets.length === 0 && (
            <div className="empty-list">
              <Code2 size={32} strokeWidth={1} />
              <p>Nenhum snippet</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="snippet-main">
        {!selectedSnippet && !showNewForm ? (
          <div className="placeholder">
            <div className="placeholder-icon">💻</div>
            <h2>Biblioteca de Snippets</h2>
            <p>Templates de código prontos para usar em competições</p>
            <button className="btn-primary" onClick={handleNewSnippet}>
              <Plus size={18} />
              Novo Snippet
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
                    placeholder="Nome do snippet..."
                  />
                ) : (
                  <h1>{formData.title}</h1>
                )}
              </div>
              <div className="header-actions">
                {isEditing ? (
                  <>
                    <button className="btn-ghost" onClick={() => {
                      setIsEditing(false);
                      if (showNewForm) setShowNewForm(false);
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
                    <button className="btn-copy" onClick={handleCopy}>
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
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
            <div className="editor-meta">
              {isEditing ? (
                <>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <span className="meta-badge lang">{formData.language.toUpperCase()}</span>
                  <span className="meta-badge cat">{formData.category}</span>
                </>
              )}
            </div>

            {/* Description */}
            {isEditing ? (
              <div className="description-edit">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do snippet (complexidade, uso, etc.)..."
                  rows={2}
                />
              </div>
            ) : (
              formData.description && (
                <div className="description-view">
                  <p>{formData.description}</p>
                </div>
              )
            )}

            {/* Tags */}
            {isEditing && (
              <div className="tags-edit">
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

            {/* Code Editor/View */}
            <div className="code-container">
              <Editor
                height="100%"
                language={formData.language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={formData.code}
                onChange={(value) => setFormData({ ...formData, code: value || '' })}
                options={{
                  readOnly: !isEditing,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>

            {/* Tags view */}
            {!isEditing && formData.tags.length > 0 && (
              <div className="tags-view">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag-readonly">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .snippets-page {
          display: flex;
          height: 100%;
          width: 100%;
          background: var(--color-bg-primary);
        }

        .snippets-sidebar {
          width: 300px;
          min-width: 300px;
          height: 100%;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 900px) {
          .snippets-sidebar {
            width: 260px;
            min-width: 260px;
          }
        }

        @media (max-width: 600px) {
          .snippets-sidebar {
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

        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 0 16px 16px;
        }

        .cat-btn {
          padding: 6px 12px;
          background: var(--color-bg-tertiary);
          border: none;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .cat-btn:hover {
          background: var(--color-bg-hover);
        }

        .cat-btn.active {
          background: var(--color-accent-primary);
          color: white;
        }

        .snippets-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px 20px;
        }

        .category-group {
          margin-bottom: 16px;
        }

        .category-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .snippet-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .snippet-item:hover {
          background: var(--color-bg-tertiary);
        }

        .snippet-item.active {
          background: var(--color-accent-gradient);
          color: white;
        }

        .snippet-lang {
          padding: 3px 8px;
          background: var(--color-bg-tertiary);
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          font-family: var(--font-mono);
        }

        .snippet-item.active .snippet-lang {
          background: rgba(255,255,255,0.2);
        }

        .snippet-name {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

        /* Main Area */
        .snippet-main {
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

        .editor-header h1 {
          font-size: 1.3rem;
          font-weight: 600;
        }

        .title-input {
          width: 100%;
          font-size: 1.3rem;
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

        .btn-copy {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid var(--color-success);
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-copy:hover {
          background: var(--color-success);
          color: white;
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
        }

        .btn-danger:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
          border-color: var(--color-error);
        }

        .editor-meta {
          display: flex;
          gap: 12px;
          padding: 16px 28px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .editor-meta select {
          padding: 10px 16px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .meta-badge {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .meta-badge.lang {
          background: var(--color-info-bg);
          color: var(--color-info);
          font-family: var(--font-mono);
        }

        .meta-badge.cat {
          background: var(--color-lavender-bg);
          color: var(--color-lavender);
        }

        .description-edit,
        .description-view {
          padding: 16px 28px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .description-edit textarea {
          width: 100%;
          padding: 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 0.9rem;
          resize: none;
          outline: none;
        }

        .description-view p {
          color: var(--color-text-secondary);
          font-size: 0.95rem;
        }

        .tags-edit {
          padding: 12px 28px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
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

        .code-container {
          flex: 1;
          overflow: hidden; /* Monaco handles scrolling */
          background: var(--color-bg-tertiary);
          min-height: 0; /* Important for flex child */
        }

        .tags-view {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px 28px;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border);
        }

        .tag-readonly {
          padding: 5px 12px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
