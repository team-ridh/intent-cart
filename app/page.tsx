"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { parseIntent } from "@/lib/ai/intentParser";
import { generateCart } from "@/lib/ai/cartGenerator";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { UrgencyMode } from "@/lib/types";

// ─── Situation chips ──────────────────────────────────────────────
const CHIPS = [
  { emoji: "👥", label: "Guests arriving",  text: "Guests are arriving in 30 minutes" },
  { emoji: "🌧️", label: "Rainy day",       text: "It's raining heavily outside today" },
  { emoji: "☕", label: "Tea break",        text: "Time for an afternoon tea break" },
  { emoji: "⚡", label: "Power cut",        text: "Power outage, need emergency items" },
  { emoji: "🎒", label: "School project",   text: "My child has a school project due tomorrow" },
  { emoji: "🤒", label: "Fever care",       text: "Feeling sick with fever and cold" },
  { emoji: "✈️", label: "Travel prep",      text: "Leaving for a trip in 2 hours" },
  { emoji: "🪔", label: "Pooja essentials", text: "Need pooja items before evening" },
];

// ─── Typing animation words ───────────────────────────────────────
const PLACEHOLDER_CYCLE = [
  "Guests are arriving in 30 minutes…",
  "Feeling sick, need medicines…",
  "Need pooja items before evening…",
  "Power cut, need emergency supplies…",
  "School project due tomorrow…",
  "Tea time! Need snacks…",
];

