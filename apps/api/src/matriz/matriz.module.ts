import { Module } from "@nestjs/common";
import { MatrizService } from "./matriz.service";
import { MatrizController } from "./matriz.controller";

/**
 * MatrizModule — CRUD de Categoria e RegraMatriz.
 */
@Module({
  controllers: [MatrizController],
  providers: [MatrizService],
  exports: [MatrizService],
})
export class MatrizModule {}
