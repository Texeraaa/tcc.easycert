import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { AuditService } from "../audit/audit.service";

/**
 * Mock de verify do @node-rs/argon2.
 * Substituído por implementação simples para testes unitários.
 */
jest.mock("@node-rs/argon2", () => ({
  verify: jest.fn(),
}));

import { verify } from "@node-rs/argon2";
const mockVerify = verify as jest.Mock;

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("jwt-token-mock"),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    const baseUser = {
      id: "user-id-1",
      email: "aluno@easycert.local",
      passwordHash: "$argon2hash",
      nome: "Aluno Teste",
      ativo: true,
      role: "ALUNO" as const,
      dataIngresso: new Date("2023-01-01"),
      matricula: null,
      curso: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("retorna { id, role } quando credenciais são válidas", async () => {
      userService.findByEmail.mockResolvedValue(baseUser as any);
      mockVerify.mockResolvedValue(true);

      const result = await service.validateUser("aluno@easycert.local", "senha123");

      expect(result).toEqual({ id: "user-id-1", role: "ALUNO" });
      // Login bem-sucedido NÃO registra audit (decisão Q3)
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it("retorna null e registra audit quando usuário não existe", async () => {
      userService.findByEmail.mockResolvedValue(null);
      mockVerify.mockResolvedValue(false); // dummy verify (timing constante)

      const result = await service.validateUser("naoexiste@example.com", "senha");

      expect(result).toBeNull();
      // Timing-attack mitigation: verify roda mesmo quando usuário não existe
      // (contra DUMMY_PASSWORD_HASH), igualando o custo computacional.
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.login_failed",
          entity: "User",
          entityId: null,
          metadata: expect.objectContaining({
            email: "naoexiste@example.com",
            reason: "no_such_user",
          }),
        }),
      );
    });

    it("retorna null e registra audit quando senha é inválida", async () => {
      userService.findByEmail.mockResolvedValue(baseUser as any);
      mockVerify.mockResolvedValue(false);

      const result = await service.validateUser("aluno@easycert.local", "senha-errada");

      expect(result).toBeNull();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.login_failed",
          entityId: "user-id-1",
        }),
      );
    });

    it("retorna null e registra audit quando usuário está inativo", async () => {
      userService.findByEmail.mockResolvedValue({ ...baseUser, ativo: false } as any);
      mockVerify.mockResolvedValue(false); // dummy verify (timing constante)

      const result = await service.validateUser("aluno@easycert.local", "senha123");

      expect(result).toBeNull();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.login_failed",
          metadata: expect.objectContaining({ reason: "inactive" }),
        }),
      );
      // verify roda contra DUMMY_PASSWORD_HASH mesmo para usuário inativo,
      // para timing constante. Confirmar via mock.
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });
  });

  describe("login", () => {
    it("gera JWT com sub e role corretos", async () => {
      const token = await service.login({ id: "user-id-1", role: "ALUNO" as any });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: "user-id-1", role: "ALUNO" });
      expect(token).toBe("jwt-token-mock");
    });
  });
});
