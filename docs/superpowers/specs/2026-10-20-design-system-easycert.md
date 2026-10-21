# Spec — Design System easycert

- **Data:** 2026-10-20
- **Autor:** Pedro Henrique (brainstorming conduzido via Claude Code, modelo Opus 4.7)
- **Escopo:** sistema de design (tokens + componentes + motion + guardrails) para a aplicação autenticada do easycert
- **Fora de escopo:** landing page pública, site institucional da FMPFM, materiais impressos de certificado
- **Pipeline aprovado:** Variante A (spec → `docs-curator` propõe nota viva em `docs/design/DESIGN.md` com cross-links → revisão humana → commit). Sem passagem pelo `tech-architect` por padrão; esta spec foi submetida a ele uma vez para ratificação inicial.
- **Skills aplicadas:** `emil-design-eng`, `design-taste-frontend`, `superpowers:brainstorming`.

---

## 1. Design read

Aplicação interna autenticada da FMPFM para emissão de declarações e certificados. Dois perfis convivem no mesmo sistema:

- **Aluno** — usuário esporádico (1-3 pedidos por curso). É a *north star*: a dor do As-Is é "aluno perde hora e tem que se virar". Fluxo precisa ser confiável, guiado e previsível.
- **Coordenação** — usuário diário/semanal. Processa fila, aprova em lote, emite documento final. Precisa cockpit eficiente, teclado-friendly.

Linguagem visual: **Linear/Notion-ish moderno**, com polish do Emil Kowalski. Sério sem ser burocrático. Verde `#27592e` como accent único, nunca background. As referências visuais (universidades Antixor e Southfield) informam **tom** (seriedade institucional), não **layout** (dashboards ≠ landing pages).

## 2. Dials

| Dial | Valor | Justificativa |
|---|---|---|
| `DESIGN_VARIANCE` | 3 | Sistema interno de ferramenta, consistência > surpresa. Grid previsível reduz carga cognitiva do coord em uso diário. |
| `MOTION_INTENSITY` | 4 | Polish do Emil (`scale(0.97)` em press, popover origin-aware, transições interrompíveis), nunca showcase. |
| `VISUAL_DENSITY` | 5-7 | Modo aluno = 5 (respiração, affordances explícitas). Modo coord = 7 (tabelas densas, atalhos de teclado). |

## 3. Stack travada

| Camada | Decisão |
|---|---|
| Framework | Next.js 15 App Router + React 19 (já no repo em `apps/web/`) |
| Styling | Tailwind v4 via `@tailwindcss/postcss` |
| Componentes | shadcn/ui com código owned em `apps/web/src/components/ui/` (alinhado a `STACK.md`), tokens customizados — **nunca estado default**. `packages/ui` fica reservado para wrappers compartilhados multi-frontend futuros. |
| Utilitários de classe | `clsx` + `tailwind-merge` compostos em util `cn()`, `class-variance-authority` (`cva`) para variantes de componente — pilares obrigatórios do padrão shadcn/ui |
| Motion | Motion (`import { motion } from "motion/react"`); legacy `framer-motion` proibido em código novo |
| Ícones | `@phosphor-icons/react`, peso `regular` default + `fill` para estados ativos. Consumido direto em `apps/web`. |
| Tipografia | Satoshi (display + body) + JetBrains Mono (números/códigos), self-hosted via `next/font/local` + `@font-face` |
| Theming | CSS variables no padrão shadcn/ui (`--background`, `--foreground`, `--accent`, etc.), estratégia de persistência via **cookie HTTP** (não localStorage) — ver seção 9.4 |

Estado do repo em 2026-10-20 (confirmado pelo `tech-architect`): `apps/web` é **greenfield absoluto** — zero Tailwind, zero PostCSS, zero `globals.css`, zero font loading, `page.tsx` com `fontFamily` inline. O setup completo (Tailwind v4 + PostCSS + shadcn/ui init + `next/font/local` + theme provider + token file CSS vars + cookie de theme/density) é escopo do primeiro PR frontend que materialize este design system.

## 4. Tokens de cor

