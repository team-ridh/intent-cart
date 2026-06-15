"use client";

import { useRef } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CameraIcon, ArrowDownIcon, SpinnerIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react";

interface PhotoUploadProps {
  onUploaded: (s3Key: string, publicUrl: string, filename: string) => void;
}

export function PhotoUpload({ onUploaded }: PhotoUploadProps) {
  const { file, previewUrl, s3Key, isUploading, error, handleFile, reset, isDragging, dragProps, inputRef, openFilePicker } =
    useImageUpload();

  // Notify parent when upload completes
  const prevS3Key = useRef<string | null>(null);
  if (s3Key && s3Key !== prevS3Key.current && file) {
    prevS3Key.current = s3Key;
    const publicUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET ?? ""}.s3.${process.env.NEXT_PUBLIC_S3_REGION ?? "us-east-1"}.amazonaws.com/${s3Key}`;
    onUploaded(s3Key, publicUrl, file.name);
  }

  return (
    <div style={{ height: "100%" }}>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!previewUrl ? (
        /* Drop zone */
        <div
          {...dragProps}
          onClick={openFilePicker}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
            background: isDragging ? "var(--accent-dim)" : "var(--bg-raised)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "0 16px",
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
            }
          }}
          role="button"
          aria-label="Upload photo"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
          id="photo-upload-btn"
        >
          <div style={{ flexShrink: 0 }}>
            {isDragging
              ? <ArrowDownIcon size={28} weight="bold" color="var(--accent)" />
              : <CameraIcon size={28} weight="light" color="var(--text-muted)" />
            }
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 13 }}>
              {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
              JPEG, PNG, WebP · Max 10 MB
            </div>
          </div>
        </div>
      ) : (
        /* Preview */
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded photo"
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
            }}
          >
            {isUploading ? (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, animation: "rotate-slow 1s linear infinite" }}>
                  <SpinnerIcon size={24} weight="bold" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Uploading…</div>
              </div>
            ) : s3Key ? (
              <div style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  <CheckCircleIcon size={24} weight="fill" color="#4ade80" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Uploaded successfully</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#fff", fontWeight: 500 }}>
                <CameraIcon size={16} weight="regular" /> {file?.name}
              </div>
            )}
          </div>
          <button
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.7)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={(e) => {
              e.stopPropagation();
              prevS3Key.current = null;
              reset();
            }}
            aria-label="Remove photo"
          >
            <XIcon size={14} weight="bold" color="#fff" />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
