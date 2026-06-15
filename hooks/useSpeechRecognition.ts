"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

interface SpeechRecognitionState {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance>(null);
  // Mirror isListening in a ref so callbacks never capture a stale value
  const isListeningRef = useRef(false);

  const setListening = (val: boolean) => {
    isListeningRef.current = val;
    setIsListening(val);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionAPI =
      (typeof window !== "undefined" &&
        (w.SpeechRecognition || w.webkitSpeechRecognition)) ||
      null;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) setTranscript((prev) => (prev + " " + final).trim());
      setInterimTranscript(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return;
      setError(`Voice error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    setError(null);
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setError("Could not start voice recognition");
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.abort();
    }
    setTranscript("");
    setInterimTranscript("");
    setListening(false);
    setError(null);
  }, []);

  return { transcript, interimTranscript, isListening, isSupported, error, start, stop, reset };
}
