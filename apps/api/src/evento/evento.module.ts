import { Module } from "@nestjs/common";
import { EventoService } from "./evento.service";
import { EventoController } from "./evento.controller";

/**
 * EventoModule — CRUD de EventoInterno (eventos da instituição com geração de certificado).
 */
@Module({
  controllers: [EventoController],
  providers: [EventoService],
  exports: [EventoService],
})
export class EventoModule {}
