import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { APP_NAME, MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";

/** Keep the hello short — users should not wait ~15s for a muted CTA. */
const INITIAL_DELAY_MS = 400;
const BUBBLE_GAP_MS = 900;
const TYPING_CHAR_MS = 18;

function FirstHelloRolesScene() {
  return (
    <div className="first-hello-scene" aria-label={`${APP_NAME} — neighborhood garage platform`}>
      <img
        src={onboardingAssets.garageRoles}
        alt=""
        className="first-hello-scene-hero"
        draggable={false}
      />
    </div>
  );
}

function ChatBubble({
  text,
  typing = false,
  showCursor = false,
}: {
  text: string;
  typing?: boolean;
  showCursor?: boolean;
}) {
  return (
    <div className="first-hello-bubble rounded-2xl border">
      <p className="first-hello-bubble-text text-left italic text-[#374151]">
        {typing ? (
          <span className="first-hello-typing-dots" aria-label="Typing">
            <span className="first-hello-typing-dot" />
            <span className="first-hello-typing-dot" />
            <span className="first-hello-typing-dot" />
          </span>
        ) : (
          <>
            {text}
            {showCursor ? <span className="first-hello-cursor">|</span> : null}
          </>
        )}
      </p>
    </div>
  );
}

export function FirstHello({
  onNext,
  onSkip,
  onBack,
}: {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
}) {
  const t = useMessages();
  const hello = t.onboarding.firstHello;
  const BUBBLES = useMemo(
    () => hello.bubbles.map((line) => line.replaceAll("{mascot}", MASCOT_NAME)),
    [hello.bubbles],
  );
  const [displayed, setDisplayed] = useState<{ index: number; text: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [showTypingDots, setShowTypingDots] = useState(false);
  const [chatComplete, setChatComplete] = useState(false);
  const hasStarted = useRef(false);
  const cancelledRef = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const clearTimersRef = useRef<(() => void) | null>(null);

  const scrollToLatest = useCallback(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  }, []);

  const finishBubble = useCallback((index: number, fullText: string) => {
    setDisplayed((prev) => {
      if (prev.some((row) => row.index === index)) return prev;
      return [...prev, { index, text: fullText }];
    });
    setActiveIndex(null);
    setTypedChars(0);
    setShowTypingDots(false);
    if (index === BUBBLES.length - 1) {
      setChatComplete(true);
    }
  }, [BUBBLES.length]);

  const skipAnimation = useCallback(() => {
    cancelledRef.current = true;
    clearTimersRef.current?.();
    setDisplayed(BUBBLES.map((text, index) => ({ index, text })));
    setActiveIndex(null);
    setTypedChars(0);
    setShowTypingDots(false);
    setChatComplete(true);
  }, [BUBBLES]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let bubbleIndex = 0;
    let charIndex = 0;
    let charInterval: ReturnType<typeof setInterval> | null = null;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const clearCharInterval = () => {
      if (charInterval) {
        clearInterval(charInterval);
        charInterval = null;
      }
    };

    const clearAll = () => {
      clearCharInterval();
      timeouts.forEach((id) => clearTimeout(id));
    };
    clearTimersRef.current = clearAll;

    const startBubble = (index: number) => {
      if (cancelledRef.current) return;
      setActiveIndex(index);
      setTypedChars(0);
      setShowTypingDots(true);
      charIndex = 0;

      const pauseBeforeType = setTimeout(() => {
        if (cancelledRef.current) return;
        setShowTypingDots(false);
        charInterval = setInterval(() => {
          if (cancelledRef.current) {
            clearCharInterval();
            return;
          }
          charIndex += 1;
          setTypedChars(charIndex);
          if (charIndex >= BUBBLES[index].length) {
            clearCharInterval();
            finishBubble(index, BUBBLES[index]);
            if (index < BUBBLES.length - 1) {
              const next = setTimeout(() => {
                bubbleIndex = index + 1;
                startBubble(bubbleIndex);
              }, BUBBLE_GAP_MS);
              timeouts.push(next);
            }
          }
        }, TYPING_CHAR_MS);
      }, 280);
      timeouts.push(pauseBeforeType);
    };

    const kickoff = setTimeout(() => startBubble(0), INITIAL_DELAY_MS);
    timeouts.push(kickoff);

    return () => {
      cancelledRef.current = true;
      clearAll();
    };
  }, [finishBubble, BUBBLES]);

  useEffect(() => {
    scrollToLatest();
  }, [displayed, activeIndex, typedChars, showTypingDots, scrollToLatest]);

  const activeText =
    activeIndex !== null ? BUBBLES[activeIndex].slice(0, typedChars) : "";

  return (
    <div className="screen relative mx-auto w-full max-w-[390px] bg-white">
      <OnboardingTopBar onSkip={onSkip} onBack={onBack} />
      <div className="first-hello-main">
        <div className="first-hello-top">
          <div className="first-hello-mascot">
            <img
              src={onboardingAssets.mrEvoriosFull}
              alt=""
              className="first-hello-mascot-avatar"
              draggable={false}
            />
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight" style={{ color: GREEN }}>
                {MASCOT_NAME}
              </p>
              <p className="text-sm text-gray-500">{t.taglineShort}</p>
            </div>
          </div>

          <div
            ref={chatRef}
            role={chatComplete ? undefined : "button"}
            tabIndex={chatComplete ? undefined : 0}
            className={`first-hello-chat ${chatComplete ? "" : "cursor-pointer"}`}
            onClick={chatComplete ? undefined : skipAnimation}
            onKeyDown={
              chatComplete
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      skipAnimation();
                    }
                  }
            }
            aria-label={chatComplete ? undefined : hello.skipHint}
          >
            <div className="first-hello-bubbles">
              {displayed.map(({ index, text }) => (
                <ChatBubble key={`msg-${index}`} text={text} />
              ))}
              {activeIndex !== null ? (
                <ChatBubble
                  key={`active-${activeIndex}`}
                  text={activeText}
                  typing={showTypingDots}
                  showCursor={!showTypingDots}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="first-hello-scene-dock">
          <FirstHelloRolesScene />
        </div>
      </div>

      <footer className="first-hello-footer">
        {!chatComplete ? (
          <button
            type="button"
            onClick={skipAnimation}
            className="mb-2 w-full text-center text-sm font-semibold text-gray-600"
          >
            {hello.skipHint}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          className="btn-primary first-hello-cta w-full text-white"
          style={{ backgroundColor: GREEN }}
        >
          {hello.cta}
        </button>
      </footer>
    </div>
  );
}
