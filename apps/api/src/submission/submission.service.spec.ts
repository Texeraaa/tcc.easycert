import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { DocumentoService } from "../documento/documento.service";

describe("SubmissionService", () => {
  let service: SubmissionService;
  let prisma: jest.Mocked<PrismaService>;
  let auditService: jest.Mocked<AuditService>;
  let documentoService: jest.Mocked<DocumentoService>;

  const mockSubmission = {
    id: "sub-id-1",
    alunoId: "aluno-id-1",
    categoriaId: "cat-id-1",
    cargaInformadaHoras: 40,
    instituicao: null,
    estado: "AWAITING_UPLOAD" as const,
    motivoIndeferimento: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: PrismaService,
          useValue: {
            submission: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DocumentoService,
          useValue: {
            createPresignedPost: jest.fn(),
            confirmUpload: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
    prisma = module.get(PrismaService);
    auditService = module.get(AuditService);
    documentoService = module.get(DocumentoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("cria submissão em AWAITING_UPLOAD e retorna presigned POST", async () => {
      (prisma.submission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (documentoService.createPresignedPost as jest.Mock).mockResolvedValue({
        url: "http://minio:9000/easycert",
        fields: { key: "_tmp/aluno-id-1/sub-id-1/uuid.pdf" },
        key: "_tmp/aluno-id-1/sub-id-1/uuid.pdf",
      });

      const result = await service.create("aluno-id-1", {
        categoriaId: "cat-id-1",
        cargaInformadaHoras: 40,
      });

      expect(result.submission).toEqual(mockSubmission);
      expect(result.upload.key).toContain("_tmp/");
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "submission.state_changed",
          after: { estado: "AWAITING_UPLOAD" },
        }),
      );
    });
  });

  describe("findByIdForAluno", () => {
    it("retorna submissão quando pertence ao aluno", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);

      const result = await service.findByIdForAluno("sub-id-1", "aluno-id-1");
      expect(result).toEqual(mockSubmission);
    });

    it("lança 404 quando submissão não encontrada", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findByIdForAluno("nao-existe", "aluno-id-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("lança 404 quando submissão pertence a outro aluno (não vaza existência via 403)", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);

      await expect(
        service.findByIdForAluno("sub-id-1", "outro-aluno"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("confirm", () => {
    const validKey = "_tmp/aluno-id-1/sub-id-1/uuid.pdf";

    it("transiciona para PENDING quando magic bytes são válidos", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);
      (documentoService.confirmUpload as jest.Mock).mockResolvedValue({ ok: true });
      (prisma.submission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        estado: "PENDING",
      });

      const result = await service.confirm("sub-id-1", "aluno-id-1", validKey);

      expect(result.estado).toBe("PENDING");
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "submission.state_changed",
          after: { estado: "PENDING" },
        }),
      );
    });

    it("transiciona para UPLOAD_INVALID quando magic bytes são inválidos", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);
      (documentoService.confirmUpload as jest.Mock).mockResolvedValue({
        ok: false,
        reason: "magic_bytes_mismatch",
      });
      (prisma.submission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        estado: "UPLOAD_INVALID",
      });

      const result = await service.confirm("sub-id-1", "aluno-id-1", validKey);

      expect(result.estado).toBe("UPLOAD_INVALID");
    });

    it("lança 400 quando storageKey não pertence à submissão do aluno", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);

      await expect(
        service.confirm("sub-id-1", "aluno-id-1", "_tmp/outro-aluno/sub-id-1/uuid.pdf"),
      ).rejects.toThrow(BadRequestException);
    });

    it("lança 400 quando estado não é AWAITING_UPLOAD", async () => {
      (prisma.submission.findUnique as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        estado: "PENDING",
      });

      await expect(
        service.confirm("sub-id-1", "aluno-id-1", validKey),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
