import { Global, Module } from "@nestjs/common";
import { csrfGenerateToken } from "./csrf.setup";

/**
 * Token DI para o generateToken do csrf-csrf.
 * Injetado em AuthController para setar o cookie CSRF na rota GET /auth/csrf-token.
 */
export const CSRF_GENERATE_TOKEN = "CSRF_GENERATE_TOKEN";

/**
 * CsrfModule — módulo global que exporta o generateToken do csrf-csrf.
 *
 * @Global() permite que qualquer módulo injete CSRF_GENERATE_TOKEN sem
 * precisar importar CsrfModule explicitamente.
 *
 * O singleton doubleCsrfProtection é usado no middleware (AppModule.configure);
 * o generateToken é usado pelo AuthController para emitir o cookie na rota
 * GET /auth/csrf-token — ambos compartilham a mesma instância via csrf.setup.ts.
 */
@Global()
@Module({
  providers: [
    { provide: CSRF_GENERATE_TOKEN, useValue: csrfGenerateToken },
  ],
  exports: [CSRF_GENERATE_TOKEN],
})
export class CsrfModule {}