### 4.1 Light

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#fafafa` (zinc-50) | Base da página |
| `--foreground` | `#09090b` (zinc-950) | Texto primário |
| `--muted` | `#f4f4f5` (zinc-100) | Fundo de seção secundária, hover sutil |
| `--muted-foreground` | `#71717a` (zinc-500) | Texto auxiliar, placeholders de contexto |
| `--border` / `--input` | `#e4e4e7` (zinc-200) | Linhas, divisores, borda de input |
| `--accent` | `#27592e` | CTA primário, link, badge "aprovado"/"verificado", focus ring |
| `--accent-foreground` | `#fafafa` | Texto sobre accent (contraste 7.7:1, AAA) |
| `--accent-muted` | `rgba(39,89,46,0.10)` | Fundo de badge verde discreto, hover de CTA |
| `--destructive` | `#dc2626` (red-600) | Rejeição, destrutivo |
| `--destructive-foreground` | `#fafafa` | Texto sobre destructive |
| `--warning` | `#d97706` (amber-600) | Pendência, atenção |
| `--ring` | `#27592e` | Focus visible |

### 4.2 Dark

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#09090b` (zinc-950) | Base |
| `--foreground` | `#fafafa` (zinc-50) | Texto primário |
| `--muted` | `#18181b` (zinc-900) | Fundo secundário |
| `--muted-foreground` | `#a1a1aa` (zinc-400) | Texto auxiliar |
| `--border` / `--input` | `#27272a` (zinc-800) | Linhas |
| `--accent` | `#4a9b58` | Verde clareado p/ WCAG AA em fundo escuro (5.75:1 ✓) |
| `--accent-foreground` | `#09090b` | Texto sobre accent clareado |
| `--accent-muted` | `rgba(74,155,88,0.15)` | Badge verde discreto |
| `--destructive` | `#ef4444` (red-500) | Clareado p/ dark |
| `--warning` | `#f59e0b` (amber-500) | Clareado p/ dark |
| `--ring` | `#4a9b58` | Focus visible |

### 4.3 Regras duras

1. **Verde é accent único.** Nunca background de página, nunca gradient, nunca mesh.
2. **Máximo 1 CTA primary verde por viewport visível.** Secundários são `variant="outline"` ou `variant="ghost"` do shadcn/ui.
3. **Semantic dots são permitidos** (status badges: `●` verde = aprovado, `●` âmbar = pendente, `●` vermelho = rejeitado). **Decorative dots são proibidos** (não existe `●` antes de item de nav, antes de label, antes de header de seção).
4. **Qualquer componente novo é testado nos dois modos antes de merge.** PR com screenshot de light-only ou dark-only não entra.

## 5. Tipografia

### 5.1 Famílias

- **Satoshi** (via Fontshare, self-hosted, licença free) — pesos 400 / 500 / 700 / 900. Carregar `font-display: swap`.
- **JetBrains Mono** (OFL, open-source) — pesos 400 / 500. Para IDs de pedido, matrícula do aluno, códigos de verificação de documento, timestamps, hashes, URLs encurtadas.

> [!info] A confirmar
> Fontshare serve Satoshi 900 (black)? Se não, substituir por 700 bold em todos os usos. Validar no setup de font loading.

### 5.2 Escala

Sem `text-7xl`/`text-8xl` — não é landing. Mantida compacta para sistema de trabalho:

| Token | px | Uso |
|---|---|---|
| `text-xs` | 12 | Eyebrows raros, metadados em tabela |
| `text-sm` | 14 | Body default em dashboards densos |
| `text-base` | 16 | Body em contexto de leitura (descrição de curso, instruções) |
| `text-lg` | 18 | Títulos de seção |
| `text-xl` | 20 | Títulos de card |
| `text-2xl` | 24 | Títulos de página |
| `text-3xl` | 30 | Hero de modo aluno ("Minha declaração") |
| `text-4xl` | 36 | Raro — telas de sucesso ("Pedido aprovado") |

### 5.3 Regras de uso

- **Ênfase sempre via peso** (500 → 700). Nunca injetar serif numa headline sans. Nunca mixar duas famílias display.
- **Zero serif no sistema.** Se um dia uma declaração oficial renderizada precisar serif, essa é decisão separada por documento, fora do sistema de UI.
- **JetBrains Mono é obrigatório** para: ID de pedido, matrícula, código de verificação, data em formato `YYYY-MM-DD HH:mm`, hash de documento.
- **Prose cap:** `max-w-[65ch]` em qualquer bloco de texto corrido.

## 6. Spacing, grid, radius, shadows

### 6.1 Spacing

Escala Tailwind default (4px step). Densidades:

