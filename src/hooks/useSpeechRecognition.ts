import { useCallback, useEffect, useRef, useState } from "react";
import { resolveSpeechRecognitionLang } from "../lib/i18n";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function isLikelySafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|Android/i.test(ua);
}

function messageForSpeechError(code: string): string | null {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission is blocked. Allow mic for this site in browser settings, then try again.";
    case "audio-capture":
      return "No microphone found, or another app is using it.";
    case "network":
      return "Speech service needs a network connection. Check your connection and try again.";
    case "no-speech":
      return "Didn't catch that — tap the mic and speak again.";
    case "aborted":
      return null;
    default:
      return "Could not hear you. Try again or type your question.";
  }
}

/**
 * Soft permission check only — do NOT open getUserMedia here.
 * Opening (then stopping) a mic stream before SpeechRecognition often
 * leaves Chrome/Safari “listening” with no transcripts.
 */
async function probeMicrophonePermission(): Promise<"granted" | "denied" | "prompt" | "unavailable"> {
  if (typeof window === "undefined") return "unavailable";
  if (!window.isSecureContext) return "denied";

  try {
    const perms = navigator.permissions;
    if (perms?.query) {
      const status = await perms.query({ name: "microphone" as PermissionName });
      if (status.state === "denied") return "denied";
      if (status.state === "granted") return "granted";
      return "prompt";
    }
  } catch {
    /* Chromium may reject microphone PermissionName in some builds */
  }

  return "prompt";
}

export type SpeechDraftHandlers = {
  /** Live partial transcript while the user is speaking. */
  onInterim?: (text: string) => void;
  /** Final (or best-effort) transcript — put in the input for edit, do not auto-send. */
  onDraft: (text: string) => void;
};

export function useSpeechRecognition(lang?: string) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const handlersRef = useRef<SpeechDraftHandlers>({ onDraft: () => undefined });
  /** User asked us to stop (or unmount) — do not auto-restart. */
  const intentionalStopRef = useRef(false);
  /** Session should keep listening (continuous dictation until mic tap). */
  const wantListeningRef = useRef(false);
  const committedRef = useRef("");
  const lastInterimRef = useRef("");
  const langRef = useRef(lang);
  langRef.current = lang;

  const supported =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    getSpeechRecognitionCtor() != null;

  const deliverDraft = useCallback(() => {
    const text = (committedRef.current || lastInterimRef.current).trim();
    if (text) handlersRef.current.onDraft(text);
    committedRef.current = "";
    lastInterimRef.current = "";
    setInterim("");
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    wantListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
  }, []);

  const start = useCallback(
    async (handlers: SpeechDraftHandlers | ((text: string) => void)) => {
      handlersRef.current =
        typeof handlers === "function" ? { onDraft: handlers } : handlers;
      setError(null);
      setInterim("");
      committedRef.current = "";
      lastInterimRef.current = "";

      if (typeof window === "undefined" || !window.isSecureContext) {
        setError("Voice needs HTTPS. Open app.evorios.com (or localhost in dev).");
        return;
      }

      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError(
          isLikelySafari()
            ? "Voice typing isn’t available in this browser yet. Type your question instead."
            : "Voice input is not supported in this browser. Try Chrome or Edge.",
        );
        return;
      }

      const micStatus = await probeMicrophonePermission();
      if (micStatus === "denied") {
        setError("Microphone permission is blocked. Allow mic for this site, then try again.");
        return;
      }

      // Tear down any prior session before starting a new one.
      intentionalStopRef.current = true;
      wantListeningRef.current = false;
      const previous = recognitionRef.current;
      if (previous) {
        previous.onstart = null;
        previous.onresult = null;
        previous.onerror = null;
        previous.onend = null;
        try {
          previous.abort();
        } catch {
          /* ignore */
        }
      }
      recognitionRef.current = null;

      intentionalStopRef.current = false;
      wantListeningRef.current = true;

      const recognition = new Ctor();
      recognitionRef.current = recognition;
      const resolved =
        langRef.current?.trim() ||
        resolveSpeechRecognitionLang() ||
        "en-US";
      recognition.lang = resolved;
      recognition.interimResults = true;
      // Keep listening until the user taps stop — otherwise the engine often
      // ends before any transcript arrives (looks like “mic on, nothing happens”).
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (wantListeningRef.current) setListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const chunk = result?.[0]?.transcript ?? "";
          if (!chunk) continue;
          if (result.isFinal) {
            committedRef.current = `${committedRef.current} ${chunk}`.trim();
          } else {
            interimText += chunk;
          }
        }

        const display = `${committedRef.current} ${interimText}`.trim();
        if (interimText) lastInterimRef.current = interimText.trim();
        if (committedRef.current) lastInterimRef.current = committedRef.current;

        if (display) {
          setInterim(display);
          handlersRef.current.onInterim?.(display);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (intentionalStopRef.current || event.error === "aborted") {
          setListening(false);
          return;
        }
        // With continuous mode, no-speech can fire between phrases — ignore while still active.
        if (event.error === "no-speech" && wantListeningRef.current) {
          return;
        }
        const message = messageForSpeechError(event.error);
        if (message) setError(message);
        wantListeningRef.current = false;
        setListening(false);
      };

      recognition.onend = () => {
        // Browser often ends the session mid-dictation; restart while user still wants mic.
        if (wantListeningRef.current && !intentionalStopRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            /* fall through — deliver whatever we have */
          }
        }

        setListening(false);
        deliverDraft();
        intentionalStopRef.current = false;
        wantListeningRef.current = false;
      };

      try {
        recognition.start();
        setListening(true);
      } catch {
        wantListeningRef.current = false;
        setError("Microphone is busy. Tap the mic once and try again.");
        setListening(false);
      }
    },
    [deliverDraft],
  );

  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      wantListeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { supported, listening, interim, error, start, stop };
}
