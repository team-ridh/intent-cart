"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { parseIntent } from "@/lib/ai/intentParser";
import { generateCart } from "@/lib/ai/cartGenerator";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Logo } from "@/components/Logo";
import { SituationChips } from "@/components/SituationChips";
import { VoiceCapture } from "@/components/VoiceCapture";
import { PhotoUpload } from "@/components/PhotoUpload";
import { IntentPreview } from "@/components/IntentPreview";
import { UrgencyBar } from "@/components/UrgencyBar";
import { Button } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { UrgencyMode } from "@/lib/types";

const PLACEHOLDER_CYCLE = [
  "Guests are arriving in 30 minutes…",
  "Feeling sick, need medicines…",
  "Need pooja items before evening…",
  "Power cut, need emergency supplies…",
  "School project due tomorrow…",
  "Tea time! Need snacks…",
];

function SituationPage() {
  const router = useRouter();
  const {
    situationText, setSituationText,
    urgencyMode, setUrgencyMode,
    photoS3Key, setPhotoS3Key,
    setIntent, setCart, setIsLoading,
    reset,
  } = useCartStore();

  const [activeTab, setActiveTab] = useState<"type" | "voice" | "photo">("type");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [intentPreview, setIntentPreview] = useState<string | null>(null);
  const [previewConfidence, setPreviewConfidence] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript, interimTranscript,
    isListening, isSupported,
    start, stop, reset: resetSpeech,
  } = useSpeechRecognition();

  // Reset store on arriving at home page
  useEffect(() => { reset(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync voice transcript
  useEffect(() => {
    if (transcript) setSituationText(transcript);
  }, [transcript, setSituationText]);

  // Animated placeholder cycle
  useEffect(() => {
    if (situationText || activeTab !== "type") return;
    const phrase = PLACEHOLDER_CYCLE[placeholderIdx];
    let i = 0;
    setPlaceholderText("");
    const interval = setInterval(() => {
      i++;
      setPlaceholderText(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(interval);
        setTimeout(() => setPlaceholderIdx((p) => (p + 1) % PLACEHOLDER_CYCLE.length), 1800);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [placeholderIdx, situationText, activeTab]);

  // Quick intent preview as user types (local keyword check for immediate feedback)
  // This is just UI polish — the real Bedrock call happens on submit
  useEffect(() => {
    if (!situationText || situationText.length < 5) {
      setIntentPreview(null);
      setPreviewConfidence(0);
      return;
    }

    const timer = setTimeout(() => {
      // Simple keyword heuristics for live preview only (not the actual AI)
      const lower = situationText.toLowerCase();
      const previews: Array<{ keywords: string[]; label: string; confidence: number }> = [
        { keywords: ["guest", "visitor", "hosting", "arriving", "party"], label: "Hosting · High urgency", confidence: 88 },
        { keywords: ["fever", "sick", "medicine", "cold", "cough", "ill"], label: "Fever Care · High urgency", confidence: 91 },
        { keywords: ["pooja", "puja", "prayer", "temple", "ritual"], label: "Pooja Essentials · Medium urgency", confidence: 85 },
        { keywords: ["rain", "raining", "monsoon", "rainy"], label: "Rainy Day · Medium urgency", confidence: 82 },
        { keywords: ["travel", "flight", "train", "trip", "leaving"], label: "Travel Prep · High urgency", confidence: 87 },
        { keywords: ["power cut", "outage", "blackout", "no power"], label: "Power Cut · High urgency", confidence: 90 },
        { keywords: ["school", "project", "homework", "stationery"], label: "School Project · High urgency", confidence: 84 },
        { keywords: ["tea", "chai", "coffee", "break", "snack"], label: "Tea Break · Low urgency", confidence: 79 },
      ];

      for (const p of previews) {
        if (p.keywords.some((k) => lower.includes(k))) {
          setIntentPreview(`Detected: ${p.label}`);
          setPreviewConfidence(p.confidence);
          return;
        }
      }
      setIntentPreview(null);
      setPreviewConfidence(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [situationText]);

  // Submit — calls Bedrock via /api/interpret
  const handleSubmit = useCallback(async () => {
    const input = situationText.trim();
    if (!input) { setError("Please describe your situation first"); return; }

    setError(null);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // parseIntent calls /api/interpret → Bedrock → saves to DynamoDB → sets cookie
      const intent = await parseIntent(input, photoS3Key ?? undefined);

      // Generate cart locally (fast) — also saved to DynamoDB by /api/cart (POST from cart page)
      const cart = generateCart(intent, urgencyMode);
      setIntent(intent);
      setCart(cart);

      router.push("/cart");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [situationText, urgencyMode, photoS3Key, setIntent, setCart, setIsLoading, router]);

  const handleChipSelect = useCallback(
    (text: string) => {
      setSituationText(text);
      textareaRef.current?.focus();
    },
    [setSituationText]
  );

  const handleUrgencyChange = (mode: UrgencyMode) => {
    setUrgencyMode(mode);
  };

  const canSubmit = situationText.trim().length > 3;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 pb-16 pt-8 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,93,42,0.07) 0%, transparent 70%)", top: -200, left: -200, filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,153,187,0.06) 0%, transparent 70%)", bottom: -100, right: -100, filter: "blur(60px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 640, position: "relative", zIndex: 1 }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
          <Logo />
          <span className="badge badge-teal">Beta</span>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }} className="animate-float-in">
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 14 }}>
            What is happening{" "}
            <span className="gradient-text">right now?</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Describe your situation — we'll build your cart in seconds.
            <br />No search. No browsing. Just say the need.
          </p>
        </div>

        {/* Input card */}
        <div className="glass-elevated animate-slide-up" style={{ padding: 24, marginBottom: 20 }}>

          {/* Tab bar */}
          <div className="tab-bar" style={{ marginBottom: 20 }}>
            {(["type", "voice", "photo"] as const).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                className={`tab-item${activeTab === t ? " active" : ""}`}
                onClick={() => {
                  setActiveTab(t);
                  if (t !== "voice" && isListening) stop();
                }}
              >
                {t === "type" ? "⌨️ Type" : t === "voice" ? "🎙 Voice" : "📷 Photo"}
              </button>
            ))}
          </div>

          {/* Type tab */}
          {activeTab === "type" && (
            <div>
              <textarea
                ref={textareaRef}
                id="situation-text-input"
                className="input-glass"
                style={{ minHeight: 120, lineHeight: 1.6 }}
                placeholder={placeholderText || "Type your situation here…"}
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                {situationText.length > 0 && <span>{situationText.length} chars · ⌘↵ to submit</span>}
              </div>
            </div>
          )}

          {/* Voice tab */}
          {activeTab === "voice" && (
            <VoiceCapture
              isListening={isListening}
              isSupported={isSupported}
              transcript={transcript}
              interimTranscript={interimTranscript}
              onStart={start}
              onStop={stop}
              onReset={() => { resetSpeech(); setSituationText(""); }}
            />
          )}

          {/* Photo tab */}
          {activeTab === "photo" && (
            <PhotoUpload
              onUploaded={(s3Key, _publicUrl, filename) => {
                setPhotoS3Key(s3Key);
                setSituationText(`Photo: ${filename.replace(/\.[^.]+$/, "")} — analyse and build my cart`);
              }}
            />
          )}

          {/* Intent preview strip */}
          {intentPreview && (
            <IntentPreview
              preview={intentPreview}
              confidence={previewConfidence}
              urgencyMode={urgencyMode}
            />
          )}
        </div>

        {/* Situation chips */}
        <div style={{ marginBottom: 28 }}>
          <SituationChips activeText={situationText} onSelect={handleChipSelect} />
        </div>

        {/* Urgency mode */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Delivery preference
          </div>
          <UrgencyBar value={urgencyMode} onChange={handleUrgencyChange} idPrefix="urgency" />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <Button
          id="build-cart-btn"
          variant="primary"
          loading={isSubmitting}
          disabled={!canSubmit}
          style={{
            width: "100%", fontSize: 17, padding: "17px 32px",
            animation: canSubmit && !isSubmitting ? "glow-pulse 2s ease-in-out infinite" : "none",
          }}
          onClick={handleSubmit}
        >
          ⚡ Build My Cart →
        </Button>

        <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 12, marginTop: 12 }}>
          Powered by Amazon Bedrock · Average Time to Cart: &lt;8 seconds
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <SituationPage />
    </ErrorBoundary>
  );
}
