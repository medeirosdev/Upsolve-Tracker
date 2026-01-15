# UpSolve

Plataforma desktop para acompanhar sua evolução em programação competitiva.

---

## 1. Stack Tecnológica

### Core
- **Electron + Vite** - Scaffolding rápido com electron-vite
- **React 18 + TypeScript** - Tipagem essencial para manutenibilidade

### UI & Estilização
| Lib | Propósito |
|-----|-----------|
| **Tailwind CSS** | Utility-first CSS |
| **shadcn/ui** | Componentes customizáveis (tabelas, cards, dialogs) |
| **Lucide React** | Ícones modernos e consistentes |
| **Framer Motion** | Animações fluidas e transições |

### Database
| Lib | Propósito |
|-----|-----------|
| **better-sqlite3** | SQLite síncrono, rápido e ACID compliant |
| **Drizzle ORM** | Type-safe ORM leve para SQLite |

> **Por que SQLite?**
> - Queries indexadas e performáticas
> - Suporte nativo a filtros complexos (WHERE, JOIN, GROUP BY)
> - Escala bem com milhares de registros
> - Backup simples (1 arquivo `.db`)

### Visualização & Gráficos
| Lib | Propósito |
|-----|-----------|
| **Recharts** | Gráficos de linha, barra, área |
| **react-activity-calendar** | Heatmap estilo GitHub |
| **@nivo/calendar** | Alternativa para heatmaps avançados |

### Editor & Markdown
| Lib | Propósito |
|-----|-----------|
| **@uiw/react-md-editor** | Editor Markdown com preview integrado |
| **react-syntax-highlighter** | Syntax highlighting para código |
| **Prism.js** | Temas de código (Dracula, One Dark) |

### Utilidades
| Lib | Propósito |
|-----|-----------|
| **date-fns** | Manipulação de datas leve |
| **uuid** | Geração de IDs únicos |
| **zod** | Validação de schemas type-safe |
| **zustand** | State management simples |
| **react-hot-toast** | Notificações elegantes |
| **cmdk** | Command palette (Ctrl+K) |

---

## 2. Funcionalidades Principais (MVP)

### A. Logbook (Registro Diário)
Onde você registra o "grind".

**Inputs:**
- Nome da questão
- Link
- Plataforma (Codeforces, Beecrowd, LeetCode, AtCoder)
- Dificuldade (Rating)
- Status (AC, WA, TLE, MLE, RE, DOING)
- Tags (DP, Grafos, Greedy, Math, etc.)
- Tempo gasto (opcional)
- Notas rápidas

**Visualização:**
- Tabela com filtros e ordenação
- Ex: "Mostrar só questões de Grafos que errei"

### B. Grimório (Knowledge Base)
Onde você explica para si mesmo o que aprendeu.

**Features:**
- Editor Markdown com preview lado a lado
- Syntax highlighting para C++/Python
- Vincular artigos a questões específicas do Logbook
- Organização por categorias/tags

### C. Dashboard (Gamificação)
**Métricas:**
- Heatmap de contribuição (estilo GitHub)
- Questões resolvidas hoje/semana/mês
- Precisão (% de ACs)
- Tópicos mais estudados
- Streak atual 🔥
- Gráfico de evolução de rating

### D. Templates & Snippets
**Features:**
- Biblioteca de códigos prontos (Segment Tree, Dijkstra, etc.)
- Copiar com 1 clique
- Syntax highlighting
- Organização por categoria

---

## 3. Schema do Banco de Dados (SQLite)

```sql
-- Questões resolvidas
CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  link TEXT,
  difficulty INTEGER,
  status TEXT NOT NULL DEFAULT 'DOING',
  time_spent INTEGER, -- minutos
  quick_notes TEXT,
  linked_note_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  solved_at DATETIME,
  FOREIGN KEY (linked_note_id) REFERENCES notes(id)
);

-- Tags das questões (relação N:N)
CREATE TABLE problem_tags (
  problem_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (problem_id, tag),
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- Notas/Artigos do Grimório
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags das notas
CREATE TABLE note_tags (
  note_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (note_id, tag),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Templates/Snippets de código
CREATE TABLE snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'cpp',
  code TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks úteis
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Metas diárias/semanais
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- Índices para performance
CREATE INDEX idx_problems_date ON problems(created_at);
CREATE INDEX idx_problems_platform ON problems(platform);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problem_tags_tag ON problem_tags(tag);
```

---

## 4. Roadmap de Desenvolvimento

### Fase 1: Setup & Infraestrutura
- [ ] Configurar projeto com `electron-vite`
- [ ] Setup TypeScript + ESLint + Prettier
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Implementar camada IPC (preload/main)
- [ ] Setup SQLite com better-sqlite3 + Drizzle

### Fase 2: CRUD de Questões
- [ ] Formulário de adição de questões
- [ ] Data Table com filtros e ordenação
- [ ] Edição inline de status/tags
- [ ] Sistema de tags com autocomplete

### Fase 3: Editor Markdown (Grimório)
- [ ] Integrar react-md-editor
- [ ] Preview lado a lado
- [ ] Syntax highlighting (C++, Python, Java)
- [ ] Vincular notas a questões

### Fase 4: Dashboard & Analytics
- [ ] Heatmap de atividade
- [ ] Cards de estatísticas
- [ ] Gráficos de evolução
- [ ] Sistema de streaks e metas

### Fase 5: Features Avançadas
- [ ] Command palette (Ctrl+K)
- [ ] Templates/Snippets de código
- [ ] Integração com APIs (Codeforces, LeetCode)
- [ ] Backup automático
- [ ] Temas (Light/Dark)

---

## 5. Integrações Futuras

### APIs Suportadas
- **Codeforces API** - Sync automático de submissões
- **LeetCode GraphQL** - Importar histórico
- **AtCoder** - Dados de contests

### Export & Backup
- Backup automático para pasta local
- Export para JSON/CSV
- Sync com Google Drive (futuro)

---

## 6. Comandos Úteis

```bash
# Criar projeto
npm create electron-vite@latest upsolve -- --template react-ts

# Instalar dependências principais
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3

# UI
npx shadcn@latest init
npm install lucide-react framer-motion

# Gráficos & Visualização
npm install recharts react-activity-calendar

# Editor Markdown
npm install @uiw/react-md-editor react-syntax-highlighter

# Utilidades
npm install date-fns uuid zod zustand react-hot-toast cmdk
```