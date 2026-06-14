"use client";

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
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎙</div>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Voice not available</div>
        <div style={{ fontSize: 12 }}>
          Web Speech API requires Chrome on desktop. Please use the Type tab instead.
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      {/* Mic button with pulse rings */}
      <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 20px" }}>
        {isListening && (
          <>
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                border: "2px solid var(--accent)",
                opacity: 0.4,
                animation: "pulse-outer 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -10,
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
            fontSize: 36,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: isListening ? "var(--shadow-glow)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening ? "🛑" : "🎙"}
        </button>
      </div>

      <div
        style={{
          fontSize: 14,
          color: isListening ? "var(--accent)" : "var(--text-muted)",
          marginBottom: 12,
          fontWeight: 500,
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
            borderRadius: 12,
            padding: "12px 16px",
            textAlign: "left",
            marginTop: 12,
            border: "1px solid var(--border)",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>{transcript}</span>
          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            {interimTranscript}
          </span>
        </div>
      )}

      {transcript && (
        <button className="btn-ghost" style={{ marginTop: 12 }} onClick={onReset}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}