- **Modo aluno:** `gap-6` (24px) entre blocos, `py-8` (32px) em seções.
- **Modo coord:** `gap-4` (16px) entre blocos, `py-6` (24px) em seções, `py-2` em rows de tabela.

### 6.2 Grid & container

- Container de página **default**: `max-w-7xl mx-auto px-4` (ou `px-6` em breakpoints `md+`).
- **Override para modo coord:** telas de fila/tabela densa sobrescrevem para `max-w-full px-6` para aproveitar viewport inteira (ver seção 9.2).
- Full-height section: `min-h-[100dvh]`. **Nunca `h-screen`** (iOS Safari address bar quebra).
- Layouts complexos: **CSS Grid > flex-math**. Nada de `w-[calc(33%-1rem)]`.

### 6.3 Border radius — Shape Consistency Lock

| Elemento | Radius |
|---|---|
| Botões, inputs, cards, selects | `rounded-md` (6px) |
| Modais, popovers, dropdowns | `rounded-lg` (8px) |
| Badges, pills, status chips | `rounded-full` |
| Avatars | `rounded-full` |

**Regra:** sem mistura. Se um card é `rounded-md`, seus componentes internos ficam `rounded-md` ou `rounded-sm`. Botão `rounded-full` dentro de card `rounded-md` só com justificativa (ex: botão de ação circular com ícone).

### 6.4 Shadows tintadas em zinc

Nunca `rgb(0, 0, 0)`. Sempre tintado:

```css
--shadow-sm: 0 1px 2px rgba(24, 24, 27, 0.05);   /* zinc-900 @ 5% */
--shadow-md: 0 4px 12px rgba(24, 24, 27, 0.08);  /* elevação de card */
--shadow-lg: 0 12px 32px rgba(24, 24, 27, 0.12); /* modal, popover */
```

Em dark mode, shadows ficam quase invisíveis — depth vem de `border` com contraste suficiente. Mantém a mesma declaração; não vale a pena variar.

## 7. Motion (Emil Kowalski)

### 7.1 Easings

```css
--ease-out:     cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);
```

### 7.2 Durações

| Elemento | Enter | Exit | Easing |
|---|---|---|---|
| Button press feedback | 160ms | — | `--ease-out` |
| Hover color transitions | 150ms | 150ms | `ease` |
| Tooltip / popover | 180ms | 120ms | `--ease-out` |
| Dropdown / select | 200ms | 150ms | `--ease-out` |
| Modal / drawer | 240ms | 180ms | `--ease-drawer` |
| Toast | 300ms | 200ms | `--ease-out` |

**Regra de asimetria:** exit é ~25% mais rápido que enter. Entrada precisa ser percebida, saída precisa sair do caminho.

### 7.3 Hard rules

1. Nunca animar `scale(0) → scale(1)`. Mínimo: `scale(0.95) + opacity(0) → scale(1) + opacity(1)`.
2. Todo botão: `transform: scale(0.97)` em `:active`, transição 160ms `--ease-out`.
3. Popover: `transform-origin: var(--transform-origin)` (Radix do shadcn/ui já entrega).
4. **Nunca** `ease-in` em UI (entrada lenta = sluggish). Modal centralizado é exceção documentada do emil-design-eng — mantém `transform-origin: center`.
5. Só `transform` e `opacity` animados. Nunca `width`, `height`, `top`, `left`, `padding`, `margin`.
6. Hover gated: `@media (hover: hover) and (pointer: fine)`.
7. `prefers-reduced-motion: reduce` → todo motion acima de intensidade 3 colapsa para `opacity` only ou instantâneo. Modal continua aparecendo (hierarquia), mas sem scale. Toast continua aparecendo (feedback), mas sem translate.

### 7.4 Keyboard-initiated actions

**Zero animação em ação disparada por tecla.** Coord usa `j`/`k`/`Enter`/`Esc`/`⌘K` o dia inteiro — animar isso vira sluggish em alta frequência. Especificamente:

- Navegar fila com `j`/`k`: seleção de row é instantânea (`transition: none`).
- Abrir pedido com `Enter`: side panel aparece **sem** scale/opacity (`transition-duration: 0`).
- Fechar com `Esc`: side panel desaparece instantâneo.
- `⌘K` command palette: abre instantâneo após o primeiro uso (Sonner principle: skip delay em uso subsequente).

Mesma ação via mouse mantém animação normal. A regra é só sobre teclado.

