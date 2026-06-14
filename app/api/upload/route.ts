import { NextRequest, NextResponse, connection } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createPresignedPutUrl } from "@/lib/storage/presignedUrl";
import { saveSession } from "@/lib/db/sessions";

const SESSION_COOKIE = "ic_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE_MB = 10;

// ─── GET /api/upload?filename=photo.jpg&contentType=image/jpeg ────
// Returns a presigned S3 PUT URL for direct browser upload.
export async function GET(req: NextRequest) {
  try {
    // Force Next.js 16 to read env vars at runtime, not build time
    await connection();

    // Get existing session or create a new one so photo-first flow works
    const existingSessionId = req.cookies.get(SESSION_COOKIE)?.value;
    const sessionId = existingSessionId ?? uuidv4();
    const isNewSession = !existingSessionId;

    // If this is a brand-new session (photo uploaded before submitting a situation),
    // pre-create a minimal session record so /api/interpret can update it later.
    if (isNewSession) {
      await saveSession({
        sessionId,
        situationText: "",
        status: "active",
        urgencyMode: "fastest",
        selectedSubstitutes: {},
      });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");
    const contentType = searchParams.get("contentType");

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType query params are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid content type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Sanitise filename and build S3 key scoped to the session
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = contentType.split("/")[1] ?? "jpg";
    const s3Key = `sessions/${sessionId}/${uuidv4()}.${ext}`;

    const result = await createPresignedPutUrl(s3Key, contentType);

    const responseBody = {
      presignedUrl: result.presignedUrl,
      s3Key: result.s3Key,
      publicUrl: result.publicUrl,
      maxSizeMb: MAX_FILE_SIZE_MB,
      expiresIn: 300, // seconds
    };

    const res = NextResponse.json(responseBody);

    // Set the session cookie if we just created a new session
    if (isNewSession) {
      res.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/upload] Error:", message);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: message },
      { status: 500 }
    );
  }
}
