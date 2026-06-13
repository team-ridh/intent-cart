import { S3Client } from "@aws-sdk/client-s3";

// ─── Lazy-validated env vars (validated at request time, not module load) ─────
// Module-level throws crash the SSR Lambda before any route handler runs,
// returning a plain-text 500 with no useful error body.
// Module-level process.env reads get baked in as `undefined` at Amplify build time.
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[S3] Missing required environment variable: ${key}. ` +
        `Set it in .env.local (dev) or Amplify environment variables (prod).`
    );
  }
  return value;
}

// ─── S3 client singleton — created lazily on first request ────────────────────
let _s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  _s3Client = new S3Client({
    region: getEnv("BEDROCK_REGION"),
    credentials: {
      accessKeyId: getEnv("BEDROCK_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("BEDROCK_SECRET_ACCESS_KEY"),
    },
  });

  return _s3Client;
}

export function getS3Bucket(): string {
  return getEnv("S3_BUCKET");
}
