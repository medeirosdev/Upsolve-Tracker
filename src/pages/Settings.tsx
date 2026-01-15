/**
 * @file Settings.tsx
 * @description Manages application configuration, data export/import, and dangerous actions like clearing storage.
 * @author Guilherme de Medeiros
 * @copyright 2026 UpSolve
 * @license MIT
 */
import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  CheckCircle,
  AlertTriangle,
  Trash2,
  HardDrive,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BackupData {
  version: string;
  exportedAt: string;
  data: {
    problems: any;
    notes: any;
    snippets: any;
    goals: any;
    badges: any;
  };
}

export function Settings() {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all localStorage data
  const getBackupData = (): BackupData => {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        problems: localStorage.getItem('upsolve-problems'),
        notes: localStorage.getItem('upsolve-notes'),
        snippets: localStorage.getItem('upsolve-snippets'),
        goals: localStorage.getItem('upsolve-goals'),
        badges: localStorage.getItem('upsolve-badges'),
      },
    };
  };

  // Export backup
  const handleExport = () => {
    try {
      const backup = getBackupData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upsolve-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup');
      console.error(error);
    }
  };

  // Import backup
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backup: BackupData = JSON.parse(e.target?.result as string);

        // Validate backup structure
        if (!backup.version || !backup.data) {
          throw new Error('Arquivo de backup inválido');
        }

        // Restore each store
        if (backup.data.problems) {
          localStorage.setItem('upsolve-problems', backup.data.problems);
        }
        if (backup.data.notes) {
          localStorage.setItem('upsolve-notes', backup.data.notes);
        }
        if (backup.data.snippets) {
          localStorage.setItem('upsolve-snippets', backup.data.snippets);
        }
        if (backup.data.goals) {
          localStorage.setItem('upsolve-goals', backup.data.goals);
        }
        if (backup.data.badges) {
          localStorage.setItem('upsolve-badges', backup.data.badges);
        }

        toast.success('Backup restaurado! Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error('Arquivo de backup inválido');
        console.error(error);
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  // Clear all data
  const handleClearData = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Tem certeza?')) {
      if (confirm('Esta ação é IRREVERSÍVEL. Deseja continuar?')) {
        localStorage.removeItem('upsolve-problems');
        localStorage.removeItem('upsolve-notes');
        localStorage.removeItem('upsolve-snippets');
        localStorage.removeItem('upsolve-goals');
        localStorage.removeItem('upsolve-badges');
        toast.success('Dados apagados. Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  };

  // Calculate storage usage
  const getStorageSize = () => {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('upsolve-')) {
        total += (localStorage.getItem(key) || '').length * 2; // UTF-16 = 2 bytes per char
      }
    }
    if (total < 1024) return `${total} B`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
    return `${(total / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Count items
  const getCounts = () => {
    const problems = JSON.parse(localStorage.getItem('upsolve-problems') || '{"state":{"problems":[]}}');
    const notes = JSON.parse(localStorage.getItem('upsolve-notes') || '{"state":{"notes":[]}}');
    const snippets = JSON.parse(localStorage.getItem('upsolve-snippets') || '{"state":{"snippets":[]}}');
    const badges = JSON.parse(localStorage.getItem('upsolve-badges') || '{"state":{"unlockedBadges":[]}}');

    return {
      problems: problems.state?.problems?.length || 0,
      notes: notes.state?.notes?.length || 0,
      snippets: snippets.state?.snippets?.length || 0,
      badges: badges.state?.unlockedBadges?.length || 0,
    };
  };

  const counts = getCounts();

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Configurações</h1>
        <p>Gerencie seus dados e preferências</p>
      </header>

      {/* Storage Info */}
      <section className="settings-section">
        <h2><HardDrive size={20} /> Armazenamento</h2>
        <div className="storage-info">
          <div className="storage-stat">
            <span className="storage-value">{getStorageSize()}</span>
            <span className="storage-label">Utilizado</span>
          </div>
          <div className="storage-divider" />
          <div className="storage-counts">
            <div className="count-item">
              <span className="count-value">{counts.problems}</span>
              <span className="count-label">Questões</span>
            </div>
            <div className="count-item">
              <span className="count-value">{counts.notes}</span>
              <span className="count-label">Notas</span>
            </div>
            <div className="count-item">
              <span className="count-value">{counts.snippets}</span>
              <span className="count-label">Snippets</span>
            </div>
            <div className="count-item">
              <span className="count-value">{counts.badges}</span>
              <span className="count-label">Badges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Backup Section */}
      <section className="settings-section">
        <h2><Database size={20} /> Backup de Dados</h2>

        <div className="backup-cards">
          {/* Export */}
          <div className="backup-card export">
            <div className="backup-icon">
              <Download size={32} />
            </div>
            <div className="backup-info">
              <h3>Exportar Backup</h3>
              <p>Baixe um arquivo JSON com todos os seus dados: questões, notas, snippets, metas e badges.</p>
            </div>
            <button className="btn-export" onClick={handleExport}>
              <Download size={18} />
              Exportar Backup
            </button>
          </div>

          {/* Import */}
          <div className="backup-card import">
            <div className="backup-icon">
              <Upload size={32} />
            </div>
            <div className="backup-info">
              <h3>Importar Backup</h3>
              <p>Restaure seus dados a partir de um arquivo de backup. Isso substituirá os dados atuais.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button
              className="btn-import"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload size={18} />
              {importing ? 'Importando...' : 'Importar Backup'}
            </button>
          </div>
        </div>

        <div className="backup-tips">
          <CheckCircle size={16} />
          <span>Recomendamos fazer backup semanalmente</span>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section danger-zone">
        <h2><AlertTriangle size={20} /> Zona de Perigo</h2>
        <div className="danger-card">
          <div className="danger-info">
            <h3>Apagar Todos os Dados</h3>
            <p>Remove permanentemente todas as questões, notas, snippets e progresso. Esta ação é irreversível.</p>
          </div>
          <button className="btn-danger" onClick={handleClearData}>
            <Trash2 size={18} />
            Apagar Tudo
          </button>
        </div>
      </section>

      <style>{`
        .settings-page {
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .settings-header p {
          color: var(--color-text-muted);
        }

        .settings-section {
          margin-bottom: 32px;
        }

        .settings-section h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        /* Storage Info */
        .storage-info {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 24px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .storage-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .storage-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-accent-primary);
        }

        .storage-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .storage-divider {
          width: 1px;
          height: 50px;
          background: var(--color-border);
        }

        .storage-counts {
          display: flex;
          gap: 24px;
          flex: 1;
        }

        .count-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .count-value {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .count-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Backup Cards */
        .backup-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 16px;
        }

        @media (max-width: 700px) {
          .backup-cards {
            grid-template-columns: 1fr;
          }
        }

        .backup-card {
          padding: 24px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .backup-card.export {
          border-color: var(--color-success);
          background: linear-gradient(135deg, var(--color-success-bg) 0%, var(--color-bg-secondary) 100%);
        }

        .backup-card.import {
          border-color: var(--color-info);
          background: linear-gradient(135deg, var(--color-info-bg) 0%, var(--color-bg-secondary) 100%);
        }

        .backup-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .backup-card.export .backup-icon {
          background: var(--color-success-bg);
          color: var(--color-success);
        }

        .backup-card.import .backup-icon {
          background: var(--color-info-bg);
          color: var(--color-info);
        }

        .backup-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .backup-info p {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .btn-export, .btn-import {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-export {
          background: var(--color-success);
          color: white;
        }

        .btn-export:hover {
          background: #4ca874;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(93, 184, 130, 0.4);
        }

        .btn-import {
          background: var(--color-info);
          color: white;
        }

        .btn-import:hover {
          background: #4a9cc7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(92, 169, 211, 0.4);
        }

        .btn-import:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .backup-tips {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .backup-tips svg {
          color: var(--color-success);
        }

        /* Danger Zone */
        .danger-zone h2 {
          color: var(--color-error);
        }

        .danger-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 24px;
          background: var(--color-error-bg);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-lg);
        }

        .danger-info h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .danger-info p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--color-error);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .btn-danger:hover {
          background: #c53030;
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .danger-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
