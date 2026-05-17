import { useState } from "react";

import businessRentalsScreen from "./assets/onboarding/business-rentals.png";
import mrRentanoScreen from "./assets/onboarding/mr-rentano.png";
import rentalHubScreen from "./assets/onboarding/rental-hub.png";
import rentLocallyScreen from "./assets/onboarding/rent-locally.png";
import secureLocalFlexibleScreen from "./assets/onboarding/secure-local-flexible.png";

type OnboardingStep = {
  title: string;
  image?: string;
  primaryLabel?: string;
  hasSkip?: boolean;
  animatedSplash?: boolean;
};

const steps: OnboardingStep[] = [
  {
    title: "Welcome to All By Rent",
    primaryLabel: "Welcome to All By Rent",
    animatedSplash: true,
  },
  {
    title: "Rent locally",
    image: rentLocallyScreen,
    primaryLabel: "Next",
    hasSkip: true,
  },
  {
    title: "Get what you need. Profit from what you don't.",
    image: rentalHubScreen,
    primaryLabel: "Next",
    hasSkip: true,
  },
  {
    title: "Unlock Business Potential with Rentals",
    image: businessRentalsScreen,
    primaryLabel: "Next",
    hasSkip: true,
  },
  {
    title: "Secure. Local. Flexible.",
    image: secureLocalFlexibleScreen,
    primaryLabel: "Next",
    hasSkip: true,
  },
  {
    title: "Hi, I'm Mr. Rentano.",
    image: mrRentanoScreen,
    primaryLabel: "Explore Categories",
    hasSkip: true,
  },
];

const AnimatedSplash = () => (
  <div className="animated-splash" aria-label="Animated All By Rent splash">
    <div className="splash-blob splash-blob-left" />
    <div className="splash-blob splash-blob-right" />
    <div className="splash-blob splash-blob-bottom" />

    <div className="animated-logo-wrap">
      <svg className="animated-logo" viewBox="0 0 260 260" role="img" aria-labelledby="logo-title">
        <title id="logo-title">All By Rent logo assembling from colored parts</title>
        <g className="logo-piece logo-piece-blue-top">
          <rect
            x="92"
            y="14"
            width="76"
            height="76"
            rx="17"
            fill="#1689cf"
            transform="rotate(45 130 52)"
          />
        </g>
        <g className="logo-piece logo-piece-red">
          <rect
            x="39"
            y="67"
            width="76"
            height="76"
            rx="17"
            fill="#ef5546"
            transform="rotate(45 77 105)"
          />
        </g>
        <g className="logo-piece logo-piece-green">
          <rect
            x="145"
            y="67"
            width="76"
            height="76"
            rx="17"
            fill="#04a979"
            transform="rotate(45 183 105)"
          />
        </g>
        <g className="logo-piece logo-piece-blue-bottom">
          <rect
            x="92"
            y="120"
            width="76"
            height="76"
            rx="17"
            fill="#1689cf"
            transform="rotate(45 130 158)"
          />
        </g>
        <g className="logo-piece logo-piece-orange">
          <circle cx="219" cy="74" r="13" fill="#ff930f" />
          <path d="M189 103l27-27" stroke="#ff930f" strokeWidth="12" strokeLinecap="round" />
        </g>
        <g className="logo-smile">
          <circle cx="130" cy="105" r="36" fill="#ffffff" opacity=".94" />
          <path
            d="M112 112c10 14 27 17 40 6M116 96c4-8 12-13 22-13 17 0 31 13 31 31"
            fill="none"
            stroke="#20427a"
            strokeLinecap="round"
            strokeWidth="7"
          />
        </g>
      </svg>

      <div className="animated-brand">
        <span>ALLBYRENT</span>
        <small>Share. Rent. Live easier.</small>
      </div>
    </div>

    <div className="animated-copy">
      <h1>Welcome to All By Rent</h1>
      <p>Discover what&apos;s available around you</p>
    </div>

    <div className="animated-primary-button" aria-hidden="true">
      Welcome to All By Rent
    </div>
  </div>
);

const getInitialStep = () => {
  const stepFromUrl = Number(new URLSearchParams(window.location.search).get("step"));

  if (Number.isInteger(stepFromUrl) && stepFromUrl >= 0 && stepFromUrl < steps.length) {
    return stepFromUrl;
  }

  return 0;
};

export const App = () => {
  const [activeIndex, setActiveIndex] = useState(getInitialStep);
  const activeStep = steps[activeIndex];

  const goToNextStep = () => {
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1));
  };

  const skipToFinalStep = () => {
    setActiveIndex(steps.length - 1);
  };

  return (
    <main className="screen-shell" aria-label="All By Rent onboarding">
      <section className="phone-frame">
        {activeStep.animatedSplash ? (
          <AnimatedSplash />
        ) : (
          <img className="figma-screen" src={activeStep.image} alt={activeStep.title} />
        )}

        {activeStep.hasSkip ? (
          <button className="hotspot hotspot-skip" type="button" onClick={skipToFinalStep}>
            Skip
          </button>
        ) : null}

        <button className="hotspot hotspot-primary" type="button" onClick={goToNextStep}>
          {activeStep.primaryLabel}
        </button>

        <nav className="hotspot-dots" aria-label={`Step ${activeIndex + 1} of ${steps.length}`}>
          {steps.map((step, index) => (
            <button
              aria-label={`Go to ${step.title}`}
              className="hotspot-dot"
              key={step.title}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </nav>
      </section>
    </main>
  );
};