### 7.5 Stagger em listas

Lista de pedidos aparecendo em dashboard do aluno ou fila do coord:

- Delay entre items: **40ms** (dentro da janela 30-80ms do Emil).
- Max 10 items staggered. A partir do 11°, aparece junto (não bloquear usuário).
- Em `prefers-reduced-motion`: todos aparecem juntos (`stagger: 0`).

### 7.6 Proibições específicas

- `window.addEventListener("scroll", ...)` — banido. Usar `useScroll()` do Motion, IntersectionObserver, ou CSS scroll-driven animations.
- `requestAnimationFrame` tocando `useState` — banido. Usar `useMotionValue` / `useTransform`.
- GSAP, Three.js — não há caso de uso neste app. Se surgir (ex: tour onboarding), spec separada.
- Keyframes CSS para elementos re-dispáraveis (toast stack, lista com itens entrando/saindo) — usar `transition` interrompível.

## 8. Ícones (Phosphor)

### 8.1 Tamanhos e pesos

- Tamanhos padrão: 16px (dense table, inline), 20px (buttons, nav), 24px (headers, empty-state).
- Peso default: `regular` (stroke 1.5).
- Peso ativo/selecionado: `fill`.
- `strokeWidth` global padronizado via wrapper component (nunca per-component override).

### 8.2 Semântica de status

**Importante:** a lista de status é **owned pelo domínio/backend** (ver `docs/dominio/fluxo-aprovacao.md`). O design apenas mapeia cada estado existente para ícone + cor. Não inventar novos estados aqui; se precisar, abrir pendência em `dominio/pendencias.md` e discutir com o backend.

**Status de Submissão** (ciclo de vida do pedido do aluno):

| Status | Ícone | Peso | Cor |
|---|---|---|---|
| `Rascunho` | `PencilSimple` | regular | `--muted-foreground` |
| `Pendente` | `Clock` | regular | `--warning` |
| `Em análise` | `MagnifyingGlass` | regular | `--muted-foreground` |
| `Aprovada` | `CheckCircle` | fill | `--accent` |
| `Indeferida` | `XCircle` | fill | `--destructive` |

**Status de Documento** (ciclo de vida da declaração gerada após aprovação):

| Status | Ícone | Peso | Cor |
|---|---|---|---|
| `Emitido` | `Certificate` | fill | `--accent` |

> [!info] Reservado
> `Expirado` (como estado) não existe hoje no modelo de domínio. Se houver prazo de validade de documento no futuro, mapeia-se então para `Prohibit` em `--muted-foreground`. Não usar até existir backend-side.

### 8.3 Semântica de ação

| Ação | Ícone |
|---|---|
| Download de documento | `DownloadSimple` |
| Verificar QR / autenticidade | `QrCode` |
| Comentário / observação | `ChatCircle` |
| Deletar | `Trash` |
| Editar | `PencilSimple` |
| Aprovar | `Check` |
| Rejeitar | `X` |
| Filtrar | `Funnel` |
| Buscar | `MagnifyingGlass` |

### 8.4 Regras

- **Nunca** hand-roll SVG. Faltou glifo → acionar maintainer do design system, não desenhar inline.
- **Nunca** mixar bibliotecas. Phosphor é a única family consumida em `apps/web`.

## 9. Dois registros, mesmo sistema

### 9.1 Modo aluno

- Composição: `max-w-5xl mx-auto`, `gap-6` entre blocos, `py-8` em seções.
- Max 3 itens por row em grids (não 6, não bento).
- CTAs maiores (`size="lg"` do shadcn/ui).
- Texto explicativo sob títulos de seção (`text-sm text-muted-foreground`).
- Confirmação em ações destrutivas (cancelar pedido, excluir rascunho).
- Loading state visível desde 100ms de delay (não espera 1s para mostrar).

### 9.2 Modo coord

- Composição: `max-w-full px-6`, uso de viewport inteira.
- Tabela densa (shadcn/ui `Table` + TanStack Table), `py-2` por row.
- **Ações de linha visíveis no hover do row**, não sempre (reduz ruído).
- Multi-select com checkbox column à esquerda.
- Detalhe de pedido abre em **side panel direito** (`Sheet` do shadcn/ui, 480px wide), não modal. Permite scan de múltiplos pedidos sem perder contexto da fila.
- Atalhos de teclado **v1** (dentro do escopo do Mês 1):
  - `j` / `k` → navegar rows
  - `Enter` → abrir side panel
  - `Esc` → fechar side panel
  - `R` → rejeitar (abre dialog com campo de motivo)
