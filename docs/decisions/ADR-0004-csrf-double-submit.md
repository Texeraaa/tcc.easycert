---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0004 — Mitigar CSRF com `csrf-csrf` em padrão double-submit cookie

## Contexto
Com JWT em cookie HttpOnly (ver [[decisions/ADR-0003-jwt-cookie-httponly]]), o browser anexa o cookie em qualquer request originada do domínio — inclusive requests forjadas por terceiros (CSRF). `SameSite=Lax` mitiga top-level navigation mas não mutações cross-site de AJAX; precisa de defesa em profundidade.

## Decisão
Usar **`csrf-csrf`** (fork mantido do `csurf` deprecado) com padrão **double-submit cookie**: middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations (POST, PATCH, DELETE). Rota `GET /auth/csrf-token` emite o cookie `csrf-token`. **Exempt:** `POST /auth/login` (primeiro turno, usuário sem cookie CSRF ainda), `POST /auth/logout` (cookie pode estar expirado), `GET /auth/csrf-token` (GET é isento por natureza; listado para clareza).

## Alternativas consideradas
- **`csurf`** — rejeitada porque o pacote original está **deprecated** desde 2022 e sem manutenção; `csrf-csrf` é fork ativo com a mesma API.
- **Synchronizer token** — rejeitada porque exige sessão server-side (store de tokens em memória/Redis); double-submit é stateless e combina melhor com JWT + cookies.
- **`SameSite=Strict` isoladamente** — rejeitada porque quebra fluxos cross-site legítimos (ex.: link externo para a app autenticada) e não cobre AJAX same-site. Serve como defesa complementar, não substituta.

## Consequências
- **Positivas:** stateless, compatível com múltiplas instâncias sem store compartilhado, lib mantida, defesa em profundidade sobre `SameSite=Lax`.
- **Negativas / trade-offs:** cliente precisa fazer `GET /auth/csrf-token` após o login antes da primeira mutation (fluxo de 2 passos explicitado); exempt list precisa ser auditada ao adicionar rotas de auth novas.
- **Invariantes criadas:**
  - Toda rota que muta estado (POST/PATCH/DELETE) valida `X-CSRF-Token`, exceto as 3 exempts.
  - Fluxo primeiro-login: `POST /auth/login` (sem CSRF) → `GET /auth/csrf-token` (seta cookie) → próximas mutations incluem header.
  - Adicionar rota de auth nova sem cookie CSRF ainda disponível **exige** revisitar este ADR.

## Notas relacionadas
- [[STACK#Autenticação]]
- [[STACK#CSRF & Segurança]]
- [[decisions/ADR-0003-jwt-cookie-httponly]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
