# HAUT Diário de Bordo — Frontend

Interface web do sistema **HAUT Diário de Bordo**, plataforma de acompanhamento de desempenho de corretores imobiliários. Oferece dashboards interativos, registro de atividades diárias, definição de metas e geração de relatórios em PDF.

---

## Tech Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2 | Biblioteca de UI |
| TypeScript | 5.3 | Tipagem estática |
| Vite | 5.0 | Build tool e dev server |
| Tailwind CSS | 3.4 | Estilização utilitária |
| React Router | 6.21 | Roteamento SPA |
| Axios | 1.6 | Cliente HTTP |
| Lucide React | 0.294 | Biblioteca de ícones |
| Chart.js | 4.4 | Gráficos nos relatórios (via CDN) |
| html2pdf.js | 0.10 | Geração de PDF (via CDN) |

---

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9+ (ou equivalente)
- Backend da API rodando (ver `gestao-haut-backend`)

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API backend | `/api/v1` |

---

## Instalação e Scripts

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vite` | Dev server com HMR |
| `build` | `tsc -b && vite build` | Compila TS e gera build de produção |
| `preview` | `vite preview` | Serve o build localmente |

---

## Estrutura de Pastas

```
src/
├── App.tsx                      # Componente raiz (AuthProvider + Router)
├── main.tsx                     # Entry point (React DOM)
├── index.css                    # Estilos globais, animações, fontes
├── config/
│   ├── api.ts                   # Configuração do Axios (interceptors, token)
│   └── constants.ts             # Constantes (meses, origens, tipos)
├── contexts/
│   └── AuthContext.tsx           # Context de autenticação (user, login, logout)
├── hooks/
│   ├── useAuth.ts               # Hook para acessar AuthContext
│   ├── useBrokerSelector.ts     # Seleção de corretor com filtro
│   ├── useMonthSelector.ts      # Seleção de mês
│   └── useToast.ts              # Notificações toast
├── router/
│   ├── index.tsx                # Definição de todas as rotas
│   ├── PrivateRoute.tsx         # Guard de autenticação
│   └── GestorRoute.tsx          # Guard de role gestor
├── pages/
│   ├── LoginPage.tsx            # Tela de login
│   ├── AlterarSenhaPage.tsx     # Alterar senha
│   ├── DashboardPage.tsx        # Dashboard consolidado
│   ├── IndividualPage.tsx       # Dashboard individual do corretor
│   ├── PositivacaoPage.tsx      # Registro de positivações
│   ├── CaptacaoPage.tsx         # Registro de captações
│   ├── NegociosPage.tsx         # Registro de negócios
│   ├── TreinamentosPage.tsx     # Registro de treinamentos
│   ├── InvestimentosPage.tsx    # Registro de investimentos
│   ├── RankingPage.tsx          # Ranking de corretores (gestor)
│   ├── MetasPage.tsx            # Definição de metas (gestor)
│   ├── ComentariosPage.tsx      # Comentários por corretor (gestor)
│   ├── UsuariosPage.tsx         # Gerenciamento de usuários (gestor)
│   ├── RelatoriosPage.tsx       # Geração de relatórios (gestor)
│   └── RelatorioPreviewPage.tsx # Preview e download de PDF (gestor)
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx        # Layout principal (sidebar + conteúdo)
│   │   ├── Sidebar.tsx          # Sidebar de navegação
│   │   └── MobileToggle.tsx     # Toggle do menu mobile
│   ├── ui/
│   │   ├── BarChart.tsx         # Gráfico de barras
│   │   ├── BrokerSelect.tsx     # Seletor de corretor
│   │   ├── Button.tsx           # Botão (variantes: dark, outline, primary, icon)
│   │   ├── CommentBox.tsx       # Caixa de comentário
│   │   ├── CurrencyInput.tsx    # Input de moeda (BRL)
│   │   ├── DataSection.tsx      # Seção com título
│   │   ├── DataTable.tsx        # Tabela ordenável com totais
│   │   ├── EmptyState.tsx       # Estado vazio
│   │   ├── FormGroup.tsx        # Wrapper de campo de formulário
│   │   ├── FormRow.tsx          # Linha de formulário
│   │   ├── Indicator.tsx        # Indicador colorido
│   │   ├── Modal.tsx            # Modal com backdrop blur
│   │   ├── MonthTabs.tsx        # Tabs de seleção de mês/ano
│   │   ├── PageHeader.tsx       # Cabeçalho de página
│   │   ├── ProgressBar.tsx      # Barra de progresso
│   │   ├── StatCard.tsx         # Card de métrica
│   │   ├── StatsGrid.tsx        # Grid de StatCards
│   │   ├── Tag.tsx              # Badge/tag
│   │   └── Toast.tsx            # Notificação toast
│   └── ranking/
│       ├── RankingCard.tsx      # Card de ranking
│       └── RankingItem.tsx      # Item individual do ranking
├── services/                    # Chamadas à API (axios)
│   ├── auth.service.ts
│   ├── captacoes.service.ts
│   ├── comentarios.service.ts
│   ├── dashboard.service.ts
│   ├── investimentos.service.ts
│   ├── metas.service.ts
│   ├── negocios.service.ts
│   ├── positivacoes.service.ts
│   ├── profiles.service.ts
│   ├── reports.service.ts
│   └── treinamentos.service.ts
├── types/
│   └── index.ts                 # Tipos TypeScript (User, Meta, etc.)
└── utils/
    ├── formatters.ts            # Formatação: moeda (BRL), percentual, números
    ├── helpers.ts               # Utilitários: soma de arrays, iniciais
    └── reportHtml.ts            # Gerador de HTML para relatórios PDF
