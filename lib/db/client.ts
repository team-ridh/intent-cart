import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// ─── Lazy-validated env vars (validated at request time, not module load) ─────
// Throwing at module load crashes the entire SSR Lambda with a plain-text 500
// that swallows the real error message. Validate at request time so the route
// handler can catch and return a proper JSON error response instead.
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[DynamoDB] Missing required environment variable: ${key}. ` +
        `Set it in .env.local (dev) or Amplify environment variables (prod).`
    );
  }
  return value;
}

// ─── DynamoDB client singleton — created lazily on first request ───────────────
let _docClient: DynamoDBDocumentClient | null = null;

export function getDocClient(): DynamoDBDocumentClient {
  if (_docClient) return _docClient;

  const ddbClient = new DynamoDBClient({
    region: getEnv("BEDROCK_REGION"),
    credentials: {
      accessKeyId: getEnv("BEDROCK_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("BEDROCK_SECRET_ACCESS_KEY"),
    },
  });

  _docClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
  });

  return _docClient;
}

export function getSessionsTable(): string {
  return getEnv("DYNAMO_TABLE");
}
