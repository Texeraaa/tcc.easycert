import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailProvider } from "./mail-provider.interface";

/**
 * MailtrapProvider — provedor de e-mail via SMTP (Mailtrap em dev).
 *
 * STUB: usa console.log por ora.
 * Implementação real (SMTP via nodemailer) será feita em T6 Round 4
 * quando as credenciais Mailtrap estiverem configuradas.
 *
 * nodemailer está instalado e tipado; o import abaixo será ativado em T6.
 */
@Injectable()
export class MailtrapProvider implements MailProvider {
  private readonly logger = new Logger(MailtrapProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async send(to: string, subject: string, body: string): Promise<void> {
    // TODO: T6 Round 4 — implementar via nodemailer com MAILTRAP_HOST/PORT/USER/PASSWORD
    // Antes do deploy (Mês 4-5) trocar para Resend ou Brevo (pendência Q11).
    const host = this.configService.get<string>("MAILTRAP_HOST") ?? "(não configurado)";
    this.logger.log(
      `[STUB] E-mail simulado via ${host}: to=${to}, subject="${subject}", body.length=${body.length}`,
    );
    // Em dev, apenas loga — não falha
  }
}
