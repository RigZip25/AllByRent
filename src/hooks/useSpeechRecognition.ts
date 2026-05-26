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

export function useSpeechRecognition(lang?: string) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supported = getSpeechRecognitionCtor() != null;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Voice input is not supported in this browser.");
        return;
      }

      setError(null);
      setInterim("");

      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = lang ?? navigator.language ?? "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const chunk = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            finalText += chunk;
          } else {
            interimText += chunk;
          }
        }
        if (interimText) setInterim(interimText.trim());
        if (finalText.trim()) {
          onFinal(finalText.trim());
          setInterim("");
        }
      };

      recognition.onerror = () => {
        setError("Could not hear you. Try again or type your question.");
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        setInterim("");
      };

      try {
        recognition.start();
        setListening(true);
      } catch {
        setError("Microphone is busy or blocked.");
        setListening(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, interim, error, start, stop };
}
