"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  CameraIcon,
  ArrowDownIcon,
  SpinnerIcon,
  CheckCircleIcon,
  XIcon,
  ImageIcon,
  ArrowRightIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";

interface PhotoUploadProps {
  onUploaded: (s3Key: string, publicUrl: string, filename: string) => void;
  /** Called when the user clicks "Use this photo" after a successful upload */
  onConfirm?: () => void;
}

// ── Lightbox modal ────────────────────────────────────────────────
function Lightbox({
  src,
  filename,
  onClose,
}: {
  src: string;
  filename: string;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-label="Image preview"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "photo-lb-in 0.18s ease",
      }}
    >
      {/* Header bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      >
        {/* Filename pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            maxWidth: "calc(100% - 60px)",
            overflow: "hidden",
          }}
        >
          <ImageIcon size={13} weight="regular" color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {filename}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.22)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)")
          }
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={filename}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(90vw, 900px)",
          maxHeight: "80vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 16,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "photo-lb-img-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
          pointerEvents: "none",
        }}
      >
        Click outside or press Esc to close
      </div>

      <style>{`
        @keyframes photo-lb-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes photo-lb-img-in {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Main component ────────────────────────────────────────────────
export function PhotoUpload({ onUploaded, onConfirm }: PhotoUploadProps) {
  const {
    file,
    previewUrl,
    s3Key,
    publicUrl,
    isUploading,
    error,
    handleFile,
    reset,
    isDragging,
    dragProps,
    inputRef,
    openFilePicker,
  } = useImageUpload();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [thumbHovered, setThumbHovered] = useState(false);
  const prevS3Key = useRef<string | null>(null);

  // Notify parent when upload completes (once per key) — must be in
  // useEffect to avoid calling setState on another component during render.
  // Use the publicUrl returned by the server (already stored in hook state)
  // rather than re-constructing it client-side from env vars that may be unset.
  useEffect(() => {
    if (s3Key && s3Key !== prevS3Key.current && file) {
      prevS3Key.current = s3Key;
      // `publicUrl` comes directly from /api/upload response via useImageUpload
      const resolvedPublicUrl =
        publicUrl ??
        `https://${process.env.NEXT_PUBLIC_S3_BUCKET ?? ""}.s3.${
          process.env.NEXT_PUBLIC_S3_REGION ?? "us-east-1"
        }.amazonaws.com/${s3Key}`;
      onUploaded(s3Key, resolvedPublicUrl, file.name);
    }
  }, [s3Key, publicUrl, file, onUploaded]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
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
        /* ── Drop zone ─────────────────────────────────────── */
        <div
          {...dragProps}
          onClick={openFilePicker}
          style={{
            flex: 1,
            borderRadius: 12,
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
            background: isDragging ? "var(--accent-dim)" : "var(--bg-raised)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "0 16px",
            textAlign: "center",
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
            {isDragging ? (
              <ArrowDownIcon size={28} weight="bold" color="var(--accent)" />
            ) : (
              <CameraIcon size={28} weight="light" color="var(--text-muted)" />
            )}
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
        /* ── Preview state ──────────────────────────────────── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          {/* Image thumbnail — click to open lightbox */}
          <div
            style={{
              flex: 1,
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--bg-raised)",
              border: `1px solid ${thumbHovered && !isUploading ? "var(--accent)" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
              cursor: isUploading ? "default" : "zoom-in",
              transition: "border-color 0.15s ease",
            }}
            onClick={() => !isUploading && setLightboxOpen(true)}
            onMouseEnter={() => !isUploading && setThumbHovered(true)}
            onMouseLeave={() => setThumbHovered(false)}
            role={isUploading ? undefined : "button"}
            aria-label={isUploading ? undefined : "Preview image"}
            tabIndex={isUploading ? undefined : 0}
            onKeyDown={(e) => {
              if (!isUploading && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded photo"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: 10,
                display: "block",
                transition: "transform 0.2s ease",
                transform: thumbHovered && !isUploading ? "scale(1.02)" : "scale(1)",
              }}
            />

            {/* Hover zoom hint */}
            {thumbHovered && !isUploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    borderRadius: 24,
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  <MagnifyingGlassPlusIcon size={14} weight="bold" />
                  Preview
                </div>
              </div>
            )}

            {/* Uploading overlay */}
            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.52)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  borderRadius: 12,
                }}
              >
                <div style={{ animation: "rotate-slow 1s linear infinite", display: "flex" }}>
                  <SpinnerIcon size={22} weight="bold" color="#fff" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>
                  Uploading…
                </div>
              </div>
            )}

            {/* Upload success badge — top-left */}
            {s3Key && !isUploading && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 20,
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4ade80",
                  pointerEvents: "none",
                }}
              >
                <CheckCircleIcon size={12} weight="fill" color="#4ade80" />
                Ready
              </div>
            )}

            {/* Remove button — top-right */}
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                prevS3Key.current = null;
                setLightboxOpen(false);
                reset();
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.8)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.6)")
              }
              aria-label="Remove photo"
            >
              <XIcon size={13} weight="bold" color="#fff" />
            </button>
          </div>

          {/* Filename pill + "Use this photo" CTA row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Filename badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                fontSize: 11,
                color: "var(--text-secondary)",
                fontWeight: 500,
                minWidth: 0,
                overflow: "hidden",
                flex: 1,
              }}
            >
              <ImageIcon size={12} weight="regular" color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file?.name ?? "image"}
              </span>
            </div>

            {/* "Use this photo" — shown once upload is done */}
            {s3Key && !isUploading && onConfirm && (
              <button
                onClick={onConfirm}
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                Use photo <ArrowRightIcon size={11} weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {error}
        </div>
      )}

      {/* Lightbox portal */}
      {lightboxOpen && previewUrl && (
        <Lightbox
          src={previewUrl}
          filename={file?.name ?? "image"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
