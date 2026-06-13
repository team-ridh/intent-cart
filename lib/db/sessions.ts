import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient, getSessionsTable } from "./client";
import type { GeneratedCart, ParsedIntent, Session, UrgencyMode } from "../types";

// TTL = 7 days from now (DynamoDB TTL is in epoch seconds)
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function nowMs() {
  return Date.now();
}

function ttlSeconds() {
  return Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
}

// ─── Get a session by ID ──────────────────────────────────────────
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await getDocClient().send(
    new GetCommand({
      TableName: getSessionsTable(),
      Key: { sessionId },
    })
  );

  if (!result.Item) return null;
  return result.Item as Session;
}

// ─── Create or overwrite a session ───────────────────────────────
export async function saveSession(
  session: Omit<Session, "createdAt" | "updatedAt" | "expiresAt">
): Promise<void> {
  const now = nowMs();
  await getDocClient().send(
    new PutCommand({
      TableName: getSessionsTable(),
      Item: {
        ...session,
        createdAt: now,
        updatedAt: now,
        expiresAt: ttlSeconds(),
      } satisfies Session,
    })
  );
}

// ─── Save parsed intent to existing session ───────────────────────
export async function saveIntent(
  sessionId: string,
  situationText: string,
  intent: ParsedIntent,
  photoS3Key?: string
): Promise<void> {
  await getDocClient().send(
    new UpdateCommand({
      TableName: getSessionsTable(),
      Key: { sessionId },
      UpdateExpression:
        "SET situationText = :st, intent = :intent, updatedAt = :now, expiresAt = :ttl" +
        (photoS3Key ? ", photoS3Key = :photoKey" : ""),
      ExpressionAttributeValues: {
        ":st": situationText,
        ":intent": intent,
        ":now": nowMs(),
        ":ttl": ttlSeconds(),
        ...(photoS3Key ? { ":photoKey": photoS3Key } : {}),
      },
    })
  );
}

// ─── Save generated cart to session ──────────────────────────────
export async function saveCart(
  sessionId: string,
  cart: GeneratedCart,
  urgencyMode: UrgencyMode
): Promise<void> {
  await getDocClient().send(
    new UpdateCommand({
      TableName: getSessionsTable(),
      Key: { sessionId },
      UpdateExpression:
        "SET cart = :cart, urgencyMode = :mode, updatedAt = :now, expiresAt = :ttl",
      ExpressionAttributeValues: {
        ":cart": cart,
        ":mode": urgencyMode,
        ":now": nowMs(),
        ":ttl": ttlSeconds(),
      },
    })
  );
}

// ─── Update cart state (qty, substitutes, urgency) ───────────────
export async function updateCartState(
  sessionId: string,
  updates: {
    cart?: GeneratedCart;
    urgencyMode?: UrgencyMode;
    selectedSubstitutes?: Record<string, string>;
  }
): Promise<void> {
  const setParts: string[] = ["updatedAt = :now", "expiresAt = :ttl"];
  const values: Record<string, unknown> = {
    ":now": nowMs(),
    ":ttl": ttlSeconds(),
  };

  if (updates.cart !== undefined) {
    setParts.push("cart = :cart");
    values[":cart"] = updates.cart;
  }
  if (updates.urgencyMode !== undefined) {
    setParts.push("urgencyMode = :mode");
    values[":mode"] = updates.urgencyMode;
  }
  if (updates.selectedSubstitutes !== undefined) {
    setParts.push("selectedSubstitutes = :subs");
    values[":subs"] = updates.selectedSubstitutes;
  }

  await getDocClient().send(
    new UpdateCommand({
      TableName: getSessionsTable(),
      Key: { sessionId },
      UpdateExpression: `SET ${setParts.join(", ")}`,
      ExpressionAttributeValues: values,
      ConditionExpression: "attribute_exists(sessionId)",
    })
  );
}

// ─── Mark session as confirmed (checkout) ────────────────────────
export async function confirmSession(sessionId: string): Promise<void> {
  await getDocClient().send(
    new UpdateCommand({
      TableName: getSessionsTable(),
      Key: { sessionId },
      UpdateExpression:
        "SET #status = :confirmed, updatedAt = :now",
      ExpressionAttributeNames: {
        "#status": "status", // 'status' is a reserved word in DynamoDB
      },
      ExpressionAttributeValues: {
        ":confirmed": "confirmed",
        ":now": nowMs(),
      },
      ConditionExpression: "attribute_exists(sessionId)",
    })
  );
}
