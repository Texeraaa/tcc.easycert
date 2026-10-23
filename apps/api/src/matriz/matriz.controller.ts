import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { MatrizService } from "./matriz.service";

/**
 * MatrizController — gerencia Categorias e RegraMatriz.
 *
 * GET  /categorias          — lista categorias (JWT obrigatório)
 * POST /categorias          — cria categoria (ADMIN)
 * PATCH /categorias/:id     — atualiza categoria (ADMIN)
 * POST /regras-matriz       — cria regra (ADMIN)
 * PATCH /regras-matriz/:id  — atualiza regra (ADMIN)
 */
@Controller()
export class MatrizController {
  constructor(private readonly matrizService: MatrizService) {}

  /**
   * Lista categorias ativas.
   * Aluno precisa ver a lista para criar submissão — exige JWT mas não papel específico.
   * STUB — T6 Round 4.
   */
  @Get("categorias")
  @UseGuards(JwtAuthGuard)
  findAllCategorias() {
    return this.matrizService.findAllCategorias();
  }

  /**
   * Cria nova categoria.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Post("categorias")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  createCategoria(@Body() body: unknown) {
    // TODO: validação de CreateCategoriaDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.matrizService.createCategoria(body);
  }

  /**
   * Atualiza categoria existente.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Patch("categorias/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  updateCategoria(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateCategoriaDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.matrizService.updateCategoria(id, body);
  }

  /**
   * Cria nova regra de teto de horas.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Post("regras-matriz")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  createRegra(@Body() body: unknown) {
    // TODO: validação de CreateRegraMatrizDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.matrizService.createRegra(body);
  }

  /**
   * Atualiza regra de teto de horas existente.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Patch("regras-matriz/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  updateRegra(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateRegraMatrizDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.matrizService.updateRegra(id, body);
  }
}
