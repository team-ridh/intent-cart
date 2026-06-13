import { S3Client } from "@aws-sdk/client-s3";

// ─── Validate required environment variables ──────────────────────
const requiredEnvVars = [
  "BEDROCK_ACCESS_KEY_ID",
  "BEDROCK_SECRET_ACCESS_KEY",
  "BEDROCK_REGION",
  "S3_BUCKET",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `[S3] Missing required environment variable: ${key}. ` +
        `Set it in .env.local (dev) or Amplify environment variables (prod).`
    );
  }
}

// ─── S3 client singleton ──────────────────────────────────────────
export const s3Client = new S3Client({
  region: process.env.BEDROCK_REGION!,
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET!;
