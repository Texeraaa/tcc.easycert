---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0003 — Transportar JWT via cookie HttpOnly SameSite=Lax (`easycert_session`)

## Contexto
O JWT emitido no login precisa trafegar em cada request autenticado. A escolha do transporte impacta diretamente superfície de XSS, complexidade do cliente e integração com o browser. O easycert tem frontend único (Next.js em `apps/web`) chamando a API no mesmo site/host — não há necessidade de autenticação cross-origin.

## Decisão
JWT em cookie `easycert_session`, **HttpOnly**, **SameSite=Lax**, `Secure` em produção e `Secure=false` em dev. O browser anexa o cookie automaticamente; JavaScript cliente **não** acessa o token. Login seta o cookie via response header; logout o limpa.

## Alternativas consideradas
- **`localStorage`** — rejeitada porque é acessível por qualquer script na página: uma única falha de XSS exfiltra o token. `HttpOnly` elimina essa classe inteira de ataque.
- **Header `Authorization: Bearer <token>` manual** — rejeitada porque exige o cliente anexar o header em toda request (código extra no fetch wrapper), não funciona com navegação de página (SSR do Next.js) e não traz nenhum ganho de segurança sobre cookie HttpOnly no mesmo contexto same-site.

## Consequências
- **Positivas:** resistência a XSS (token inacessível a scripts), anexo automático pelo browser, funciona com SSR do Next.js sem código de autenticação no cliente.
- **Negativas / trade-offs:** requer mitigação de CSRF explícita (ver [[decisions/ADR-0004-csrf-double-submit]]); logout verdadeiro depende de clear-cookie server-side.
- **Invariantes criadas:**
  - Cliente JS **nunca** lê nem seta o cookie `easycert_session`.
  - Em produção, cookie com `Secure=true` + `SameSite=Lax` + `HttpOnly=true` — não relaxar nenhuma dessas flags.
  - Toda rota autenticada do backend consome `req.cookies['easycert_session']`, não header `Authorization`.

## Notas relacionadas
- [[STACK#Autenticação]]
- [[decisions/ADR-0004-csrf-double-submit]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