- Atalhos **antecipados** (requerem requisitos funcionais futuros, não entregam no Mês 1):
  - `⌘K` → command palette — depende de spec de busca cross-entidade
  - `A` → aprovar em lote — depende de requisito de bulk approval em `fluxo-aprovacao.md`
- Densidade adicional via toggle `Compact / Comfortable` persistido em **cookie HTTP** (ver seção 9.4).

### 9.3 Mobile strategy

**Coord mode é desktop-first.** Limitação consciente e documentada:

- Em `< md` (< 768px), fila do coord renderiza em modo **read-only** (lista de pedidos com status, sem ações de aprovação/rejeição/emissão).
- Tela de "nova aprovação em lote", "emitir documento", "editar fluxo" exibe banner `"Esta tela requer desktop (≥ 1024px)"` com link para abrir no desktop.
- **Aluno mode é mobile-first.** Todas as telas de aluno funcionam em `< md` com layout de card empilhado.

Justificativa: coord opera do escritório da faculdade; aprovar em lote do celular não é o caso de uso real. Esforço de alternative-view para coord mobile seria substancial e sub-utilizado.

### 9.4 Persistência de preferências (cookie)

Decisão arquitetural: toggle de tema (light/dark) e toggle de densidade (compact/comfortable) persistem em **cookie HTTP**, não localStorage. Motivação:

- Server Component lê o cookie no primeiro render → zero FOUC (flash of unstyled content).
- localStorage só é lido no cliente → primeira pintura é sempre o default, flasha para o escolhido.
- Blocking inline script no `<head>` para ler localStorage antes da hidratação é hack conhecido mas aumenta TTFB percebido e polui o HTML.

Nomes de cookie (reserved):
- `easycert.theme` — valores `light` | `dark` | `system` (default `system`).
- `easycert.density` — valores `compact` | `comfortable` (default `comfortable`).

Atributos: `Path=/`, `Max-Age=31536000` (1 ano), `SameSite=Lax`. Não precisa `HttpOnly` (precisa ser legível no cliente para toggle instantâneo). Não precisa `Secure` em dev; em prod obrigatório.

**Fora de escopo desta spec:** sync cross-device via backend. Se virar requisito, modela `UserPreferences` na API e cookie vira cache do estado remoto. Pendência registrada.

## 10. Estados de UI (first-class)

Toda tela de dados tem **4 estados** especificados, não só o "happy path":

### 10.1 Empty state

- Ilustração ou ícone grande Phosphor (24-32px) centralizado.
- Headline curta: "Nenhum pedido ainda."
- Subtext explicativo: "Quando você solicitar uma declaração, ela aparece aqui."
- CTA primário se há ação natural: `[Solicitar declaração]`.
- Sem Jane-Doe placeholder data. Sem "lorem ipsum".

### 10.2 Loading state

- **Skeleton matching the final layout's shape.** Não circular spinner genérico.
- Row de tabela: skeleton de row com mesmas colunas.
- Card: skeleton de card com mesma altura.
- Shimmer sutil (`animate-pulse` do Tailwind é suficiente para v1).
- Visível desde 100ms de delay percebido. Antes disso, não mostrar nada (evita flash).

### 10.3 Error state

- Headline: contexto do erro ("Não foi possível carregar a fila.").
- Subtext: explicação em prose ("Verifique sua conexão e tente novamente.").
- Ação: `[Tentar novamente]` como botão secundário.
- Nunca mostrar stack trace ou código HTTP ao usuário. Logar no backend; mostrar linguagem humana.

### 10.4 Partial / stale state

Quando dados foram carregados mas estão desatualizados (ex: pedido mudou de status em outra sessão):

- Toast discreto (`Sonner`): "Status atualizado. [Recarregar]".
- Não força reload. Usuário decide.

### 10.5 Offline

Quando a conexão com a API cai (fetch falha com network error):

- Banner persistente no topo da página (`bg-warning/10`, ícone `WifiSlash` em `--warning`): "Sem conexão. Tentando reconectar..."
- Formulários ficam `disabled` para evitar perda de dados em submit que vai falhar.
- Toast de confirmação quando reconecta: "Conexão restaurada."
- Ações pendentes (ex: aprovar pedido) são enfileiradas em memória e re-tentadas automaticamente após reconexão.

