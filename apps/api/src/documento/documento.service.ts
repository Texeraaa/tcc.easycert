import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketLifecycleConfigurationCommand,
  HeadObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type { Documento } from "@easycert/db";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Resultado de um presigned POST para upload direto ao MinIO/S3.
 */
export interface PresignedPostResult {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * DocumentoService — versionamento de PDFs e emissão de certificados.
 *
 * Gerencia o ciclo de vida dos documentos armazenados no MinIO/S3:
 * - Bootstrap do bucket (create + lifecycle rule em onModuleInit)
 * - Geração de presigned POST para upload direto do browser
 * - Validação de magic bytes PDF após upload
 * - Promoção do PDF de _tmp/* para documentos/<codigo>/v1.pdf (atômica, com
 *   CopySourceIfMatch para fechar TOCTOU)
 * - Verificação pública de documentos via código opaco (QRCode)
 */
@Injectable()
export class DocumentoService implements OnModuleInit {
  private readonly logger = new Logger(DocumentoService.name);
  private s3: S3Client;
  private bucket: string;
  /**
   * Flag de saúde do storage. False até onModuleInit completar com sucesso
   * (ou um createPresignedPost futuro conseguir rodar o bootstrap preguiçoso).
   * HealthController.ready lê via `isStorageReady()`.
   */
  private storageReady = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const endpoint = this.configService.get<string>("MINIO_ENDPOINT");
    const accessKeyId = this.configService.get<string>("MINIO_ACCESS_KEY") ?? "";
    const secretAccessKey = this.configService.get<string>("MINIO_SECRET_KEY") ?? "";
    this.bucket = this.configService.get<string>("MINIO_BUCKET") ?? "easycert";

    this.s3 = new S3Client({
      endpoint,
      region: "us-east-1",
      credentials: { accessKeyId, secretAccessKey },
      // forcePathStyle necessário para MinIO em modo path-style (localhost:9000/bucket)
      forcePathStyle: true,
    });
  }

  isStorageReady(): boolean {
    return this.storageReady;
  }

  /**
   * Garante que o bucket existe e aplica lifecycle rule para expirar _tmp/* após 7 dias.
   * Falha silenciosa: se MinIO não estiver up, apenas loga o erro sem travar o boot.
   * O health endpoint /health/ready reporta degradação quando storage está indisponível.
   */
  async onModuleInit(): Promise<void> {
    await this.bootstrapStorage();
  }

  private async bootstrapStorage(): Promise<void> {
    try {
      // Verifica se o bucket já existe
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket '${this.bucket}' já existe.`);
      } catch {
        // Bucket não encontrado — cria
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket '${this.bucket}' criado com sucesso.`);
      }

