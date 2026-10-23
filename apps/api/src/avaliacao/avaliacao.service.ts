import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * AvaliacaoService — decisão do coordenador sobre submissões.
 * Implementação real em T6 Round 4.
 */
@Injectable()
export class AvaliacaoService {
  /**
   * Cria avaliação de uma submissão.
   * STUB — T6 Round 4.
   */
  async create(_coordenadorId: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "AvaliacaoService.create: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Atualiza comentário de uma avaliação.
   * STUB — T6 Round 4.
   */
  async update(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "AvaliacaoService.update: implementação pendente — T6 Round 4",
    );
  }
}
