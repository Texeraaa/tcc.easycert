import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

/**
 * UserModule — CRUD de usuários.
 * Exporta UserService para que AuthModule possa usar findByEmail.
 */
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