      // Aplica lifecycle rule para expirar objetos em _tmp/ após 7 dias.
      // Documentos CONFIRMADOS ficam em documentos/<codigo>/vN.pdf (fora do prefixo
      // _tmp/) para não serem apagados pelo lifecycle.
      await this.s3.send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: this.bucket,
          LifecycleConfiguration: {
            Rules: [
              {
                ID: "expire-tmp-after-7-days",
                Status: "Enabled",
                Filter: { Prefix: "_tmp/" },
                Expiration: { Days: 7 },
              },
            ],
          },
        }),
      );

      this.logger.log("Lifecycle rule '_tmp/ expira em 7 dias' aplicada.");
      this.storageReady = true;
    } catch (err) {
      this.storageReady = false;
      this.logger.error(
        `Falha ao inicializar storage (bucket='${this.bucket}'): ${String(err)}. ` +
          `Verifique se o MinIO está rodando em ${this.configService.get("MINIO_ENDPOINT")}.`,
      );
    }
  }

  /**
   * Gera um presigned POST para upload direto do browser ao MinIO.
   *
   * Key gerado: _tmp/<alunoId>/<submissionId>/<uuid>.pdf
   * Condições impostas pelo bucket: content-length-range 0–10MB, Content-Type application/pdf.
   * Expira em 5 minutos (300 segundos).
   *
   * Se o bootstrap do storage falhou no onModuleInit (MinIO estava down),
   * tenta reexecutar aqui antes de gerar o presigned.
   */
  async createPresignedPost(
    submissionId: string,
    alunoId: string,
  ): Promise<PresignedPostResult> {
    if (!this.storageReady) {
      await this.bootstrapStorage();
    }

    const key = `_tmp/${alunoId}/${submissionId}/${randomUUID()}.pdf`;

    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10_485_760], // máximo 10 MB (decisão RNF-03)
        ["eq", "$Content-Type", "application/pdf"],
      ],
      Fields: {
        "Content-Type": "application/pdf",
      },
      Expires: 300, // 5 minutos
    });

    return { url, fields, key };
  }

  /**
   * Confirma que o arquivo foi carregado, valida magic bytes PDF (%PDF-) e
   * promove para `documentos/<codigo>/v1.pdf` (fora do prefixo _tmp/ que o
   * lifecycle apaga após 7 dias). Operação atômica com CopySourceIfMatch:ETag
   * para fechar TOCTOU (o aluno não pode trocar o arquivo entre validação e persistência).
   *
   * Se válido: cria registro Documento com storageKey apontando para o path final
   *            e confirmedAt preenchido.
   * Se inválido: retorna { ok: false, reason: '...' } e o arquivo em _tmp/
   *              expira naturalmente pelo lifecycle.
   */
  async confirmUpload(
    submissionId: string,
    tmpKey: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    // 1. HEAD do objeto para pegar ETag (snapshot do conteúdo atual).
    let etag: string;
    try {
      const headResp = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: tmpKey }),
      );
      if (!headResp.ETag) {
        return { ok: false, reason: "objeto_sem_etag" };
      }
      etag = headResp.ETag;
    } catch {
      return { ok: false, reason: "objeto_nao_encontrado" };
    }

    // 2. Lê os primeiros 5 bytes para validar magic bytes PDF (%PDF-).
    //    Para arquivos > 5 bytes, break antecipado evita acumular memória.
    const getResp = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: tmpKey,
        Range: "bytes=0-7",
      }),
    );

    const stream = getResp.Body;
    if (!stream) {
      return { ok: false, reason: "objeto_sem_conteudo" };
    }

    const chunks: Uint8Array[] = [];
    let accumulated = 0;
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
      accumulated += chunk.length;
      if (accumulated >= 5) break;
    }
    const bytes = Buffer.concat(chunks);

    if (bytes.length < 5) {
      return { ok: false, reason: "arquivo_vazio_ou_truncado" };
    }

    // Magic bytes PDF: 0x25 0x50 0x44 0x46 0x2D ('%PDF-')
    const isPdf =
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d;

    if (!isPdf) {
      return { ok: false, reason: "magic_bytes_mismatch" };
    }

    // 3. Promove _tmp/* → documentos/<codigo>/v1.pdf de forma atômica.
    //    CopySourceIfMatch:etag garante que o arquivo não mudou entre o HEAD/GET
    //    acima e esta operação — se mudou (aluno re-fez upload), o copy falha.
    const codigo = randomUUID(); // UUIDv4 opaco (decisão Q1)
    const finalKey = `documentos/${codigo}/v1.pdf`;

    try {
      await this.s3.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: finalKey,
          CopySource: `${this.bucket}/${tmpKey}`,
          CopySourceIfMatch: etag,
          ContentType: "application/pdf",
          MetadataDirective: "REPLACE",
        }),
      );
    } catch (err) {
      // ETag mismatch ou outra falha de copy — não persiste Documento
      this.logger.warn(
        `CopyObject falhou para ${tmpKey} → ${finalKey}: ${String(err)}`,
      );
      return { ok: false, reason: "copy_failed_or_etag_mismatch" };
    }

    // 4. Remove o original em _tmp/ (lifecycle também pegaria em 7 dias, mas
    //    deletar imediatamente evita confusão em debug e libera espaço).
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: tmpKey }),
      );
    } catch (err) {
      // Falha ao deletar não é fatal — lifecycle resolve em 7 dias.
      this.logger.warn(
        `DeleteObject _tmp falhou para ${tmpKey}: ${String(err)}. Lifecycle vai limpar.`,
      );
    }

    // 5. Persiste o registro Documento apontando para o path final.
    await this.prisma.documento.create({
      data: {
        submissionId,
        tipo: "COMPROVANTE",
        codigo,
        storageKey: finalKey,
        confirmedAt: new Date(),
        version: 1,
      },
    });

    return { ok: true };
  }

  /**
   * Verifica documento pelo código opaco UUIDv4 (rota pública /v/:codigo).
   * Retorna null se não encontrado.
   */
  async verifyByCodigo(codigo: string): Promise<Documento | null> {
    return this.prisma.documento.findUnique({ where: { codigo } });
  }
}
