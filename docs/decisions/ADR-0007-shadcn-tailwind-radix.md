---
tipo: decisao
status: aceito
data: 2026-10-19
data-retroativo: 2026-11-04
---

# ADR-0007 — Usar shadcn/ui + Tailwind CSS + Radix UI no frontend

## Contexto
O frontend precisa de uma base de componentes acessíveis (WCAG A/AA) sem comprar um sistema de design opinado que seja difícil de customizar. O design system do easycert (ver [[design/DESIGN]]) tem personalidade visual própria — precisa de componentes que sejam pontos de partida, não produtos acabados.

## Decisão
**shadcn/ui** como gerador de componentes (`npx shadcn add <componente>` injeta o código fonte em `apps/web/src/components/ui/`), apoiado em **Radix UI** (primitivos acessíveis — menus, dialogs, dropdowns, tooltips) e **Tailwind CSS** para estilização. `@easycert/ui` fica reservado para wrappers compartilhados entre múltiplos frontends futuros.

## Alternativas consideradas
- **MUI (Material-UI)** — rejeitada porque traz opinião forte de Material Design difícil de customizar fora dos temas padrão; runtime CSS-in-JS adiciona overhead.
- **Chakra UI** — rejeitada por overhead runtime (styled-system + emotion) e API menos alinhada ao estilo utility-first do time.
- **Mantine** — rejeitada por menor tração no ecossistema (comparada a Radix + shadcn) e por acoplar estilização ao próprio sistema.
- **CSS custom do zero** — rejeitada porque implementar acessibilidade (focus trap, aria-*, teclado) para menus/dialogs/dropdowns manualmente é lento e historicamente fonte de regressões WCAG.

## Consequências
- **Positivas:** componentes são código fonte owned em `apps/web/src/components/ui/` — editáveis sem fork; Radix cobre acessibilidade; Tailwind combina com utilitários do design system; zero runtime CSS-in-JS.
- **Negativas / trade-offs:** atualização de shadcn é manual (re-executar comando por componente); tailwind exige disciplina para não virar "classes aleatórias" (resolvido por tokens em [[design/DESIGN]]).
- **Invariantes criadas:**
  - Componentes base ficam em `apps/web/src/components/ui/`, gerados por `npx shadcn add`.
  - `@easycert/ui` **não** recebe componentes shadcn diretos; só wrappers compartilhados entre múltiplos frontends (hoje só existe `apps/web`).
  - Novo componente acessível prefere Radix como primitivo; CSS custom apenas para casos não cobertos por Radix.

## Notas relacionadas
- [[STACK#Frontend]]
- [[design/DESIGN]]
- [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
