import { useState } from "react";

import businessRentalsScreen from "./assets/onboarding/business-rentals.png";
import mrRentanoScreen from "./assets/onboarding/mr-rentano.png";
import rentalHubScreen from "./assets/onboarding/rental-hub.png";
import rentLocallyScreen from "./assets/onboarding/rent-locally.png";
import secureLocalFlexibleScreen from "./assets/onboarding/secure-local-flexible.png";
import welcomeScreen from "./assets/onboarding/welcome.png";

type OnboardingStep = {
  title: string;
  image: string;
  primaryLabel?: string;
  hasSkip?: boolean;
};

const steps: OnboardingStep[] = [
  {
    title: "Welcome to All By Rent",
    image: welcomeScreen,
    primaryLabel: "Welcome to All By Rent",
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
        <img className="figma-screen" src={activeStep.image} alt={activeStep.title} />

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
