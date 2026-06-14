"use client";

import { MicrophoneIcon, StopCircleIcon, XIcon } from "@phosphor-icons/react";

interface VoiceCaptureProps {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function VoiceCapture({
  isListening,
  isSupported,
  transcript,
  interimTranscript,
  onStart,
  onStop,
  onReset,
}: VoiceCaptureProps) {
  if (!isSupported) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 0",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <MicrophoneIcon size={32} weight="light" />
        </div>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Voice not available</div>
        <div style={{ fontSize: 12 }}>
          Web Speech API requires Chrome on desktop. Please use the Type tab instead.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 16, padding: "0 8px" }}>
      {/* Mic button */}
      <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
        {isListening && (
          <>
            <div
              style={{
                position: "absolute",
                inset: -16,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                opacity: 0.4,
                animation: "pulse-outer 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                opacity: 0.6,
                animation: "pulse-ring 1.5s ease-in-out infinite 0.3s",
              }}
            />
          </>
        )}
        <button
          id="voice-btn"
          onClick={isListening ? onStop : onStart}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: isListening
              ? "linear-gradient(135deg,#E85D2A,#F97316)"
              : "var(--bg-elevated)",
            border: `2px solid ${isListening ? "var(--accent)" : "var(--border)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: isListening ? "var(--shadow-glow)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening
            ? <StopCircleIcon size={28} weight="fill" color="#fff" />
            : <MicrophoneIcon size={28} weight="regular" color="var(--text-secondary)" />
          }
        </button>
      </div>

      {/* Right side: label + transcript */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: isListening ? "var(--accent)" : "var(--text-muted)",
            fontWeight: 500,
            marginBottom: 6,
            transition: "color 0.2s",
          }}
        >
          {isListening ? "Listening… speak now" : "Tap to start speaking"}
        </div>

        {/* Live transcript */}
        {(transcript || interimTranscript) && (
          <div
            style={{
              background: "var(--bg-raised)",
              borderRadius: 8,
              padding: "6px 10px",
              border: "1px solid var(--border)",
              fontSize: 13,
              lineHeight: 1.5,
              maxHeight: 48,
              overflowY: "auto",
            }}
          >
            <span style={{ color: "var(--text-primary)" }}>{transcript}</span>
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              {interimTranscript}
            </span>
          </div>
        )}

        {transcript && (
          <button
            className="btn-ghost"
            style={{ marginTop: 4, padding: "2px 6px", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11 }}
            onClick={onReset}
          >
            <XIcon size={11} weight="bold" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
