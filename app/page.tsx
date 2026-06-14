"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import type { ParsedIntent, UrgencyMode } from "@/lib/types";

const PLACEHOLDER_CYCLE = [
  "Guests are arriving in 30 minutes…",
  "Feeling sick, need medicines…",
  "Need pooja items before evening…",
  "Power cut, need emergency supplies…",
  "School project due tomorrow…",
  "Tea time! Need snacks…",
];

// ─── Low-confidence clarify modal ────────────────────────────────
interface ClarifyModalProps {
  intent: ParsedIntent;
  onConfirm: () => void;
  onRefine: () => void;
}

function ClarifyModal({ intent, onConfirm, onRefine }: ClarifyModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onRefine}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(6px)",
          zIndex: 60,
        }}
        aria-hidden
      />
      {/* Modal */}
      <div
        className="animate-slide-up"
        role="dialog"
        aria-label="Confirm your situation"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 70,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: "28px 24px 36px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🤔</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 8,
            }}
          >
            Just to confirm…
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
            We think you need help with{" "}
            <strong style={{ color: "var(--text-primary)" }}>{intent.scenarioLabel}</strong>, but
            we&apos;re only{" "}
            <span className="badge badge-amber" style={{ fontSize: 12 }}>
              {intent.confidence}% confident
            </span>
            . Does this sound right?
          </p>
          {intent.suggestedItems.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {intent.suggestedItems.slice(0, 4).map((item) => (
                <span key={item} className="badge badge-teal" style={{ fontSize: 11 }}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            id="clarify-refine-btn"
            className="btn-secondary"
            style={{ flex: 1 }}
            onClick={onRefine}
          >
            ✏️ Let me clarify
          </button>
          <button
            id="clarify-confirm-btn"
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={onConfirm}
          >
            ✅ Yes, build it!
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Offline warning banner ───────────────────────────────────────
function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "#D97706",
        color: "#fff",
        textAlign: "center",
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      📶 You&apos;re offline — check your connection before submitting
    </div>
  );
}

// ─── Main page (needs searchParams so wrapped in Suspense) ────────
function SituationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRefining = searchParams.get("refine") === "1";

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
  // Low-confidence clarify flow
  const [pendingIntent, setPendingIntent] = useState<ParsedIntent | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript, interimTranscript,
    isListening, isSupported,
    start, stop, reset: resetSpeech,
  } = useSpeechRecognition();

  // Reset store — but NOT if we came here via Refine (preserve the situation text)
  useEffect(() => {
    if (!isRefining) reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When refining, switch to type tab and focus textarea
  useEffect(() => {
    if (isRefining && situationText) {
      setActiveTab("type");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isRefining, situationText]);

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

  // Quick intent preview as user types (local keyword heuristic — not the actual AI)
  useEffect(() => {
    if (!situationText || situationText.length < 5) {
      setIntentPreview(null);
      setPreviewConfidence(0);
      return;
    }

    const timer = setTimeout(() => {
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

  // ─── Core submit logic (also used after clarify-confirm) ────────
  const proceedWithIntent = useCallback(
    async (intent: ParsedIntent) => {
      const cart = generateCart(intent, urgencyMode);
      setIntent(intent);
      setCart(cart);
      router.push("/cart");
    },
    [urgencyMode, setIntent, setCart, router]
  );

  // ─── Submit — calls Bedrock via /api/interpret ───────────────────
  const handleSubmit = useCallback(async () => {
    const input = situationText.trim();
    if (!input || input.length < 4) {
      setError("Please describe your situation in a few words");
      return;
    }

    setError(null);
    setPendingIntent(null);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const intent = await parseIntent(input, photoS3Key ?? undefined);

      // If confidence is low, show a clarifying question instead of proceeding
      if (intent.confidence < 65) {
        setPendingIntent(intent);
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }

      await proceedWithIntent(intent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      // Surface rate limit message clearly
      if (msg.includes("429") || msg.includes("Too many")) {
        setError("Too many requests — please wait a moment and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [situationText, photoS3Key, setIsLoading, proceedWithIntent]);

  const handleChipSelect = useCallback(
    (text: string) => {
      setSituationText(text);
      setPendingIntent(null);
      textareaRef.current?.focus();
    },
    [setSituationText]
  );

  const handleUrgencyChange = (mode: UrgencyMode) => setUrgencyMode(mode);

  const canSubmit = situationText.trim().length > 3 && !isSubmitting;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 pb-16 pt-8 relative overflow-hidden">
      <OfflineBanner />

      {/* Low-confidence clarify modal */}
      {pendingIntent && (
        <ClarifyModal
          intent={pendingIntent}
          onConfirm={async () => {
            setPendingIntent(null);
            setIsSubmitting(true);
            setIsLoading(true);
            await proceedWithIntent(pendingIntent);
            setIsSubmitting(false);
            setIsLoading(false);
          }}
          onRefine={() => {
            setPendingIntent(null);
            textareaRef.current?.focus();
          }}
        />
      )}

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,93,42,0.07) 0%, transparent 70%)", top: -200, left: -200, filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,153,187,0.06) 0%, transparent 70%)", bottom: -100, right: -100, filter: "blur(60px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 640, position: "relative", zIndex: 1 }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isRefining && (
              <span className="badge badge-amber">✏️ Refining</span>
            )}
            <span className="badge badge-teal">Beta</span>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }} className="animate-float-in">
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 14 }}>
            What is happening{" "}
            <span className="gradient-text">right now?</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Describe your situation — we&apos;ll build your cart in seconds.
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
                setSituationText(`Photo uploaded: ${filename.replace(/\.[^.]+$/, "")} — analyse and build my cart`);
                setActiveTab("type");
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
          <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Something went wrong</div>
              <div style={{ fontSize: 13 }}>{error}</div>
            </div>
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
          Powered by Amazon Bedrock · Text · Voice · Photo · Average TTC: &lt;8s
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <SituationPage />
      </Suspense>
    </ErrorBoundary>
  );
}
