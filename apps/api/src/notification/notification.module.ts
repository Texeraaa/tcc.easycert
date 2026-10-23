import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { NotificationService } from "./notification.service";
import { MailtrapProvider } from "./providers/mailtrap.provider";
import { FakeMailProvider } from "./providers/fake-mail.provider";
import type { MailProvider } from "./providers/mail-provider.interface";
import { MAIL_PROVIDER } from "./notification.tokens";

export { MAIL_PROVIDER };

/**
 * NotificationModule — notificações por e-mail transacional + central in-app.
 *
 * Seleciona o `MailProvider` concreto por ambiente:
 *   - `NODE_ENV === 'test'` → FakeMailProvider (in-memory, zero rede)
 *   - caso contrário → MailtrapProvider (SMTP; stub por ora, T6 Round 4 implementa real)
 *
 * Decisão Q11 ratificada: Resend vs. Brevo adiados para antes do deploy (Mês 4-5).
 */
@Module({
  imports: [ConfigModule],
  providers: [
    MailtrapProvider,
    FakeMailProvider,
    {
      provide: MAIL_PROVIDER,
      inject: [ConfigService, MailtrapProvider, FakeMailProvider],
      useFactory: (
        config: ConfigService,
        mailtrap: MailtrapProvider,
        fake: FakeMailProvider,
      ): MailProvider =>
        config.get("NODE_ENV") === "test" ? fake : mailtrap,
    },
    NotificationService,
  ],
  exports: [NotificationService, MAIL_PROVIDER],
})
export class NotificationModule {}
