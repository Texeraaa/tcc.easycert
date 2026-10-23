import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * SubmissionService — ciclo de vida das submissões de atividades complementares.
 * Implementação real em T7 Round 4.
 */
@Injectable()
export class SubmissionService {
  /**
   * Cria nova submissão para o aluno autenticado.
   * STUB — T7 Round 4.
   */
  async create(_alunoId: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.create: implementação pendente — T7 Round 4",
    );
  }

  /**
   * Lista submissões do aluno autenticado.
   * STUB — T7 Round 4.
   */
  async findByAluno(_alunoId: string): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.findByAluno: implementação pendente — T7 Round 4",
    );
  }

  /**
   * Retorna detalhe de uma submissão pelo ID.
   * STUB — T7 Round 4.
   */
  async findById(_id: string): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.findById: implementação pendente — T7 Round 4",
    );
  }

  /**
   * Confirma upload realizado: transiciona AWAITING_UPLOAD → PENDING.
   * STUB — T7 Round 4.
   */
  async confirm(_id: string, _alunoId: string): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.confirm: implementação pendente — T7 Round 4",
    );
  }

  /**
   * Realiza transição de estado da submissão.
   * STUB — T7 Round 4.
   */
  async transitionState(_id: string, _newState: string): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.transitionState: implementação pendente — T7 Round 4",
    );
  }
}
