# Design System

Sistema de design do **easycert** — tokens, componentes, motion, guardrails para a aplicação autenticada. Referência detalhada em [[superpowers/specs/2026-10-20-design-system-easycert]].

---

## Dials & Personalidade

Aplicação interna autenticada para emissão de declarações (alunos) e processamento de fila (coordenadores). Linguagem visual: **Linear/Notion-ish moderno** com polish do Emil Kowalski. Sério sem ser burocrático. Verde `#27592e` como accent único.

Dials de projeto:
- `DESIGN_VARIANCE = 3` — consistência > surpresa. Grid previsível reduz carga cognitiva.
- `MOTION_INTENSITY = 4` — Emil polish (scale press, popover origin-aware), nunca showcase.
- `VISUAL_DENSITY = 5-7` — aluno mode = 5 (respiração), coord mode = 7 (dense tables).

## Stack travada

| Camada | Decisão |
|---|---|
| Framework | Next.js 15 App Router + React 19 |
| Styling | Tailwind v4 via `@tailwindcss/postcss` |
| Componentes | shadcn/ui em `apps/web/src/components/ui/` com tokens customizados — nunca default |
| Utilitários | `clsx` + `tailwind-merge` compostos em util `cn()`; `class-variance-authority` (`cva`) para variantes |
| Motion | Motion (`import { motion } from "motion/react"`); legacy `framer-motion` proibido |
| Ícones | `@phosphor-icons/react`, peso `regular` default + `fill` para ativos |
| Tipografia | Satoshi (display + body) + JetBrains Mono (números/códigos), self-hosted via `next/font/local` |
| Theming | CSS variables shadcn-padrão, persistência via **cookie HTTP** (`easycert.theme`, `easycert.density`) |

Status do repo em 2026-10-20: `apps/web` é greenfield — zero Tailwind, zero PostCSS, zero fonts. Setup completo (Tailwind v4 + PostCSS + shadcn init + `next/font/local` + theme provider + token file + cookie de persistência) é escopo do primeiro PR frontend.

## Tokens de cor

### Light

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#fafafa` | Base de página |
| `--foreground` | `#09090b` | Texto primário |
| `--muted` | `#f4f4f5` | Fundo secundário, hover sutil |
| `--muted-foreground` | `#71717a` | Texto auxiliar, placeholders |
| `--border` / `--input` | `#e4e4e7` | Linhas, borda de input |
| `--accent` | `#27592e` | CTA primário, link, badge verificado, focus ring |
| `--accent-foreground` | `#fafafa` | Texto sobre accent (contrast 7.7:1 AAA) |
| `--accent-muted` | `rgba(39,89,46,0.10)` | Fundo de badge discreto |
| `--destructive` | `#dc2626` | Rejeição, destrutivo |
| `--warning` | `#d97706` | Pendência, atenção |

### Dark

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#09090b` | Base |
| `--foreground` | `#fafafa` | Texto primário |
| `--muted` | `#18181b` | Fundo secundário |
| `--muted-foreground` | `#a1a1aa` | Texto auxiliar |
| `--border` / `--input` | `#27272a` | Linhas |
| `--accent` | `#4a9b58` | Verde clareado (WCAG AA 5.75:1) |
| `--accent-foreground` | `#09090b` | Texto sobre accent clareado |
| `--accent-muted` | `rgba(74,155,88,0.15)` | Badge discreto |
| `--destructive` | `#ef4444` | Vermelho clareado |
| `--warning` | `#f59e0b` | Âmbar clareado |

**Regras duras:**
1. Verde é accent único. Nunca background de página, nunca gradient.
2. Máximo 1 CTA primary verde por viewport visível. Secundários são `outline` / `ghost`.
3. Semantic dots permitidos (status). Decorative dots proibidos.
4. Qualquer componente novo testado light + dark antes de merge.

## Tipografia

### Famílias

- **Satoshi** (Fontshare, self-hosted, free) — pesos 400 / 500 / 700 / 900. `font-display: swap`.
- **JetBrains Mono** (OFL) — pesos 400 / 500. Para ID de pedido, matrícula, verificação, timestamps, hashes.

> [!info] A confirmar
> Fontshare serve Satoshi 900 (black)? Se não, degradar para 700 bold em todos os usos. Ver [[dominio/pendencias]].

### Escala

Sem `text-7xl` / `text-8xl` — é sistema de trabalho, não landing:

