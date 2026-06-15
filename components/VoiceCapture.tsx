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
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
          gap: 8,
        }}
      >
        <MicrophoneIcon size={28} weight="light" />
        <div style={{ fontWeight: 500 }}>Voice not available</div>
        <div style={{ fontSize: 11, maxWidth: 260 }}>
          Web Speech API requires Chrome on desktop. Please use the Type tab.
        </div>
      </div>
    );
  }

  const handleMicClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 4px",
      }}
    >
      {/* Mic / Stop button — pulse rings are siblings, not ancestors, so they can't clip */}
      <div style={{ position: "relative", flexShrink: 0, width: 56, height: 56 }}>
        {/* Pulse rings — only when listening */}
        {isListening && (
          <>
            <div
              style={{
                position: "absolute",
                inset: -14,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                opacity: 0.3,
                animation: "pulse-outer 1.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -7,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                opacity: 0.55,
                animation: "pulse-ring 1.5s ease-in-out infinite 0.3s",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        <button
          id="voice-btn"
          type="button"
          onClick={handleMicClick}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: isListening
              ? "linear-gradient(135deg,#E85D2A,#F97316)"
              : "var(--bg-elevated)",
            border: `2px solid ${isListening ? "var(--accent)" : "var(--border)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: isListening ? "0 0 0 3px rgba(232,93,42,0.2)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening
            ? <StopCircleIcon size={24} weight="fill" color="#fff" />
            : <MicrophoneIcon size={24} weight="regular" color="var(--text-secondary)" />
          }
        </button>
      </div>

      {/* Right: label + transcript + clear */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isListening ? "var(--accent)" : "var(--text-muted)",
            transition: "color 0.2s",
          }}
        >
          {isListening ? "Listening… speak now" : "Tap the mic to start speaking"}
        </div>

        {(transcript || interimTranscript) && (
          <div
            style={{
              background: "var(--bg-raised)",
              borderRadius: 8,
              padding: "5px 10px",
              border: "1px solid var(--border)",
              fontSize: 13,
              lineHeight: 1.4,
              maxHeight: 46,
              overflowY: "auto",
            }}
          >
            <span style={{ color: "var(--text-primary)" }}>{transcript}</span>
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{interimTranscript}</span>
          </div>
        )}

        {transcript && (
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: "2px 0", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, alignSelf: "flex-start" }}
            onClick={onReset}
          >
            <XIcon size={11} weight="bold" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
