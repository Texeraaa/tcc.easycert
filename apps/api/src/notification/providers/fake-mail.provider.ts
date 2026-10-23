import { Injectable } from "@nestjs/common";
import { MailProvider } from "./mail-provider.interface";

/**
 * Representação de um e-mail coletado em memória pelo FakeMailProvider.
 */
export interface FakeEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}

/**
 * FakeMailProvider — coleta e-mails em memória para testes.
 * Não faz nenhuma chamada de rede.
 *
 * Uso em testes:
 *   const mail = moduleRef.get<FakeMailProvider>(MAIL_PROVIDER);
 *   expect(mail.sent).toHaveLength(1);
 *   expect(mail.sent[0].to).toBe('aluno@test.com');
 */
@Injectable()
export class FakeMailProvider implements MailProvider {
  readonly sent: FakeEmail[] = [];

  async send(to: string, subject: string, body: string): Promise<void> {
    this.sent.push({ to, subject, body, sentAt: new Date() });
  }

  /** Limpa os e-mails coletados (útil em beforeEach dos testes). */
  clear(): void {
    this.sent.length = 0;
  }
}
