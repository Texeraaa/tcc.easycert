/**
 * Interface para provedores de e-mail transacional.
 * Implementações concretas: MailtrapProvider (dev) e FakeMailProvider (testes).
 */
export interface MailProvider {
  /**
   * Envia e-mail transacional.
   * @param to - Endereço de destino
   * @param subject - Assunto
   * @param body - Corpo do e-mail (pode ser HTML)
   */
  send(to: string, subject: string, body: string): Promise<void>;
}
