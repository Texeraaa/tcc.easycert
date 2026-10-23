// Seed de desenvolvimento — easycert
// Popula: 3 usuários (admin, coordenador, aluno) + 5 categorias CNE/MEC + 1 RegraMatriz por categoria.
//
// Senha dev para todos os usuários: easycert123
// Hash via @node-rs/argon2 (argon2id, parâmetros default: m=19456, t=2, p=1).
//
// Execute:
//   pnpm --filter @easycert/db db:seed
// ou, via Prisma:
//   pnpm --filter @easycert/db migrate -- --name <nome>
//   (Prisma chama seed automaticamente após migrate em dev)

import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const SENHA_DEV = "easycert123";

// Categorias CNE/MEC típicas com teto de horas.
// Valores substituíveis quando o regulamento oficial da FMPFM chegar (antes do Mês 4).
const CATEGORIAS = [
  {
    nome: "Ensino",
    descricao: "Atividades de ensino, monitoria, tutoria e similares.",
    tetoTotalHoras: 60,
    tetoAtividadeHoras: 30,
  },
  {
    nome: "Pesquisa",
    descricao: "Iniciação científica, publicações, participação em projetos de pesquisa.",
    tetoTotalHoras: 80,
    tetoAtividadeHoras: 40,
  },
  {
    nome: "Extensão",
    descricao: "Projetos de extensão, estágios não-obrigatórios, voluntariado.",
    tetoTotalHoras: 60,
    tetoAtividadeHoras: 30,
  },
  {
    nome: "Cultural e Artístico",
    descricao: "Participação em eventos culturais, visitas técnicas, exposições.",
    tetoTotalHoras: 40,
    tetoAtividadeHoras: 20,
  },
  {
    nome: "Representação Estudantil",
    descricao: "Atuação em órgãos colegiados, centros acadêmicos, representação discente.",
    tetoTotalHoras: 20,
    tetoAtividadeHoras: 20,
  },
] as const;

// dataIngressoDesde genérico — cobre ingressantes a partir de 2020.
// Quando o regulamento oficial chegar, substitua via painel admin ou atualize este seed.
const DATA_INGRESSO_DESDE = new Date("2020-01-01");

async function main() {
  console.log("------------------------------------------------------");
  console.log("Iniciando seed de desenvolvimento — easycert");
  console.log("------------------------------------------------------");

  // Gera hash da senha dev para todos os usuários.
  console.log(`\nHasheando senha dev "${SENHA_DEV}" com argon2id...`);
  const passwordHash = await hash(SENHA_DEV);

  // Upsert dos usuários (idempotente — re-seed não duplica).
  const admin = await prisma.user.upsert({
    where: { email: "admin@easycert.local" },
    update: { passwordHash },
    create: {
      email: "admin@easycert.local",
      passwordHash,
      nome: "Administrador",
      dataIngresso: new Date("2020-02-01"),
      ativo: true,
      role: "ADMIN",
    },
  });

  const coord = await prisma.user.upsert({
    where: { email: "coord@easycert.local" },
    update: { passwordHash },
    create: {
      email: "coord@easycert.local",
      passwordHash,
      nome: "Coordenador Teste",
      dataIngresso: new Date("2020-02-01"),
      ativo: true,
      role: "COORDENADOR",
    },
  });

  const aluno = await prisma.user.upsert({
    where: { email: "aluno@easycert.local" },
    update: { passwordHash },
    create: {
      email: "aluno@easycert.local",
      passwordHash,
      nome: "Aluno Teste",
      dataIngresso: new Date("2022-02-01"),
      matricula: "2022001",
      curso: "Ciência da Computação",
      ativo: true,
      role: "ALUNO",
    },
  });

  console.log("\nUsuários criados/atualizados:");
  console.log(`  admin@easycert.local     | role: ADMIN       | id: ${admin.id}`);
  console.log(`  coord@easycert.local     | role: COORDENADOR | id: ${coord.id}`);
  console.log(`  aluno@easycert.local     | role: ALUNO       | id: ${aluno.id}`);
  console.log(`  Senha dev (todos): ${SENHA_DEV}`);

  // Upsert de categorias e suas regras de matriz.
  console.log("\nCriando categorias CNE/MEC e regras de matriz...");

  for (const cat of CATEGORIAS) {
    const categoria = await prisma.categoria.upsert({
      where: { nome: cat.nome },
      update: {
        descricao: cat.descricao,
        ativo: true,
      },
      create: {
        nome: cat.nome,
        descricao: cat.descricao,
        ativo: true,
      },
    });

    // Cria a RegraMatriz apenas se não existir nenhuma para esta categoria
    // com o mesmo dataIngressoDesde (evita duplicação em re-seed).
    const regraExistente = await prisma.regraMatriz.findFirst({
      where: {
        categoriaId: categoria.id,
        dataIngressoDesde: DATA_INGRESSO_DESDE,
        cursoId: null,
      },
    });

    if (!regraExistente) {
      await prisma.regraMatriz.create({
        data: {
          categoriaId: categoria.id,
          tetoTotalHoras: cat.tetoTotalHoras,
          tetoAtividadeHoras: cat.tetoAtividadeHoras,
          cursoId: null, // regra global — aplica a qualquer curso
          dataIngressoDesde: DATA_INGRESSO_DESDE,
          dataIngressoAte: null, // aberta — sem data de término
        },
      });
      console.log(
        `  [criada] ${categoria.nome} — teto: ${cat.tetoTotalHoras}h total / ${cat.tetoAtividadeHoras}h por atividade`,
      );
    } else {
      console.log(`  [existente] ${categoria.nome} — regra já presente, ignorando`);
    }
  }

  console.log("\n------------------------------------------------------");
  console.log("Seed concluído com sucesso.");
  console.log("------------------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
