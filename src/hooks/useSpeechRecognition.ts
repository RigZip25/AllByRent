import { useCallback, useEffect, useRef, useState } from "react";

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

async function ensureMicrophonePermission(): Promise<"granted" | "denied" | "unavailable"> {
  if (typeof window === "undefined") return "unavailable";
  if (!window.isSecureContext) return "denied";
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      return "denied";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "denied";
    }
    return "unavailable";
  }
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
  const intentionalStopRef = useRef(false);
  const lastInterimRef = useRef("");
  const deliveredFinalRef = useRef(false);

  const supported =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    getSpeechRecognitionCtor() != null;

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
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
      // Back-compat: older callers passed only onFinal(text).
      handlersRef.current =
        typeof handlers === "function" ? { onDraft: handlers } : handlers;
      setError(null);
      setInterim("");
      lastInterimRef.current = "";
      deliveredFinalRef.current = false;

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

      intentionalStopRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      intentionalStopRef.current = false;

      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = lang?.trim() || navigator.language || "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const chunk = event.results[i]?.[0]?.transcript ?? "";
          if (event.results[i]?.isFinal) {
            finalText += chunk;
          } else {
            interimText += chunk;
          }
        }

        if (interimText) {
          const trimmed = interimText.trim();
          lastInterimRef.current = trimmed;
          setInterim(trimmed);
          handlersRef.current.onInterim?.(trimmed);
        }

        const trimmedFinal = finalText.trim();
        if (trimmedFinal) {
          deliveredFinalRef.current = true;
          lastInterimRef.current = "";
          setInterim("");
          handlersRef.current.onDraft(trimmedFinal);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (intentionalStopRef.current || event.error === "aborted") {
          setListening(false);
          return;
        }
        const message = messageForSpeechError(event.error);
        if (message) setError(message);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        // User stopped early, or engine ended without a final chunk — keep best draft.
        if (!deliveredFinalRef.current) {
          const leftover = lastInterimRef.current.trim();
          if (leftover) handlersRef.current.onDraft(leftover);
        }
        lastInterimRef.current = "";
        setInterim("");
        intentionalStopRef.current = false;
      };

      const begin = () => {
        try {
          recognition.start();
          setListening(true);
        } catch {
          setError("Microphone is busy. Tap the mic once and try again.");
          setListening(false);
        }
      };

      if (isLikelySafari()) {
        begin();
        void ensureMicrophonePermission().then((status) => {
          if (status === "denied") {
            setError("Microphone permission is blocked. Allow mic in Settings, then try again.");
            intentionalStopRef.current = true;
            try {
              recognition.abort();
            } catch {
              /* ignore */
            }
            setListening(false);
          }
        });
        return;
      }

      const micStatus = await ensureMicrophonePermission();
      if (micStatus === "denied") {
        setError("Microphone permission is blocked. Allow mic for this site, then try again.");
        return;
      }
      begin();
    },
    [lang],
  );

  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { supported, listening, interim, error, start, stop };
}