### 10.6 Sem permissão (401 / 403)

Quando o backend retorna 401 (sessão expirada) ou 403 (sem permissão para o recurso):

- **401:** redirect imediato para `/login` com `?returnTo=` para preservar destino.
- **403:** tela dedicada full-page com ícone `Prohibit` (24px) em `--muted-foreground`, headline "Sem permissão para acessar esta página.", subtext explicativo ("Esta tela é restrita à coordenação. Se você acha que isso é um erro, contate..."), CTA secundário `[Voltar ao dashboard]`.
- Nunca mostrar stack trace. Nunca mostrar "403 Forbidden" como copy.

## 11. Table discipline

### 11.1 Border rule

Pick ONE:

- **Divisores entre rows** (`divide-y divide-border`) **OU**
- **Row-hover tint** (`hover:bg-muted/50`)

**Nunca ambos.** `border-t` + `border-b` em toda row é anti-pattern (vira ruído visual).

Decisão default do easycert: **row-hover tint**, sem divisores. Linhas horizontais só entre header e body, e entre body e footer da tabela.

### 11.2 Column alignment

- Texto: `text-left`.
- Números, datas, códigos (JetBrains Mono): `text-right` + `tabular-nums`.
- Status badges: `text-center` em coluna estreita.
- Ações (último column): `text-right`.

### 11.3 Density

- Default: `py-3 px-4` por célula (comfortable).
- Toggle compact: `py-2 px-3`.
- Nunca `py-1` ou abaixo (acessibilidade de clique).

## 12. CTA discipline

- **Label primário:** máximo 3 palavras, idealmente 1-2. ("Solicitar", "Enviar pedido", "Aprovar", "Baixar PDF").
- **1 linha no desktop**, sempre. Label que quebra em 2 linhas é bug.
- **Zero duplicate CTA intent por tela.** Se há `[Solicitar declaração]` no header, não há `[Nova solicitação]` no sidebar.
- Loading state de CTA: label vira "Enviando..." com spinner inline, `aria-busy="true"`, `disabled`.
- Success state: redireciona ou mostra toast, não troca label para "✓ Enviado" (feedback vem do contexto).

## 13. Acessibilidade

- **WCAG AA mínimo** (4.5:1 body, 3:1 large text ≥ 18px).
- **WCAG AAA alvo** para hero copy de modo aluno e para texto de documento emitido.
- **Focus ring:** `2px solid var(--ring)` com `2px` offset. Nunca `outline: none` sem substituir.
- **Label ACIMA do input**, nunca placeholder-as-label.
- **Erro ABAIXO do input**, cor `var(--destructive)`, ícone `WarningCircle` fill 16px, `role="alert"`.
- **`aria-describedby`** conectando input ao erro.
- **Keyboard nav** completa: tab order lógica, skip-to-content, atalhos documentados em dialog `?`.
- **`prefers-reduced-motion`** honrado em tudo acima de intensidade 3 (seção 7.3).
- **`prefers-reduced-transparency`** honrado se vier a usar `backdrop-filter` (nenhuma necessidade prevista).

## 14. Anti-slop guardrails específicos easycert

Lista negativa, derivada de design-taste-frontend Section 9 e aplicada ao contexto deste app:

