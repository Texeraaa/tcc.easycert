/**
 * Token DI para resolver o `MailProvider` concreto.
 * Isolado em arquivo próprio para evitar circular import entre
 * NotificationModule ⇄ NotificationService.
 */
export const MAIL_PROVIDER = Symbol("MAIL_PROVIDER");
