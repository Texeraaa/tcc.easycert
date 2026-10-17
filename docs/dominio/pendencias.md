---
tipo: pendência
status: v1
---

# Pendências

Decisões ainda em aberto na v1. Cada item aponta a nota que originou a pendência. Resolver aqui deve implicar atualizar a nota de origem (removendo o callout `[!warning]` e registrando a decisão).

---

## Em aberto (bloqueiam implementação da respectiva área)

- Autenticação — login próprio (NestJS Passport local/JWT), SSO institucional ou provedor externo. Bloqueia modelagem de usuário e proteção de rotas. Origem: [[atores-e-papeis]].
- Storage dos PDFs de comprovante — filesystem local, S3, MinIO ou Supabase Storage. Bloqueia implementação de upload e exibição. Origem: [[horas-complementares]].
- Matriz curricular concreta — categorias, limites e formato da regra (JSON embarcado em RegraMatriz vs. tabela totalmente normalizada). Bloqueia validação automatizada e seeds. Origem: [[horas-complementares]].
- Biblioteca de validação de DTO no NestJS — `class-validator`+`class-transformer` vs. `zod`. Bloqueia contrato de API. Origem: [[STACK]].
- Regulamento oficial de horas complementares da IES-alvo — necessário para preencher categorias, limites e janela de validade temporal. Origem: [[horas-complementares]].

## A confirmar (não bloqueiam, mas precisam ratificação antes de virarem dependência)

- Biblioteca de UI no frontend — shadcn/ui, Mantine, Chakra, ou componentes próprios em `@easycert/ui`. Origem: [[STACK]], [[MODULES]].
- Escopo de emissão de QRCode — só eventos internos emitidos pela plataforma, ou também declarações para comprovantes externos aprovados? Origem: [[fluxo-aprovacao]].
- Canal de notificação (email, in-app, push). Origem: [[fluxo-aprovacao]].
- Prazo de retenção do histórico de auditoria. Origem: [[fluxo-aprovacao]].
- Tamanho máximo do PDF aceito no upload. Origem: [[horas-complementares]].

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[STACK]] — decisões técnicas.
