import { Injectable, NotImplementedException } from "@nestjs/common";
import type { Categoria } from "@easycert/db";
import { PrismaService } from "../prisma/prisma.service";

/**
 * MatrizService — CRUD de Categoria + RegraMatriz.
 *
 * findAllCategorias é real (consumido pelo frontend em /aluno/submissoes/nova
 * para popular o select). CRUD de criação/edição ainda stub — Mês 3 painel admin.
 */
@Injectable()
export class MatrizService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------

  /**
   * Lista todas as categorias ativas (ordenadas por nome).
   * Pública a qualquer usuário autenticado — aluno precisa ver para submeter.
   */
  async findAllCategorias(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }

  /**
   * Cria nova categoria.
   * STUB — T6 Round 4.
   */
  async createCategoria(_data: unknown): Promise<never> {
    throw new NotImplementedException(
      "MatrizService.createCategoria: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Atualiza categoria existente.
   * STUB — T6 Round 4.
   */
  async updateCategoria(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "MatrizService.updateCategoria: implementação pendente — T6 Round 4",
    );
  }

  // ---------------------------------------------------------------------------
  // Regras de matriz
  // ---------------------------------------------------------------------------

  /**
   * Cria nova regra de teto de horas.
   * STUB — T6 Round 4.
   */
  async createRegra(_data: unknown): Promise<never> {
    throw new NotImplementedException(
      "MatrizService.createRegra: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Atualiza regra existente.
   * STUB — T6 Round 4.
   */
  async updateRegra(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "MatrizService.updateRegra: implementação pendente — T6 Round 4",
    );
  }
}
