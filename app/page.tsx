"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { parseIntent } from "@/lib/ai/intentParser";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Navbar } from "@/components/Navbar";
import { SituationChips } from "@/components/SituationChips";
import { ContextSignals } from "@/components/ContextSignals";
import { useContextSignals } from "@/hooks/useContextSignals";
import { VoiceCapture } from "@/components/VoiceCapture";
import { PhotoUpload } from "@/components/PhotoUpload";
import { UrgencyBar } from "@/components/UrgencyBar";
import { Button } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  QuestionIcon,
  PencilSimpleIcon,
  CheckCircleIcon,
  WifiSlashIcon,
  KeyboardIcon,
  MicrophoneIcon,
  CameraIcon,
  WarningCircleIcon,
  LightningIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import type { GeneratedCart, ParsedIntent, UrgencyMode } from "@/lib/types";
import { getOrderHistory } from "@/lib/orderHistory";

const PLACEHOLDER_CYCLE = [
  "Guests are arriving in 30 minutes…",
  "Feeling sick, need medicines…",
  "Need pooja items before evening…",
  "Power cut, need emergency supplies…",
  "School project due tomorrow…",
  "Tea time! Need snacks…",
];

// ─── (Order history helpers and drawer moved to Navbar component) ──

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
        {/* Low-confidence notice */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 16,
          padding: "6px 14px",
          background: "rgba(217, 119, 6, 0.08)",
          border: "1px solid rgba(217, 119, 6, 0.2)",
          borderRadius: 50,
          width: "fit-content",
          margin: "0 auto 16px",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--accent-amber)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          <span>⚠</span> AI confidence below 65% — please confirm
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <QuestionIcon size={44} weight="fill" color="var(--accent)" />
          </div>
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
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                What we think you need
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {intent.suggestedItems.slice(0, 4).map((item) => (
                  <span key={item} className="badge badge-teal" style={{ fontSize: 11 }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            id="clarify-refine-btn"
            className="btn-secondary"
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onClick={onRefine}
          >
            <PencilSimpleIcon size={14} weight="bold" /> Let me clarify
          </button>
          <button
            id="clarify-confirm-btn"
            className="btn-primary"
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onClick={onConfirm}
          >
            <CheckCircleIcon size={14} weight="fill" /> Yes, build it!
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <WifiSlashIcon size={16} weight="bold" /> You&apos;re offline — check your connection before submitting
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
    setIntent, setCart, setIsLoading, setSelectedSubstitutes,
    reset,
  } = useCartStore();

  const [activeTab, setActiveTab] = useState<"type" | "voice" | "photo">("type");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Low-confidence clarify flow
  const [pendingIntent, setPendingIntent] = useState<ParsedIntent | null>(null);
  const [pendingCart, setPendingCart] = useState<GeneratedCart | null>(null);
  const [pendingSelections, setPendingSelections] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript, interimTranscript,
    isListening, isSupported,
    start, stop, reset: resetSpeech,
  } = useSpeechRecognition();

  const {
    location, weather,
    status: contextStatus,
    error: contextError,
    request: requestContext,
    clear: clearContext,
    getSignals,
  } = useContextSignals();

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

  // ─── Core submit logic (also used after clarify-confirm) ────────
  const proceedWithIntent = useCallback(
    async (intent: ParsedIntent, cart: GeneratedCart, autoSelections: Record<string, string>) => {
      setIntent(intent);
      setCart(cart);
      setSelectedSubstitutes(autoSelections);
      router.push("/cart");
    },
    [setIntent, setCart, setSelectedSubstitutes, router]
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
    setPendingCart(null);
    setPendingSelections({});
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Pull up to 2 recent situationTexts from localStorage for Bedrock context
      const recentOrders = getOrderHistory()
        .slice(0, 2)
        .map((o) => o.situationText)
        .filter(Boolean);

      const { intent, cart, initialSelections } = await parseIntent(
        input,
        photoS3Key ?? undefined,
        recentOrders,
        getSignals()
      );

      // If confidence is low, show a clarifying question instead of proceeding
      if (intent.confidence < 65) {
        setPendingIntent(intent);
        setPendingCart(cart);
        setPendingSelections(initialSelections);
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }

      await proceedWithIntent(intent, cart, initialSelections);
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
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        position: "relative",
      }}
    >
      <OfflineBanner />
      {/* Navbar — full width, sticky */}
      <Navbar
        rightSlot={
          isRefining && (
            <span className="badge badge-amber" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <PencilSimpleIcon size={10} weight="bold" /> Refining
            </span>
          )
        }
      />

      {/* Low-confidence clarify modal */}
      {pendingIntent && (
        <ClarifyModal
          intent={pendingIntent}
          onConfirm={async () => {
            if (!pendingIntent || !pendingCart) return;
            setPendingIntent(null);
            setIsSubmitting(true);
            setIsLoading(true);
            await proceedWithIntent(pendingIntent, pendingCart, pendingSelections);
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

      {/* ── Scrollable content area — grows to fill space above fixed CTA ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 clamp(16px, 5vw, 80px)",
          paddingBottom: "max(100px, env(safe-area-inset-bottom, 0px) + 80px)",
        }}
      >

        {/* Hero — compact */}
        <div style={{ textAlign: "center", marginBottom: 16 }} className="animate-float-in">
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px, 5vw, 34px)", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 6 }}>
            What is happening{" "}
            <span className="gradient-text">right now?</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 420, margin: "0 auto", lineHeight: 1.5 }}>
            Describe your situation and we'll build the cart instantly.          </p>
        </div>

        {/* Input card */}
        <div className="glass-elevated animate-slide-up" style={{ padding: 16, marginBottom: 14 }}>

          {/* Tab bar */}
          <div className="tab-bar" style={{ marginBottom: 14 }}>
            {(["type", "voice", "photo"] as const).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                className={`tab-item${activeTab === t ? " active" : ""}`}
                onClick={() => {
                  setActiveTab(t);
                  if (t !== "voice" && isListening) stop();
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                {t === "type"
                  ? <><KeyboardIcon size={13} weight="bold" /> Type</>
                  : t === "voice"
                  ? <><MicrophoneIcon size={13} weight="bold" /> Voice</>
                  : <><CameraIcon size={13} weight="bold" /> Photo</>
                }
              </button>
            ))}
          </div>

          {/* Tab panels — fixed-height container keeps card size consistent */}
          <div style={{ height: 120, position: "relative", overflow: "hidden" }}>

            {/* Type tab */}
            {activeTab === "type" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <textarea
                  ref={textareaRef}
                  id="situation-text-input"
                  className="input-glass"
                  style={{ flex: 1, resize: "none", lineHeight: 1.5, fontSize: 15, minHeight: 0 }}
                  placeholder={placeholderText || "Type your situation here…"}
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                />
                {situationText.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4, gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {situationText.length > 10 && !isSubmitting && (
                        <>
                          <SparkleIcon size={11} weight="fill" color="var(--accent)" />
                          AI will analyse your situation when you submit
                        </>
                      )}
                    </span>
                    <span style={{ flexShrink: 0 }}>{situationText.length} chars · ⌘↵ to submit</span>
                  </div>
                )}
              </div>
            )}

            {/* Voice tab */}
            {activeTab === "voice" && (
              <div style={{ height: "100%", overflow: "auto" }}>
                <VoiceCapture
                  isListening={isListening}
                  isSupported={isSupported}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  onStart={start}
                  onStop={stop}
                  onReset={() => { resetSpeech(); setSituationText(""); }}
                />
              </div>
            )}

            {/* Photo tab */}
            {activeTab === "photo" && (
              <div style={{ height: "100%", overflow: "auto" }}>
                <PhotoUpload
                  onUploaded={(s3Key, _publicUrl, filename) => {
                    setPhotoS3Key(s3Key);
                    const cleanName = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
                    setSituationText(cleanName.length > 4 ? cleanName : "photo of my situation");
                    setActiveTab("type");
                  }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Situation chips + Context signals — side by side */}
        <div style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          {/* Chips — flex-grow so it fills available space */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <SituationChips activeText={situationText} onSelect={handleChipSelect} />
          </div>

          {/* Context signal cards — fixed column on the right */}
          <ContextSignals
            location={location}
            weather={weather}
            status={contextStatus}
            error={contextError}
            onRequest={requestContext}
            onClear={clearContext}
          />
        </div>

        {/* Urgency mode */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Delivery preference
          </div>
          <UrgencyBar value={urgencyMode} onChange={handleUrgencyChange} idPrefix="urgency" showDescription />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <WarningCircleIcon size={16} weight="fill" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 1 }}>Something went wrong</div>
              <div style={{ fontSize: 12 }}>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed CTA bar — always visible at bottom ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: "rgba(245,246,250,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border)",
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 5vw, 80px)", width: "100%" }}>
          <Button
            id="build-cart-btn"
            variant="primary"
            loading={isSubmitting}
            disabled={!canSubmit}
            style={{
              width: "100%", fontSize: 16, padding: "15px 32px",
              animation: canSubmit && !isSubmitting ? "glow-pulse 2s ease-in-out infinite" : "none",
            }}
            onClick={handleSubmit}
          >
            <LightningIcon size={15} weight="fill" style={{ display: "inline", verticalAlign: "middle" }} /> Build My Cart →
          </Button>
          <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 11, marginTop: 6 }}>
            Developed by Team RIDH
          </p>
        </div>
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