| Token | px | Uso |
|---|---|---|
| `text-xs` | 12 | Metadados em tabela |
| `text-sm` | 14 | Body em dashboards densos |
| `text-base` | 16 | Body em contexto de leitura |
| `text-lg` | 18 | Títulos de seção |
| `text-xl` | 20 | Títulos de card |
| `text-2xl` | 24 | Títulos de página |
| `text-3xl` | 30 | Hero do aluno ("Minha declaração") |
| `text-4xl` | 36 | Telas de sucesso (raro) |

**Regras:** ênfase via peso (500 → 700). Zero serif. JetBrains Mono obrigatório para ID/matrícula/código/data/hash. Prose cap: `max-w-[65ch]`.

## Spacing, forma, sombras

**Spacing:** escala Tailwind default (4px step).
- Aluno mode: `gap-6` entre blocos, `py-8` em seções.
- Coord mode: `gap-4` entre blocos, `py-6` em seções, `py-2` em rows de tabela.

**Grid & container:**
- Default: `max-w-7xl mx-auto px-4` (ou `px-6` em `md+`).
- Coord mode telas densas: `max-w-full px-6`.
- Full-height: `min-h-[100dvh]` (nunca `h-screen` — Safari address bar quebra).
- Layouts complexos: CSS Grid > flex-math.

**Border radius — Shape Consistency Lock:**

| Elemento | Radius |
|---|---|
| Buttons, inputs, cards, selects | `rounded-md` (6px) |
| Modais, popovers, dropdowns | `rounded-lg` (8px) |
| Badges, pills, chips | `rounded-full` |
| Avatars | `rounded-full` |

**Shadows tintadas em zinc** (nunca black):

```css
--shadow-sm: 0 1px 2px rgba(24, 24, 27, 0.05);
--shadow-md: 0 4px 12px rgba(24, 24, 27, 0.08);
--shadow-lg: 0 12px 32px rgba(24, 24, 27, 0.12);
```

Dark mode: mesma declaração, depth vem de `border`.

## Motion (Emil Kowalski)

### Easings

```css
--ease-out:     cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);
```

### Durações

| Elemento | Enter | Exit | Easing |
|---|---|---|---|
| Button press | 160ms | — | `--ease-out` |
| Hover color | 150ms | 150ms | `ease` |
| Tooltip / popover | 180ms | 120ms | `--ease-out` |
| Dropdown | 200ms | 150ms | `--ease-out` |
| Modal / drawer | 240ms | 180ms | `--ease-drawer` |
| Toast | 300ms | 200ms | `--ease-out` |

Exit ~25% mais rápido que enter.

### Hard rules

1. Nunca `scale(0) → scale(1)`. Mínimo: `scale(0.95) + opacity(0) → scale(1) + opacity(1)`.
2. Todo botão: `transform: scale(0.97)` em `:active`, transição 160ms.
3. Popover: `transform-origin: var(--transform-origin)` (Radix entrega).
4. Nunca `ease-in` em UI (entrada lenta é sluggish).
5. Só `transform` e `opacity` animados. Nunca width/height/top/left/padding/margin.
6. Hover gated: `@media (hover: hover) and (pointer: fine)`.
7. `prefers-reduced-motion: reduce` → motion intensidade 3+ colapsa para `opacity` only ou instantâneo.

### Keyboard-initiated actions

**Zero animação em ação disparada por tecla.** Coord usa `j`/`k`/`Enter`/`Esc`/`⌘K` o dia inteiro:

- Navegar com `j`/`k`: seleção instantânea (`transition: none`).
- Abrir com `Enter`: side panel aparece sem scale/opacity (`transition-duration: 0`).
- Fechar com `Esc`: instantâneo.
- `⌘K` command palette: abre instantâneo após primeiro uso.

Mesma ação via mouse mantém animação normal.

### Stagger em listas

- Delay entre items: **40ms** (dentro de 30-80ms do Emil).
- Max 10 items staggered. A partir do 11°, aparece junto.
- Com `prefers-reduced-motion`: todos aparecem juntos.

## Ícones (Phosphor)

Tamanhos: 16px (dense table, inline), 20px (buttons, nav), 24px (headers, empty-state).
Peso default: `regular` (stroke 1.5). Ativo/selecionado: `fill`. `strokeWidth` padronizado via wrapper.

### Semântica de status (domínio-owned)

A lista de status é **owned pelo domínio/backend** (ver [[dominio/fluxo-aprovacao]]). Design apenas mapeia ícone + cor.