```

---

## Páginas e Rotas

| Rota | Página | Acesso | Descrição |
|------|--------|--------|-----------|
| `/login` | LoginPage | Público | Tela de autenticação |
| `/alterar-senha` | AlterarSenhaPage | Autenticado | Alterar senha (obrigatório no primeiro login) |
| `/dashboard` | DashboardPage | Autenticado | Dashboard consolidado de todos os corretores |
| `/individual` | IndividualPage | Autenticado | Dashboard individual com metas vs realizado |
| `/positivacao` | PositivacaoPage | Autenticado | Registrar positivações (oportunidades, VGV) |
| `/captacao` | CaptacaoPage | Autenticado | Registrar captações de imóveis |
| `/negocios` | NegociosPage | Autenticado | Registrar negócios levantados |
| `/treinamentos` | TreinamentosPage | Autenticado | Registrar horas de treinamento |
| `/investimentos` | InvestimentosPage | Autenticado | Registrar investimentos em marketing/networking |
| `/ranking` | RankingPage | Gestor | Ranking de desempenho dos corretores |
| `/metas` | MetasPage | Gestor | Definir metas mensais por corretor |
| `/comentarios` | ComentariosPage | Gestor | Comentários do gestor por corretor |
| `/usuarios` | UsuariosPage | Gestor | Gerenciamento de usuários (criar, editar, ativar/desativar) |
| `/relatorios` | RelatoriosPage | Gestor | Selecionar corretor/período para gerar relatório |
| `/relatorios/preview/:slug` | RelatorioPreviewPage | Gestor | Preview do relatório com opção de download PDF |

### Guards de Rota

- **PrivateRoute**: Redireciona para `/login` se não autenticado. Força `/alterar-senha` se `must_change_password` for `true`.
- **GestorRoute**: Redireciona para `/dashboard` se o role do usuário não for `gestor`.

---

## Roles e Acesso

| Role | Acesso |
|------|--------|
| `corretor` | Dashboard, Individual, Positivação, Captação, Negócios, Treinamentos, Investimentos |
| `gestor` | Tudo acima + Ranking, Metas, Comentários, Usuários, Relatórios |

### Navegação da Sidebar

- **Principal**: Dashboard, Individual
- **Diário de Bordo**: Positivação, Captação, Negócios Levantados, Treinamentos, Investimentos
- **Gestão** (gestor only): Ranking, Definir Metas, Comentários, Usuários, Relatórios

---

## Design System

### Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `accent` | `#B57170` | Cor principal da marca (terracotta/rosé) |
| `positive` | `#22c55e` | Indicadores positivos |
| `negative` | `#ef4444` | Indicadores negativos |
| `warning` | `#f59e0b` | Alertas |
| `black` | `#0a0a0a` | Textos e backgrounds escuros |
| `white` | `#ffffff` | Backgrounds claros |
| `gray-50..900` | `#fafafa..#171717` | Escala de cinzas |

