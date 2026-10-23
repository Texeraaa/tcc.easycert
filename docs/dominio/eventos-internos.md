---
tipo: regra-de-negócio
status: v1
---

# Eventos Internos e Certificados

Eventos internos são atividades organizadas **pela própria instituição** (ex: Semana de Computação FMPFM, colóquios, seminários) para as quais a plataforma emite certificados com código de verificação e QRCode públicos.

## Escopo

- **Apenas eventos internos** — atividades com data, título, descrição, organizador e quantidade de horas cadastrados pela instituição (admin).
- **Certificados com QRCode** — ao aluno ser certificado em um evento, a plataforma emite documento PDF com código único (`codigo`) e QRCode que aponta para rota pública de verificação.
- **Comprovantes externos** — eventos externos (cursos, congressos, treinamentos de terceiros) **não** geram certificado da plataforma; apenas são registrados como submissões/comprovantes normais. Nenhum QRCode.

---

## Requisitos

| ID | Descrição | Ator | Prioridade | Notas |
|----|-----------|----|------------|-------|
| RF-22 | Admin cadastra evento interno com data, título, horas, descrição. Sistema permite emissão de certificado para aluno com dados do evento. | Admin | SHOULD | [[MODULES#modulo-eventos]] |
| RF-23 | Rota pública `/v/[codigo]` verifica certificado: exibe nome do aluno, evento, data, horas e QRCode (sem expor RGA ou dados pessoais além do necessário). | Público | SHOULD | Rate-limit: 30 req/min por IP. |
| RF-27 | Admin pode revogar certificado emitido indevidamente; transição é auditada em `AuditLog`. Campo `revogadoEm` em `Documento`. | Admin | MUST | [[DATABASE#Revogação de certificados (RF-27)]] |

---

## Geração de código de verificação

**Opção A (aprovada):** código opaco com **id longo** (UUIDv4, 36 chars), armazenado em `Documento.codigo`, rate-limitado em `/v/[codigo]` para 30 req/min por IP.

- **Vantagem:** simples, sem criptografia assimétrica ou JWS.
- **Desvantagem:** requer acesso a DB para validar (Online-only).
- **Suficiente para TCC** com rate-limit robusto e ID longo contra enumeração bruta.

Alternativas descartadas para v1:
- (b) Código + HMAC: over-engineered para v1.
- (c) JWS embutido: QRCode muito grande, complexidade.

---

## Rate-limit da rota pública

Rota `/v/[codigo]` impõe **30 requisições por minuto** por IP de origem:

```
GET /v/:codigo HTTP/1.1
X-Forwarded-For: 192.0.2.1
→ Response 200 (válido) ou 404 (não encontrado) ou 410 (revogado)
→ Header: X-RateLimit-Remaining: 29, X-RateLimit-Reset: <timestamp>
→ After 30: Response 429 Too Many Requests
```

**Implementação:** `@nestjs/throttler` com decorator `@Throttle({default: {limit: 30, ttl: 60_000}})` na rota. Memory store em dev; Redis store em deploy multi-instância. **Escopo:** apenas esta rota; demais endpoints da API usam o default global do throttler (60 req/min). Lib única — não convive com `express-rate-limit`. Decisão B1 em [[superpowers/specs/2026-10-22-plano-mes-2#2.2 Bloqueadores técnicos (B1–B3, decididos em 2026-10-22)]], registro em [[STACK#Observabilidade]].

---

## Auditoria

Cada emissão, validação (sucesso/falha) e revogação de certificado deve ser registrada em `AuditLog` com tipo de evento `EVENTO_CERTIFICADO_EMITIDO`, `EVENTO_CERTIFICADO_VALIDADO`, `EVENTO_CERTIFICADO_REVOGADO`.

---

## Notas relacionadas

- [[fluxo-aprovacao]] — contexto de emissão de documentos.
- [[MODULES#modulo-eventos]] — arquitetura do módulo backend.
- [[DATABASE#Revogação de certificados (RF-27)]] — schema de Documento com `revogadoEm`.
- [[dominio/pendencias#Esquema de verificação do QRCode (RF-22, RF-23)]] — decisão resolvida.
