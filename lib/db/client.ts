import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// ─── Validate required environment variables at startup ───────────
const requiredEnvVars = [
  "BEDROCK_ACCESS_KEY_ID",
  "BEDROCK_SECRET_ACCESS_KEY",
  "BEDROCK_REGION",
  "DYNAMO_TABLE",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `[DynamoDB] Missing required environment variable: ${key}. ` +
        `Set it in .env.local (dev) or Amplify environment variables (prod).`
    );
  }
}

// ─── DynamoDB client singleton ────────────────────────────────────
const ddbClient = new DynamoDBClient({
  region: process.env.BEDROCK_REGION!,
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    // Remove undefined attributes to keep items clean
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

export const SESSIONS_TABLE = process.env.DYNAMO_TABLE!;