### Fontes

| Token | Fonte | Uso |
|-------|-------|-----|
| `main` | Outfit | Fonte principal da interface |
| `mono` | Space Mono | Texto monospace |
| — | Mendl Sans Dawn | Branding/logo (Light, Regular, Medium, SemiBold) |
| — | JetBrains Mono | Fontes nos relatórios PDF |

### Componentes UI

Todos os componentes são custom, construídos com **Tailwind CSS** + **Lucide React** (ícones). Sem biblioteca externa de UI.

- **Button** — variantes: `dark`, `outline`, `primary`, `icon`; tamanhos: `sm`, `md`
- **Modal** — dialog com backdrop blur e animação
- **DataTable** — tabela ordenável com linha de totais opcional
- **StatCard** — card de métrica com label, valor e indicador de variação
- **MonthTabs** — tabs de seleção de mês com navegação por ano
- **Toast** — notificação com auto-dismiss (3s)
- **ProgressBar** — visualização de progresso
- **CurrencyInput** — input formatado em BRL (R$)

---

## Geração de Relatórios PDF

O sistema gera relatórios completos em PDF para cada corretor:

### Fluxo

1. **RelatoriosPage** — Gestor seleciona o corretor, mês e ano
2. **RelatorioPreviewPage** — Busca dados via `GET /reports/broker/:brokerId`
3. **reportHtml.ts** — `buildReportHtml()` gera HTML completo com CSS inline
4. **Exibição** — HTML renderizado em `<iframe srcDoc={html} />`
5. **Download** — html2pdf.js converte o HTML para PDF (A4, portrait)

### Páginas do Relatório

| # | Conteúdo |
|---|----------|
| 1 | Capa + KPIs principais + Gauges + Gráfico Meta vs Realizado |
| 2 | Evolução acumulada (linha) + Radar de desempenho (6 dimensões) |
| 3 | Resultados mensais + Tabelas de positivação/captação + Taxas de efetividade |
| 4 | Negócios levantados + Distribuição por origem (doughnut + barras) |
| 5 | Treinamentos + Investimentos (gráficos e tabelas) |
| 6 | Comentário do gestor + Blocos de assinatura |

### Tecnologias do Relatório

- **Chart.js 4.4.1** (via CDN) — gráficos de barras, linhas, doughnut, radar e gauge
- **html2pdf.js 0.10.2** (via CDN) — conversão HTML para PDF
- Canvas convertido para PNG antes da captura para compatibilidade
- Formato: A4, portrait, margem 0mm
- Nome do arquivo: `{nome_corretor}_{mês}_{ano}.pdf`

---

## Autenticação

1. Usuário faz login via `POST /auth/login`
2. Token JWT armazenado em `localStorage['haut_token']`
3. Dados do usuário armazenados em `localStorage['haut_user']`
4. Token anexado automaticamente a todas as requisições via interceptor do Axios
5. Respostas 401 redirecionam para `/login`
6. Respostas 403 com `MUST_CHANGE_PASSWORD` redirecionam para `/alterar-senha`