**Submissão:**

| Status | Ícone | Peso | Cor |
|---|---|---|---|
| `Rascunho` | `PencilSimple` | regular | `--muted-foreground` |
| `Pendente` | `Clock` | regular | `--warning` |
| `Em análise` | `MagnifyingGlass` | regular | `--muted-foreground` |
| `Aprovada` | `CheckCircle` | fill | `--accent` |
| `Indeferida` | `XCircle` | fill | `--destructive` |

**Documento:**

| Status | Ícone | Peso | Cor |
|---|---|---|---|
| `Emitido` | `Certificate` | fill | `--accent` |

### Semântica de ação

| Ação | Ícone |
|---|---|
| Download | `DownloadSimple` |
| Verificar / QR | `QrCode` |
| Comentário | `ChatCircle` |
| Deletar | `Trash` |
| Editar | `PencilSimple` |
| Aprovar | `Check` |
| Rejeitar | `X` |
| Filtrar | `Funnel` |
| Buscar | `MagnifyingGlass` |

**Regras:** nunca hand-roll SVG. Faltou glifo → chamar maintainer. Nunca mixar libraries — Phosphor only.

## Dois registros, mesmo sistema

### Aluno mode

- Composição: `max-w-5xl mx-auto`, `gap-6`, `py-8` em seções.
- Max 3 itens por row.
- CTAs maiores (`size="lg"`).
- Texto explicativo sob títulos de seção.
- Confirmação em ações destrutivas.
- Loading state visível desde 100ms de delay.

### Coord mode

- Composição: `max-w-full px-6`.
- Tabela densa (shadcn/ui `Table` + TanStack Table), `py-2` por row.
- Ações de linha visíveis no hover, não sempre.
- Multi-select com checkbox column.
- Detalhe abre em **side panel direito** (`Sheet`, 480px), não modal.

**Atalhos v1:**
- `j` / `k` → navegar rows
- `Enter` → abrir side panel
- `Esc` → fechar
- `R` → rejeitar (abre dialog com motivo)

**Atalhos antecipados (futuro):**
- `⌘K` → command palette (requer spec de busca)
- `A` → aprovar em lote (requer bulk approval)

**Densidade:** toggle `Compact / Comfortable` persistido em **cookie HTTP**.

### Mobile strategy

- **Coord é desktop-first.** Em `< md`, fila renderiza read-only. Telas densas exibem banner "Requer desktop ≥ 1024px".
- **Aluno é mobile-first.** Todas as telas funcionam em `< md` com cards empilhados.

Justificativa: coord opera do escritório; aprovar do celular não é caso real.

### Persistência de preferências (cookie)

Toggle de tema (light/dark) e densidade (compact/comfortable) persistem em **cookie HTTP**, não localStorage. Motivação: Server Component lê cookie no primeiro render → zero FOUC.

Nomes de cookie:
- `easycert.theme` — valores `light` | `dark` | `system` (default `system`).
- `easycert.density` — valores `compact` | `comfortable` (default `comfortable`).

Atributos: `Path=/`, `Max-Age=31536000` (1 ano), `SameSite=Lax`. `Secure` obrigatório em prod.

> [!info] A confirmar
> Sync cross-device via backend. Se virar requisito, modela `UserPreferences` na API. Registrado em [[dominio/pendencias]].

## Estados de UI (first-class)

### Empty state

Ícone Phosphor grande, headline curta, subtext, CTA primário se há ação. Sem placeholder data. Sem "lorem ipsum".

### Loading state

Skeleton matching final layout. Row de tabela → skeleton de row. Card → skeleton de card. Shimmer sutil (`animate-pulse`). Visível desde 100ms.

### Error state

Headline do contexto. Subtext em prose. Ação secundária `[Tentar novamente]`. Nunca stack trace. Nunca código HTTP.

### Partial / stale state

Toast discreto (Sonner): "Status atualizado. [Recarregar]". Não força reload.

### Offline

Banner no topo (`bg-warning/10`, `WifiSlash` em `--warning`): "Sem conexão. Tentando reconectar...". Formulários `disabled`. Toast ao reconectar: "Conexão restaurada." Ações enfileiradas em memória.

### Sem permissão (401 / 403)

- **401:** redirect a `/login` com `?returnTo=`.
- **403:** full-page dedicada, ícone `Prohibit`, headline "Sem permissão", subtext, CTA `[Voltar]`. Nunca stack trace.

