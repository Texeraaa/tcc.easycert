import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * MatrizService — CRUD de Categoria + RegraMatriz.
 * Implementação real em T6 Round 4.
 */
@Injectable()
export class MatrizService {
  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------

  /**
   * Lista todas as categorias ativas.
   * STUB — T6 Round 4.
   */
  async findAllCategorias(): Promise<never> {
    throw new NotImplementedException(
      "MatrizService.findAllCategorias: implementação pendente — T6 Round 4",
    );
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
