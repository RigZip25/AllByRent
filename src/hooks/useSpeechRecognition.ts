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

export function useSpeechRecognition(lang?: string) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => undefined);
  const intentionalStopRef = useRef(false);

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
    async (onFinal: (text: string) => void) => {
      onFinalRef.current = onFinal;
      setError(null);
      setInterim("");

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

      // Stop any prior session cleanly.
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
        if (interimText) setInterim(interimText.trim());
        const trimmed = finalText.trim();
        if (trimmed) {
          setInterim("");
          onFinalRef.current(trimmed);
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

      // Safari: keep start() inside the user-gesture turn (no await before it).
      // Chromium: request mic permission first so SpeechRecognition is not blocked silently.
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