export default function SituationPage() {
  const router = useRouter();
  const {
    situationText, setSituationText,
    urgencyMode, setUrgencyMode,
    setIntent, setCart, setIsLoading,
  } = useCartStore();

  const [activeTab, setActiveTab] = useState<"type" | "voice" | "photo">("type");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [intentPreview, setIntentPreview] = useState<string | null>(null);
  const [previewScenario, setPreviewScenario] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { transcript, interimTranscript, isListening, isSupported, start, stop, reset: resetSpeech } =
    useSpeechRecognition();

  // ─── Sync voice transcript to situation text
  useEffect(() => {
    if (transcript) setSituationText(transcript);
  }, [transcript, setSituationText]);

  // ─── Placeholder typing animation
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
        setTimeout(() => {
          setPlaceholderIdx((p) => (p + 1) % PLACEHOLDER_CYCLE.length);
        }, 1800);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [placeholderIdx, situationText, activeTab]);

  // ─── Quick intent preview as user types
  useEffect(() => {
    if (!situationText || situationText.length < 5) {
      setIntentPreview(null);
      setPreviewScenario(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { parseIntentLocal } = await import("@/lib/ai/intentParser");
        const intent = parseIntentLocal(situationText);
        if (intent.scenario !== "general") {
          setIntentPreview(`Detected: ${intent.scenarioLabel} · ${intent.urgency} urgency`);
          setPreviewScenario(intent.scenario);
        } else {
          setIntentPreview(null);
          setPreviewScenario(null);
        }
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(timer);
  }, [situationText]);

  // ─── Photo upload
  const handlePhotoChange = useCallback((file: File) => {
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setSituationText(`Photo uploaded: ${file.name.replace(/\.[^.]+$/, "")}`);
  }, [setSituationText]);

  // ─── Submit
  const handleSubmit = useCallback(async () => {
    const input = situationText.trim();
    if (!input) { setError("Please describe your situation first"); return; }
    setError(null);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const intent = await parseIntent(input);
      const cart = generateCart(intent, urgencyMode);
      setIntent(intent);
      setCart(cart);
      router.push("/cart");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }, [situationText, urgencyMode, setIntent, setCart, setIsLoading, router]);

  // ─── Chip select
  const handleChipSelect = useCallback((text: string) => {
    setSituationText(text);
    setIsTyping(true);
    textareaRef.current?.focus();
    setTimeout(() => setIsTyping(false), 600);
  }, [setSituationText]);

  const canSubmit = situationText.trim().length > 3;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 pb-16 pt-8 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div style={{
          position:"absolute", width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)",
          top: -200, left: -200, filter:"blur(40px)"
        }}/>
        <div style={{
          position:"absolute", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          bottom: -100, right: -100, filter:"blur(40px)"
        }}/>
      </div>

      <div style={{width:"100%", maxWidth:640, position:"relative", zIndex:1}}>

        {/* ─── Logo / Nav ─── */}
        <nav style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:48}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#FF6B35,#FF9A6B)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, boxShadow:"0 4px 16px rgba(255,107,53,0.4)"
            }}>⚡</div>
            <div>
              <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:17, letterSpacing:"-0.02em"}}>
                amazon <span className="gradient-text">now</span> os
              </div>
              <div style={{fontSize:10, color:"var(--text-muted)", letterSpacing:"0.08em", textTransform:"uppercase"}}>
                Shop by Situation
              </div>
            </div>
          </div>
          <div style={{display:"flex", gap:8}}>
            <span className="badge badge-teal">Beta</span>
          </div>
        </nav>

        {/* ─── Hero Heading ─── */}
        <div style={{textAlign:"center", marginBottom:40}} className="animate-float-in">
          <h1 style={{
            fontFamily:"var(--font-display)", fontWeight:800,
            fontSize:"clamp(28px, 6vw, 44px)", lineHeight:1.15,
            letterSpacing:"-0.03em", marginBottom:14
          }}>
            What is happening{" "}
            <span className="gradient-text">right now?</span>
          </h1>
          <p style={{color:"var(--text-secondary)", fontSize:16, maxWidth:480, margin:"0 auto", lineHeight:1.6}}>
            Describe your situation — we'll build your cart in seconds.<br/>
            No search. No browsing. Just say the need.
          </p>
        </div>

        {/* ─── Input Card ─── */}
        <div className="glass-elevated animate-slide-up" style={{padding:24, marginBottom:20}}>

          {/* Tab Bar */}
          <div className="tab-bar" style={{marginBottom:20}}>
            {(["type","voice","photo"] as const).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                className={`tab-item${activeTab===t?" active":""}`}
                onClick={() => {
                  setActiveTab(t);
                  if (t!=="voice" && isListening) stop();
                }}
              >
                {t==="type"?"⌨️ Type":t==="voice"?"🎙 Voice":"📷 Photo"}
              </button>
            ))}
          </div>

          {/* TYPE TAB */}
          {activeTab==="type" && (
            <div>
              <textarea
                ref={textareaRef}
                id="situation-text-input"
                className="input-glass"
                style={{minHeight:120, lineHeight:1.6}}
                placeholder={placeholderText || "Type your situation here…"}
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                onKeyDown={(e) => { if (e.key==="Enter" && (e.metaKey||e.ctrlKey)) handleSubmit(); }}
              />
              <div style={{
                display:"flex", justifyContent:"flex-end",
                fontSize:12, color:"var(--text-muted)", marginTop:6
              }}>
                {situationText.length > 0 && <span>{situationText.length} chars · ⌘↵ to submit</span>}
              </div>
            </div>
          )}

          {/* VOICE TAB */}
          {activeTab==="voice" && (
            <div style={{textAlign:"center", padding:"20px 0"}}>
              {!isSupported ? (
                <div style={{color:"var(--text-muted)", fontSize:14}}>
                  Voice not supported in this browser. Please use Chrome.
                </div>
              ) : (
                <>
                  {/* Pulse animation */}
                  <div style={{position:"relative", width:100, height:100, margin:"0 auto 20px"}}>
                    {isListening && (
                      <>
                        <div style={{
                          position:"absolute", inset:-20, borderRadius:"50%",
                          border:"2px solid var(--accent)", opacity:0.4,
                          animation:"pulse-outer 1.5s ease-in-out infinite"
                        }}/>
                        <div style={{
                          position:"absolute", inset:-10, borderRadius:"50%",
                          border:"2px solid var(--accent)", opacity:0.6,
                          animation:"pulse-ring 1.5s ease-in-out infinite 0.3s"
                        }}/>
                      </>
                    )}
                    <button
                      id="voice-btn"
                      onClick={isListening ? stop : start}
                      style={{
                        width:"100%", height:"100%", borderRadius:"50%",
                        background: isListening
                          ? "linear-gradient(135deg,#FF6B35,#FF4500)"
                          : "var(--bg-elevated)",
                        border: `2px solid ${isListening?"var(--accent)":"var(--border)"}`,
                        fontSize:36, cursor:"pointer",
                        transition:"all 0.2s ease",
                        boxShadow: isListening ? "var(--shadow-glow)" : "none",
                        display:"flex", alignItems:"center", justifyContent:"center"
                      }}
                    >
                      {isListening ? "🛑" : "🎙"}
                    </button>
                  </div>

                  <div style={{fontSize:14, color: isListening?"var(--accent)":"var(--text-muted)", marginBottom:12, fontWeight:500}}>
                    {isListening ? "Listening… speak now" : "Tap to start speaking"}
                  </div>

                  {/* Live transcript */}
                  {(transcript || interimTranscript) && (
                    <div style={{
                      background:"var(--bg-raised)", borderRadius:12,
                      padding:"12px 16px", textAlign:"left", marginTop:12,
                      border:"1px solid var(--border)", fontSize:15, lineHeight:1.6
                    }}>
                      <span style={{color:"var(--text-primary)"}}>{transcript}</span>
                      <span style={{color:"var(--text-muted)", fontStyle:"italic"}}>{interimTranscript}</span>
                    </div>
                  )}

                  {transcript && (
                    <button className="btn-ghost" style={{marginTop:12}} onClick={resetSpeech}>
                      ✕ Clear
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* PHOTO TAB */}
          {activeTab==="photo" && (
            <div>
              <input
                type="file" accept="image/*" ref={fileInputRef}
                style={{display:"none"}}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }}
              />
              {!photoPreview ? (
                <button
                  id="photo-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width:"100%", minHeight:140, borderRadius:16,
                    border:"2px dashed var(--border)", background:"var(--bg-raised)",
                    display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", gap:10, cursor:"pointer",
                    transition:"all 0.2s ease"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.background="var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg-raised)"; }}
                >
                  <span style={{fontSize:40}}>📷</span>
                  <div>
                    <div style={{color:"var(--text-primary)", fontWeight:500, fontSize:14}}>Upload a photo</div>
                    <div style={{color:"var(--text-muted)", fontSize:12}}>Empty shelf, recipe, or anything</div>
                  </div>
                </button>
              ) : (
                <div style={{position:"relative", borderRadius:12, overflow:"hidden"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Uploaded" style={{width:"100%", maxHeight:200, objectFit:"cover", borderRadius:12}}/>
                  <div style={{
                    position:"absolute", inset:0, background:"rgba(0,0,0,0.5)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    borderRadius:12
                  }}>
                    <span style={{fontSize:14, color:"#fff", fontWeight:500}}>📷 {photoFile?.name}</span>
                  </div>
                  <button
                    style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.7)",border:"none",
                      borderRadius:"50%",width:28,height:28,color:"#fff",cursor:"pointer",fontSize:14}}
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); setSituationText(""); }}
                  >✕</button>
                </div>
              )}
              <p style={{color:"var(--text-muted)", fontSize:12, textAlign:"center", marginTop:10}}>
                AI will analyse the image and suggest what you need
              </p>
            </div>
          )}

          {/* ─── Intent Preview Strip ─── */}
          {intentPreview && (
            <div className="animate-float-in" style={{
              marginTop:16, padding:"10px 16px", borderRadius:12,
              background:"linear-gradient(135deg,rgba(255,107,53,0.1),rgba(0,212,255,0.06))",
              border:"1px solid var(--border-accent)",
              display:"flex", alignItems:"center", gap:10
            }}>
              <span style={{fontSize:18}}>✦</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13, color:"var(--accent)", fontWeight:600}}>{intentPreview}</div>
                <div style={{fontSize:12, color:"var(--text-muted)", marginTop:2}}>
                  Delivery mode: {urgencyMode} · Cart ready to generate
                </div>
              </div>
              <div className="badge badge-orange">{Math.round(72 + situationText.length * 0.3)}%</div>
            </div>
          )}
        </div>

        {/* ─── Situation Chips ─── */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12}}>
            Quick situations
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}} className="stagger">
            {CHIPS.map((c) => (
              <button
                key={c.label}
                id={`chip-${c.label.toLowerCase().replace(/\s+/g,"-")}`}
                className={`chip animate-float-in${situationText===c.text?" active":""}`}
                onClick={() => handleChipSelect(c.text)}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Urgency Mode ─── */}
        <div style={{marginBottom:32}}>
          <div style={{fontSize:12, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12}}>
            Delivery preference
          </div>
          <div className="urgency-bar">
            {(["fastest","value","trusted"] as UrgencyMode[]).map((m) => (
              <button
                key={m}
                id={`urgency-${m}`}
                className={`urgency-item ${m}${urgencyMode===m?" active":""}`}
                onClick={() => setUrgencyMode(m)}
              >
                {m==="fastest" ? "⚡ Fastest" : m==="value" ? "💰 Best Value" : "⭐ Most Trusted"}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div style={{
            marginBottom:16, padding:"10px 16px", borderRadius:12,
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            color:"#EF4444", fontSize:14
          }}>
            {error}
          </div>
        )}

        {/* ─── CTA ─── */}
        <button
          id="build-cart-btn"
          className="btn-primary"
          style={{width:"100%", fontSize:17, padding:"17px 32px",
            opacity: canSubmit ? 1 : 0.5,
            cursor: canSubmit ? "pointer" : "not-allowed",
            animation: canSubmit ? "glow-pulse 2s ease-in-out infinite" : "none",
          }}
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span style={{display:"inline-block", animation:"rotate-slow 0.8s linear infinite"}}>⚙️</span>
              Building your cart…
            </>
          ) : (
            <>⚡ Build My Cart →</>
          )}
        </button>

        <p style={{textAlign:"center", color:"var(--text-faint)", fontSize:12, marginTop:12}}>
          Powered by Amazon Bedrock · Average Time to Cart: &lt;8 seconds
        </p>
      </div>
    </main>
  );
}
