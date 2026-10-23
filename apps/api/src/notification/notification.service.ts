import { Inject, Injectable, Logger } from "@nestjs/common";

import { MAIL_PROVIDER } from "./notification.tokens";
import type { MailProvider } from "./providers/mail-provider.interface";

/**
 * NotificationService — fachada para disparo de notificações.
 *
 * Hoje: só e-mail (via MailProvider injetado).
 * Mês 3: central in-app (persistir em `Notification`) + WebSocket para badge.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(MAIL_PROVIDER) private readonly mail: MailProvider,
  ) {}

  async notifyEmail(to: string, subject: string, body: string): Promise<void> {
    await this.mail.send(to, subject, body);
    this.logger.debug(`notifyEmail → ${to}: ${subject}`);
  }
}
