import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * EventoService — CRUD de EventoInterno.
 * Implementação real em T6 Round 4.
 */
@Injectable()
export class EventoService {
  /**
   * Lista eventos internos.
   * STUB — T6 Round 4.
   */
  async findAll(): Promise<never> {
    throw new NotImplementedException(
      "EventoService.findAll: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Cria novo evento interno.
   * STUB — T6 Round 4.
   */
  async create(_organizadorId: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "EventoService.create: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Atualiza evento interno existente.
   * STUB — T6 Round 4.
   */
  async update(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "EventoService.update: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Remove evento interno (soft delete ou hard delete — a definir em T6).
   * STUB — T6 Round 4.
   */
  async remove(_id: string): Promise<never> {
    throw new NotImplementedException(
      "EventoService.remove: implementação pendente — T6 Round 4",
    );
  }
}
