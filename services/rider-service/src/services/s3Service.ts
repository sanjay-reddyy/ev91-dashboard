/**
 * S3 Service - Rider Service Implementation
 *
 * This service provides S3 functionality for rider-service specific needs.
 * 
 * Path structure: riders/{riderId}/{category}/{documentType}_{timestamp}.{ext}
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import path from "path";

// Document categories for rider service
export type DocumentCategory = "kyc" | "profile" | "bank";

// S3 client configuration
const s3Client = new S3Client({
  region: env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface S3UploadResult {
  key: string;
  location: string;
  bucket: string;
  size: number;
  contentType: string;
}

export interface S3UploadOptions {
  riderId?: string;
  documentType?: string;
  folder?: string;
  metadata?: Record<string, string>;
}

// Local S3 helper functions
async function uploadFile(
  entity: string,
  entityId: string,
  category: DocumentCategory,
  documentType: string,
  fileBuffer: Buffer,
  originalName: string,
  metadata: Record<string, string> = {}
) {
  const bucket = env.AWS_S3_BUCKET!;
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const key = `${entity}/${entityId}/${category}/${documentType}_${timestamp}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: metadata.contentType || 'application/octet-stream',
    Metadata: metadata,
  });

  await s3Client.send(command);

  return {
    key,
    bucket,
    url: `https://${bucket}.s3.${env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`,
  };
}

async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET!,
    Key: key,
  });
  await s3Client.send(command);
}

async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  // For now, return a basic URL - can be enhanced later with presigned URLs
  const bucket = env.AWS_S3_BUCKET!;
  return `https://${bucket}.s3.${env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
}

async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

async function getFileMetadata(key: string): Promise<Record<string, string> | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: env.AWS_S3_BUCKET!,
      Key: key,
    });
    const result = await s3Client.send(command);
    return result.Metadata || {};
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

export class S3Service {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      env.S3_BASE_URL ||
      `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  }

  /**
   * Upload a single file to S3 using industry-standard path structure
   */
  async uploadFile(
    file: Express.Multer.File | Buffer,
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult> {
    try {
      const {
        riderId,
        documentType = "document",
        folder = "kyc",
        metadata = {},
      } = options;

      // Handle both Multer file and Buffer
      const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
      const originalName = Buffer.isBuffer(file)
        ? "document"
        : file.originalname;
      const mimeType = Buffer.isBuffer(file)
        ? "application/octet-stream"
        : file.mimetype;
      const fileSize = Buffer.isBuffer(file) ? file.length : file.size;

      if (!riderId) {
        throw new Error("riderId is required for document uploads");
      }

      console.log(
        `📤 Uploading file to S3 (industry standard): ${documentType} for rider ${riderId}`
      );

      const uploadStartTime = Date.now();

      // Map folder to proper document category
      const category: DocumentCategory =
        folder === "bank" ? "bank" : folder === "profile" ? "profile" : "kyc";

      // Upload using the local S3 function with industry-standard path structure
      const result = await uploadFile(
        "riders",
        riderId,
        category,
        documentType,
        fileBuffer,
        originalName,
        {
          ...metadata,
          uploadedBy: "rider-service",
          contentType: mimeType,
        }
      );

      const uploadDuration = Date.now() - uploadStartTime;
      console.log(
        `✅ S3 upload successful in ${uploadDuration}ms: ${result.key}`
      );

      return {
        key: result.key,
        location: result.url,
        bucket: result.bucket,
        size: fileSize,
        contentType: mimeType,
      };
    } catch (error) {
      console.error("❌ S3 upload error:", error);
      throw new Error(
        `Failed to upload file to S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFile(file, options)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("S3 multiple upload error:", error);
      throw new Error(
        `Failed to upload files to S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await deleteFile(key);
      console.log(`🗑️ Deleted file from S3: ${key}`);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(
        `Failed to delete file from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a presigned URL for temporary access to a file
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      return await getSignedUrl(key, expiresIn);
    } catch (error) {
      console.error("S3 presigned URL error:", error);
      throw new Error(
        `Failed to generate presigned URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      return await fileExists(key);
    } catch (error: any) {
      if (error.name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(key: string): Promise<Record<string, string> | null> {
    try {
      return await getFileMetadata(key);
    } catch (error) {
      console.error("S3 metadata error:", error);
      throw new Error(
        `Failed to get file metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate public URL for a file
   */
  generatePublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

export const s3Service = new S3Service();
