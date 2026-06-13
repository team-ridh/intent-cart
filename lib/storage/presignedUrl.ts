import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getS3Bucket } from "./s3Client";
import type { PresignedUploadResult } from "../types";

// Presigned PUT URL is valid for 5 minutes
const PRESIGNED_URL_EXPIRES_IN = 300;

// ─── Generate a presigned PUT URL for direct browser upload ──────────────────
export async function createPresignedPutUrl(
  s3Key: string,
  contentType: string
): Promise<PresignedUploadResult> {
  const bucket = getS3Bucket();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  const region = process.env.BEDROCK_REGION ?? "us-east-1";
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

  return { presignedUrl, s3Key, publicUrl };
}

// ─── Generate a presigned GET URL for reading an uploaded object ─────────────
export async function createPresignedGetUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getS3Bucket(),
    Key: s3Key,
  });

  return getSignedUrl(getS3Client(), command, {
    expiresIn: 60 * 60, // 1 hour
  });
}

// ─── Construct the public S3 URL for an object (requires public bucket) ──────
export function getPublicUrl(s3Key: string): string {
  const region = process.env.BEDROCK_REGION ?? "us-east-1";
  return `https://${getS3Bucket()}.s3.${region}.amazonaws.com/${s3Key}`;
}
