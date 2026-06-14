"use client";

import { useState, useCallback, useRef, DragEvent } from "react";

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
  s3Key: string | null;
  publicUrl: string | null;
  isUploading: boolean;
  error: string | null;
}

export interface UseImageUploadReturn extends UploadState {
  handleFile: (file: File) => Promise<void>;
  reset: () => void;
  isDragging: boolean;
  dragProps: {
    onDragEnter: (e: DragEvent<HTMLElement>) => void;
    onDragLeave: (e: DragEvent<HTMLElement>) => void;
    onDragOver: (e: DragEvent<HTMLElement>) => void;
    onDrop: (e: DragEvent<HTMLElement>) => void;
  };
  inputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>({
    file: null,
    previewUrl: null,
    s3Key: null,
    publicUrl: null,
    isUploading: false,
    error: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const reset = useCallback(() => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setState({
      file: null,
      previewUrl: null,
      s3Key: null,
      publicUrl: null,
      isUploading: false,
      error: null,
    });
  }, [state.previewUrl]);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState((s) => ({
        ...s,
        error: `Invalid file type. Allowed: JPEG, PNG, WebP, HEIC`,
      }));
      return;
    }

    // Validate file size
    if (file.size > MAX_BYTES) {
      setState((s) => ({
        ...s,
        error: `File too large. Maximum size is 10 MB.`,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setState({
      file,
      previewUrl,
      s3Key: null,
      publicUrl: null,
      isUploading: true,
      error: null,
    });

    try {
      // 1. Get presigned PUT URL from our API
      let uploadUrlRes: Response;
      try {
        uploadUrlRes = await fetch(
          `/api/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
          { credentials: "include" }
        );
      } catch {
        throw new Error("Could not reach the server. Check your internet connection.");
      }

      if (uploadUrlRes.status === 401) {
        throw new Error("Please select a situation first before uploading a photo.");
      }

      if (!uploadUrlRes.ok) {
        const err = await uploadUrlRes.json().catch(() => ({ error: "Upload URL request failed" }));
        throw new Error(err.error ?? "Failed to get upload URL");
      }

      const { presignedUrl, s3Key, publicUrl } = await uploadUrlRes.json() as {
        presignedUrl: string;
        s3Key: string;
        publicUrl: string;
      };

      // 2. Upload file directly to S3 via presigned PUT
      let uploadRes: Response;
      try {
        uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
      } catch {
        // Network-level failure here is almost always an S3 CORS misconfiguration
        throw new Error(
          "Photo upload blocked — S3 CORS may not be configured for this domain. " +
          "Check the S3 bucket CORS policy in the AWS console."
        );
      }

      if (!uploadRes.ok) {
        throw new Error(`S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      setState((s) => ({
        ...s,
        s3Key,
        publicUrl,
        isUploading: false,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState((s) => ({ ...s, isUploading: false, error: message }));
    }
  }, []);

  // ─── Drag-and-drop handlers ────────────────────────────────────
  const onDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the drop zone entirely (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    ...state,
    handleFile,
    reset,
    isDragging,
    dragProps: { onDragEnter, onDragLeave, onDragOver, onDrop },
    inputRef,
    openFilePicker,
  };
}
