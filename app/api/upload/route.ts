import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createPresignedPutUrl } from "@/lib/storage/presignedUrl";

const SESSION_COOKIE = "ic_session";
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE_MB = 10;

// ─── GET /api/upload?filename=photo.jpg&contentType=image/jpeg ────
// Returns a presigned S3 PUT URL for direct browser upload.
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "No session found. Submit a situation first." },
        { status: 401 }
      );
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

    return NextResponse.json({
      presignedUrl: result.presignedUrl,
      s3Key: result.s3Key,
      publicUrl: result.publicUrl,
      maxSizeMb: MAX_FILE_SIZE_MB,
      expiresIn: 300, // seconds
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/upload] Error:", message);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: message },
      { status: 500 }
    );
  }
}
