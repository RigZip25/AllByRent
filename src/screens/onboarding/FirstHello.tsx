import { useState, useEffect, useRef, useCallback } from "react";
import { APP_NAME, MASCOT_NAME, ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";

const GREEN = "#0D5C3A";

const INITIAL_DELAY_MS = 900;
const BUBBLE_GAP_MS = 2600;
const TYPING_CHAR_MS = 34;

const BUBBLES = [
  ONBOARDING.firstHello.bubbles[0](MASCOT_NAME),
  ONBOARDING.firstHello.bubbles[1],
  ONBOARDING.firstHello.bubbles[2],
];

function FirstHelloRolesScene() {
  return (
    <div className="first-hello-scene" aria-label={`${APP_NAME} on the block`}>
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
  const [displayed, setDisplayed] = useState<{ index: number; text: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [showTypingDots, setShowTypingDots] = useState(false);
  const [chatComplete, setChatComplete] = useState(false);
  const hasStarted = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToLatest = useCallback(() => {
    const chat = chatRef.current;
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  }, []);

  const finishBubble = useCallback((index: number, fullText: string) => {
    setDisplayed((prev) => [...prev, { index, text: fullText }]);
    setActiveIndex(null);
    setTypedChars(0);
    setShowTypingDots(false);
    if (index === BUBBLES.length - 1) {
      setChatComplete(true);
    }
  }, []);

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

    const startBubble = (index: number) => {
      setActiveIndex(index);
      setTypedChars(0);
      setShowTypingDots(true);
      charIndex = 0;

      const pauseBeforeType = setTimeout(() => {
        setShowTypingDots(false);
        charInterval = setInterval(() => {
          charIndex += 1;
          setTypedChars(charIndex);
          if (charIndex >= BUBBLES[index].length) {
            clearCharInterval();
            finishBubble(index, BUBBLES[index]);
            bubbleIndex += 1;
            if (bubbleIndex < BUBBLES.length) {
              const nextTimeout = setTimeout(() => startBubble(bubbleIndex), BUBBLE_GAP_MS);
              timeouts.push(nextTimeout);
            }
          }
        }, TYPING_CHAR_MS);
      }, 500);
      timeouts.push(pauseBeforeType);
    };

    const startTimeout = setTimeout(() => startBubble(0), INITIAL_DELAY_MS);
    timeouts.push(startTimeout);

    return () => {
      clearCharInterval();
      timeouts.forEach(clearTimeout);
    };
  }, [finishBubble]);

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
              <p className="text-sm text-gray-500">{ONBOARDING.firstHello.mascotRole}</p>
            </div>
          </div>

          <div ref={chatRef} className="first-hello-chat">
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
        <button
          type="button"
          disabled={!chatComplete}
          onClick={onNext}
          className="btn-primary first-hello-cta w-full text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: GREEN }}
        >
          Let&apos;s go →
        </button>
      </footer>
    </div>
  );
}
