-- Migration inicial — schema completo do easycert (Mês 2, T4)
-- Gerado manualmente pois o banco ainda não existe com os dois roles.
-- Aplicado pelo próximo `prisma migrate dev` (Round 2, quando containers estiverem prontos).

-- Enums

CREATE TYPE "Role" AS ENUM ('ALUNO', 'COORDENADOR', 'ADMIN');
CREATE TYPE "SubmissionState" AS ENUM ('AWAITING_UPLOAD', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CORRECTION_REQUESTED', 'UPLOAD_INVALID');
CREATE TYPE "DocumentoTipo" AS ENUM ('COMPROVANTE', 'RELATORIO', 'CERTIFICADO_INTERNO');
CREATE TYPE "AvaliacaoDecisao" AS ENUM ('APROVADO', 'REJEITADO', 'CORRECAO_SOLICITADA');

-- Tabela User

CREATE TABLE "User" (
    "id"           TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "dataIngresso" DATE NOT NULL,
    "matricula"    TEXT,
    "curso"        TEXT,
    "ativo"        BOOLEAN NOT NULL DEFAULT true,
    "role"         "Role" NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_ativo_idx" ON "User"("role", "ativo");

-- Tabela Categoria

CREATE TABLE "Categoria" (
    "id"        TEXT NOT NULL,
    "nome"      TEXT NOT NULL,
    "descricao" TEXT,
    "ativo"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- Tabela RegraMatriz

CREATE TABLE "RegraMatriz" (
    "id"                 TEXT NOT NULL,
    "categoriaId"        TEXT NOT NULL,
    "tetoTotalHoras"     INTEGER NOT NULL,
    "tetoAtividadeHoras" INTEGER NOT NULL,
    "cursoId"            TEXT,
    "dataIngressoDesde"  DATE NOT NULL,
    "dataIngressoAte"    DATE,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegraMatriz_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "RegraMatriz" ADD CONSTRAINT "RegraMatriz_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Tabela Submission

CREATE TABLE "Submission" (
    "id"                  TEXT NOT NULL,
    "alunoId"             TEXT NOT NULL,
    "categoriaId"         TEXT NOT NULL,
    "cargaInformadaHoras" INTEGER NOT NULL,
    "instituicao"         TEXT,
    "estado"              "SubmissionState" NOT NULL DEFAULT 'AWAITING_UPLOAD',
    "motivoIndeferimento" TEXT,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Submission" ADD CONSTRAINT "Submission_alunoId_fkey"
    FOREIGN KEY ("alunoId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "Submission" ADD CONSTRAINT "Submission_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Tabela Documento

CREATE TABLE "Documento" (
    "id"              TEXT NOT NULL,
    "submissionId"    TEXT,
    "eventoInternoId" TEXT,
    "tipo"            "DocumentoTipo" NOT NULL,
    "codigo"          VARCHAR(36) NOT NULL,
    "version"         INTEGER NOT NULL DEFAULT 1,
    "storageKey"      TEXT NOT NULL,
    "confirmedAt"     TIMESTAMP(3),
    "revogadoEm"      TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Documento_codigo_key" ON "Documento"("codigo");

-- Tabela Avaliacao

CREATE TABLE "Avaliacao" (
    "id"            TEXT NOT NULL,
    "submissionId"  TEXT NOT NULL,
    "coordenadorId" TEXT NOT NULL,
    "decisao"       "AvaliacaoDecisao" NOT NULL,
    "comentario"    TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "Submission"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_coordenadorId_fkey"
    FOREIGN KEY ("coordenadorId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Tabela audit_log (imutável via REVOKE em migration seguinte)

CREATE TABLE "audit_log" (
    "id"         TEXT NOT NULL,
    "actor"      TEXT,
    "action"     TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId"   TEXT,
    "before"     JSONB,
    "after"      JSONB,
    "reason"     TEXT,
    "createdAt"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- Tabela EventoInterno

CREATE TABLE "EventoInterno" (
    "id"           TEXT NOT NULL,
    "titulo"       TEXT NOT NULL,
    "descricao"    TEXT,
    "data"         DATE NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "categoriaId"  TEXT NOT NULL,
    "organizadorId" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoInterno_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EventoInterno" ADD CONSTRAINT "EventoInterno_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "EventoInterno" ADD CONSTRAINT "EventoInterno_organizadorId_fkey"
    FOREIGN KEY ("organizadorId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE NO ACTION;

-- FKs de Documento (após criar EventoInterno)

ALTER TABLE "Documento" ADD CONSTRAINT "Documento_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "Submission"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "Documento" ADD CONSTRAINT "Documento_eventoInternoId_fkey"
    FOREIGN KEY ("eventoInternoId") REFERENCES "EventoInterno"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;

-- Tabela Notification

CREATE TABLE "Notification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "metadata"  JSONB,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