## Table discipline

### Border rule

Pick ONE: **row-hover tint** (`hover:bg-muted/50`) **OU** divisores entre rows (`divide-y`).

Default easycert: **row-hover tint**, sem divisores. Linhas horizontais só entre header-body e body-footer.

### Column alignment

- Texto: `text-left`.
- Números, datas, códigos (JetBrains Mono): `text-right` + `tabular-nums`.
- Status badges: `text-center` em coluna estreita.
- Ações: `text-right`.

### Density

- Default: `py-3 px-4` (comfortable).
- Toggle compact: `py-2 px-3`.
- Nunca `py-1` ou menos (acessibilidade).

## CTA discipline

- Label: máximo 3 palavras, idealmente 1-2. ("Solicitar", "Enviar pedido", "Aprovar", "Baixar PDF").
- 1 linha no desktop, sempre.
- Zero duplicate CTA intent por tela.
- Loading state: "Enviando..." com spinner, `aria-busy="true"`, `disabled`.
- Success: redirect ou toast, não muda label para "✓ Enviado".

## Acessibilidade

- **WCAG AA mínimo** (4.5:1 body, 3:1 ≥ 18px).
- **WCAG AAA alvo** em hero copy aluno e texto de documento.
- **Focus ring:** `2px solid var(--ring)` com `2px` offset. Nunca `outline: none` sem substituir.
- **Label ACIMA do input**, nunca placeholder-as-label.
- **Erro ABAIXO do input**, cor `var(--destructive)`, ícone `WarningCircle` 16px, `role="alert"`.
- **`aria-describedby`** conectando input a erro.
- **Keyboard nav completa:** tab order lógica, skip-to-content, atalhos em dialog `?`.
- **`prefers-reduced-motion`** honrado em intensidade 3+.
- **`prefers-reduced-transparency`** se usar `backdrop-filter` (nenhuma necessidade prevista).

## Anti-slop guardrails específicos

| Anti-pattern | Por que importa |
|---|---|
| Hero com stats grandes | App interno, não landing |
| "Trusted by" strip | Mesmo |
| 3 cards equal-width | Vira default de landing |
| Mesh gradient | Zero |
| AI-purple / neon glow | Accent é `#27592e` |
| Centered hero em dashboard | Dashboards left-aligned |
| Em-dash (`—`) em copy | Zero — usar hífen ou ponto |
| Serif em headline | Zero — Satoshi only |
| Inter como fallback | Satoshi primeiro, system sans fallback |
| Mistura de ícone families | Zero — Phosphor only |
| `scale(0) → scale(1)` | Zero |
| Scroll-hijack / pin-scrub | Zero |
| Marquee | Zero |
| Decorative dots | Zero — dots só em status |
| Fake-precision numbers | Ou número real, ou `[mock]` explícito |
| Jane Doe / Acme placeholders | Nomes brasileiros (`Ana Oliveira`, `Carlos Mendes`) |
| Version footer | Versão só em "sobre" / settings |
| Decoração text strip | Zero |
| Scroll cues | Zero |
| Section-numbering eyebrows | Zero |
| `border-t + border-b` em rows | Zero — usar row-hover tint |

## Copy self-audit

Antes de cada PR que mexe em UI:

1. Re-ler toda string visível: headlines, botões, labels, placeholders, erros, empty states, toasts.
2. Flagar strings que sejam:
   - Gramaticalmente quebradas
   - Com referentes ambíguos
   - Soando como "AI tentando ser poético"
   - Em inglês quando o resto é PT-BR
3. Reescrever para prose funcional. Frase direta > frase cute.
4. Zero em-dash no diff.

---

## Notas relacionadas

- [[STACK]] — tecnologias frontend escolhidas (Next.js, Tailwind, shadcn/ui, Motion, Phosphor).
- [[ARCHITECTURE]] — separação entre `apps/web/src/components/ui/` (shadcn gerado) e `packages/ui/` (futuros wrappers multi-frontend).
- [[MODULES]] — módulos frontend (`portal-aluno`, `painel-coordenador`, `admin`) aplicam este design system.
- [[superpowers/specs/2026-10-20-design-system-easycert]] — spec detalhada da qual esta nota é resumo vivo.
- [[dominio/fluxo-aprovacao]] — vocabulário de status mapeado em ícones e cores.
- [[dominio/pendencias]] — pendências abertas relacionadas a design system.