| Anti-pattern | Por que importa aqui |
|---|---|
| Hero com stats grandes ("50+ cursos, 10.000 alunos") | Isso é landing. Este é app interno. |
| "Trusted by" strip | Mesmo motivo. |
| 3 cards de feature equal-width horizontais | Vira default de landing. Em app, cada card é uma ação, não um pitch. |
| Mesh gradient de fundo | Zero. Em qualquer lugar. |
| AI-purple ou neon glow em CTA | Nosso accent é `#27592e`. Não existe desvio. |
| Centered hero em dashboard | Dashboards são left-aligned com side panels. Centralização só em telas de sucesso de ação pontual. |
| Em-dash (`—`) em copy de UI | **Zero.** Usar hífen ou ponto. Rule hard. |
| Serif em headline ou copy | Zero. Satoshi only. |
| Inter como fallback silencioso | Satoshi primeiro, system sans como fallback (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`). Nunca Inter como fallback. |
| Mistura de families de ícone | Zero. Phosphor only. |
| `scale(0) → scale(1)` | Zero. |
| Scroll-hijack, pin-and-scrub, horizontal pan | Zero. Isso é landing. |
| Marquee de qualquer tipo | Zero. |
| Decorative dots antes de nav/label/header | Zero. Dots só em status badges. |
| Fake-precision numbers em mock ("Taxa de aprovação: 92.7%") | Zero. Ou número real do DB, ou label `[mock]` explícito. |
| Jane Doe / Acme / "Sarah Chan" em placeholder | Zero. Usar nomes brasileiros plausíveis (`Ana Oliveira`, `Carlos Mendes`) + matrículas no padrão da FMPFM. |
| Version footer em marketing-ish footer ("v1.4.2 · build 0048") | Zero. Isso é app, versão aparece só em tela de "sobre" ou settings. |
| Decoração text strip ("TRUST · SPEED · ACCURACY") | Zero. |
| Scroll cues ("↓ scroll para explorar") | Zero. |
| Section-numbering eyebrows ("01 / Pedidos", "02 / Fila") | Zero. Seção é identificada pela heading, não por número. |
| `border-t + border-b` em cada row de tabela | Zero. Ver seção 11.1. |

## 15. Copy self-audit protocol

Antes de cada PR que mexe em UI:

1. Re-ler toda string visível: headlines, botões, labels, placeholders, mensagens de erro, empty states, toasts.
2. Flagar strings que sejam:
   - Gramaticalmente quebradas
   - Com referentes ambíguos ("ele", "isso" sem contexto)
   - Soando como "AI tentando ser poético" (metáforas forçadas, humility passivo-agressiva)
   - Em inglês quando o resto é PT-BR (bug comum)
3. Reescrever flaggadas para prose funcional. Em caso de dúvida: frase direta e boring > frase cute e ambígua.
4. Zero em-dash no diff. Zero exceção.

## 16. Pipeline aprovado (Variante A)

```
┌─ 1. Spec gravada (este arquivo) ──────────────────┐
│                                                   │
├─ 2. tech-architect ratifica (ad-hoc)              │
│   (invocado uma vez para esta spec; não é padrão) │
│                                                   │
├─ 3. docs-curator propõe nota viva no vault:       │
│   `docs/design/DESIGN.md` + cross-links em       │
│   ARCHITECTURE.md, STACK.md, MODULES.md           │
│                                                   │
├─ 4. Humano revisa e aprova proposta do curator    │
│                                                   │
├─ 5. Humano commita                                │
│                                                   │
└─ 6. Implementação futura:                         │
    - frontend-builder executa setup (Tailwind v4,  │
      shadcn/ui init, next/font/local, theme        │
      provider, token file CSS vars, dark toggle)   │
    - code-reviewer (override Opus em componentes   │
      do design system) verifica aderência          │
```

## 17. Pendências abertas

> [!warning] Em aberto
> Itens a resolver antes de implementar; não bloqueiam a aprovação desta spec. Serão registrados em `docs/dominio/pendencias.md` pelo `docs-curator`.

- Confirmação de que Fontshare serve Satoshi 900 (black). Se não, degradar para 700 bold em todos os usos.
- Licença Fontshare validada para contexto educacional/institucional da FMPFM. Se restrição surgir, substituir por família open-source equivalente (ex: Söhne Breit via NaN, ou Switzer da Fontshare).
- Logo/wordmark do easycert. Opção 1: wordmark em Satoshi 700 com `tracking-tight`. Opção 2: criar mark gráfico (fora do escopo desta spec).
- Shortcut `R` (rejeitar) conflita com atalhos nativos do browser (`Ctrl+R` reload, mas `R` solo não)? Validar em Chrome/Safari/Firefox antes de implementar.
- Sync cross-device das preferências (`easycert.theme`, `easycert.density`) via backend. Hoje é cookie-local; se virar requisito, modela `UserPreferences` na API.

## 18. Referências

- `emil-design-eng` skill (Emil Kowalski philosophy on UI polish, motion, components).
- `design-taste-frontend` skill (anti-slop guardrails, dial system, pre-flight checklist).
- `superpowers:brainstorming` skill (flow deste documento).
- Imagens de referência enviadas pelo autor: landing de Antixor University e Southfield University — usadas como *vocabulário de tom*, não de layout.
- `docs/ARCHITECTURE.md`, `docs/STACK.md`, `docs/MODULES.md` (contexto do repo).
