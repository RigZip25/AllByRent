import { type ComponentType, useState } from "react";

type OnboardingStep = {
  title: string;
  description: string;
  buttonLabel?: string;
  variant: "welcome" | "local" | "hub" | "business" | "secure";
  Illustration: ComponentType;
};

const DecorativeShapes = () => (
  <>
    <div className="shape shape-blue" />
    <div className="shape shape-red" />
    <div className="shape shape-orange" />
  </>
);

const WelcomeIllustration = () => (
  <svg className="welcome-logo" viewBox="0 0 310 280" role="img" aria-labelledby="welcome-title">
    <title id="welcome-title">All By Rent logo</title>
    <g transform="translate(48 20)">
      <rect x="64" y="0" width="80" height="80" rx="17" fill="#0f8dd3" transform="rotate(45 104 40)" />
      <rect x="16" y="48" width="80" height="80" rx="17" fill="#eb5f4b" transform="rotate(45 56 88)" />
      <rect x="112" y="48" width="80" height="80" rx="17" fill="#00a77a" transform="rotate(45 152 88)" />
      <rect x="64" y="96" width="80" height="80" rx="17" fill="#0f8dd3" transform="rotate(45 104 136)" />
      <circle cx="196" cy="58" r="13" fill="#ff8f18" />
      <path d="M169 80l24-24" stroke="#ff8f18" strokeWidth="12" strokeLinecap="round" />
      <circle cx="104" cy="88" r="35" fill="#ffffff" opacity=".92" />
      <path
        d="M88 92c8 14 25 17 37 7M91 79c4-7 11-11 20-11 15 0 27 12 27 27"
        fill="none"
        stroke="#20427a"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </g>
    <text x="155" y="214" textAnchor="middle" fill="#2389c9" fontSize="34" fontWeight="800">
      ALLBYRENT
    </text>
    <text x="155" y="244" textAnchor="middle" fill="#1f67b2" fontSize="18" fontWeight="600">
      Rent. Live easier
    </text>
  </svg>
);

const LocalRentIllustration = () => (
  <svg
    className="onboarding-illustration local-illustration"
    viewBox="0 0 560 350"
    role="img"
    aria-labelledby="local-title"
  >
    <title id="local-title">People renting locally</title>
    <path d="M96 190l146-125 148 125v120H96z" fill="#fff1d7" />
    <path d="M225 82v-34h45v70" fill="#ffe0a6" />
    <rect x="246" y="164" width="130" height="93" rx="7" fill="#1e7cbc" />
    <rect x="260" y="177" width="104" height="66" rx="4" fill="#ffffff" opacity=".2" />
    <rect x="283" y="257" width="14" height="57" fill="#1e7cbc" />
    <path d="M238 314h104" stroke="#1e7cbc" strokeWidth="13" strokeLinecap="round" />
    <path d="M64 276h66l-18 62H49z" fill="#e34f5f" />
    <path d="M86 235c-30 3-46-21-46-21 32-8 53 3 63 31 3-34 27-51 27-51 14 36 7 61-21 76 35-21 67-7 67-7-25 36-57 40-90 18z" fill="#45aa78" />
    <g transform="translate(118 124)">
      <circle cx="53" cy="42" r="30" fill="#5c382d" />
      <path d="M14 136c7-58 22-88 57-88 36 0 53 32 62 88z" fill="#ffc247" />
      <path d="M58 70l64 29-12 29-67-26z" fill="#f59b22" />
      <path d="M0 95l74-30 11 30-68 35z" fill="#ffd56a" />
      <rect x="36" y="88" width="84" height="59" rx="6" fill="#203c70" transform="rotate(-14 78 118)" />
      <path d="M44 147h32l-2 86H33zM93 147h34l24 86h-43z" fill="#e98128" />
      <path d="M33 233h41M108 233h43" stroke="#203c70" strokeWidth="14" strokeLinecap="round" />
    </g>
    <g transform="translate(302 126)">
      <circle cx="49" cy="30" r="27" fill="#f6b34d" />
      <path d="M15 126c3-53 18-83 52-83 33 0 47 30 51 83z" fill="#ff9226" />
      <rect x="0" y="78" width="110" height="86" rx="8" fill="#2c8dca" />
      <rect x="13" y="91" width="84" height="58" rx="4" fill="#d8eef9" />
      <path d="M29 164h33v89H14zM76 164h34l27 89H93z" fill="#173b70" />
      <path d="M14 253h49M93 253h45" stroke="#173b70" strokeWidth="14" strokeLinecap="round" />
    </g>
    <g transform="translate(418 80)">
      <circle cx="54" cy="38" r="31" fill="#8c4b2f" />
      <path d="M28 68h58v128H28z" fill="#173b70" />
      <rect x="21" y="0" width="68" height="39" rx="18" fill="#1f7bb6" />
      <path d="M4 120h24v126H4zM86 120h25v126H86z" fill="#f39227" />
      <rect x="87" y="138" width="47" height="105" rx="23" fill="#ffcf59" />
      <rect x="91" y="96" width="20" height="155" rx="10" fill="#132b56" />
      <path d="M-8 246h49M72 246h62" stroke="#173b70" strokeWidth="14" strokeLinecap="round" />
    </g>
  </svg>
);

const RentalHubIllustration = () => (
  <svg
    className="onboarding-illustration rental-illustration"
    viewBox="0 0 620 360"
    role="img"
    aria-labelledby="rental-hub-title"
  >
    <title id="rental-hub-title">Rental hub illustration</title>
    <g className="sparkles" fill="#dcefee">
      <path d="M98 106h6v6h-6z" />
      <path d="M112 90h4v4h-4z" />
      <path d="M474 88h7v7h-7z" />
      <path d="M510 126h4v4h-4z" />
      <path d="M58 204h5v5h-5z" />
      <path d="M566 188h5v5h-5z" />
    </g>

    <g transform="translate(124 32)">
      <circle cx="42" cy="44" r="39" fill="#f1f2f7" />
      <circle cx="33" cy="36" r="34" fill="#ffffff" stroke="#4a4b86" strokeWidth="5" />
      <path d="M33 36V14" stroke="#4a4b86" strokeWidth="4" strokeLinecap="round" />
      <path d="M33 36l15 11" stroke="#ff8f27" strokeWidth="4" strokeLinecap="round" />
    </g>

    <g transform="translate(286 18)">
      <rect x="0" y="70" width="96" height="7" rx="3" fill="#ff8f27" />
      <path d="M30 15h38l13 56H17z" fill="#ffe3b4" />
      <rect x="46" y="70" width="6" height="37" fill="#7a5d48" />
      <rect x="30" y="103" width="37" height="8" rx="4" fill="#7a5d48" />
    </g>

    <g transform="translate(394 45)">
      <circle cx="31" cy="31" r="26" fill="#fff9e9" stroke="#f3b72d" strokeWidth="5" />
      <path d="M31 31V11" stroke="#30315f" strokeWidth="4" strokeLinecap="round" />
      <path d="M31 31l10 8" stroke="#30315f" strokeWidth="4" strokeLinecap="round" />
      <path d="M16 4l-8 10M45 4l8 10" stroke="#30315f" strokeWidth="5" strokeLinecap="round" />
      <rect x="23" y="56" width="16" height="8" rx="3" fill="#30315f" />
    </g>

    <g transform="translate(458 56)">
      <rect x="0" y="25" width="114" height="8" rx="4" fill="#ff8f27" />
      <path d="M24 17h68c12 0 23 8 27 19H0c4-12 12-19 24-19z" fill="#8fddd7" />
      <circle cx="30" cy="42" r="10" fill="#31436f" />
      <circle cx="91" cy="42" r="10" fill="#31436f" />
      <rect x="40" y="4" width="34" height="19" rx="4" fill="#bdf0ed" />
    </g>

    <g transform="translate(48 112)">
      <path d="M0 0l42-24L84 0v8H0z" fill="#ffffff" stroke="#504d94" strokeWidth="4" />
      <rect x="6" y="8" width="72" height="45" rx="4" fill="#ff8f4a" />
      <text x="42" y="39" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="800">
        RENT
      </text>
    </g>

    <g transform="translate(416 148)">
      <path d="M0 0l42-24L84 0v8H0z" fill="#ffffff" stroke="#504d94" strokeWidth="4" />
      <rect x="6" y="8" width="72" height="45" rx="4" fill="#ffffff" stroke="#d9d8ee" />
      <text x="42" y="39" textAnchor="middle" fill="#ff6f8d" fontSize="25" fontWeight="800">
        LEASE
      </text>
    </g>

    <g transform="translate(52 175)">
      <rect x="31" y="1" width="102" height="66" rx="4" fill="#33336f" />
      <path d="M39 10h86l-78 48h-8z" fill="#3f4286" opacity=".8" />
      <rect x="74" y="67" width="17" height="22" fill="#25275b" />
      <rect x="55" y="89" width="54" height="9" rx="4" fill="#25275b" />
      <rect x="12" y="112" width="130" height="133" rx="5" fill="#ec7c2d" />
      <path d="M12 154h130M12 196h130" stroke="#c65f20" strokeWidth="5" />
      <circle cx="78" cy="133" r="6" fill="#ffba64" />
      <circle cx="78" cy="176" r="6" fill="#ffba64" />
      <circle cx="78" cy="217" r="6" fill="#ffba64" />
      <rect x="0" y="245" width="154" height="11" rx="5" fill="#cf6727" />
    </g>

    <g transform="translate(188 248)">
      <rect x="0" y="41" width="219" height="12" rx="6" fill="#ce5674" />
      <rect x="20" y="0" width="178" height="64" rx="12" fill="#f07882" />
      <rect x="35" y="28" width="148" height="50" rx="6" fill="#ef6e7b" />
      <circle cx="96" cy="33" r="23" fill="#ffffff" />
      <path d="M96 10v46M73 33h46M80 17l32 32M112 17L80 49" stroke="#293970" strokeWidth="5" />
      <path d="M43 13h42v37H43z" fill="#ffe391" />
      <path d="M56 6c11 0 20 9 20 20H36c0-11 9-20 20-20z" fill="#5bc8d2" />
      <path d="M120 20h58l11 38H109z" fill="#ffae4e" />
      <path d="M130 20c0-22 47-22 47 0" fill="none" stroke="#30315f" strokeWidth="5" />
    </g>

    <g transform="translate(415 231)">
      <rect x="32" y="51" width="112" height="89" rx="5" fill="#ec8a30" />
      <path d="M32 51l36-28h112l-36 28z" fill="#ffac47" />
      <path d="M144 51l36-28v89l-36 28z" fill="#d87928" />
      <path d="M68 64l58 17" stroke="#fff0cd" strokeWidth="8" strokeLinecap="round" />
      <rect x="83" y="0" width="12" height="52" fill="#2e3b70" transform="rotate(60 89 26)" />
      <rect x="101" y="0" width="12" height="52" fill="#ff8f27" transform="rotate(68 107 26)" />
    </g>

    <g transform="translate(492 160)">
      <rect x="41" y="84" width="24" height="119" rx="12" fill="#80634b" />
      <rect x="12" y="68" width="82" height="29" rx="4" fill="#c77943" />
      <path d="M0 203l44-106h18l44 106" fill="none" stroke="#80634b" strokeWidth="7" />
      <path d="M33 38c-24-3-32-22-32-22 22-2 34 6 40 19 5-23 23-35 23-35 8 25 4 41-12 50 22-13 43-4 43-4-16 23-35 27-54 16z" fill="#78c76d" />
      <rect x="18" y="54" width="69" height="25" rx="6" fill="#d1814a" />
    </g>

    <g transform="translate(558 136)">
      <rect x="22" y="72" width="7" height="158" fill="#7a5d48" />
      <path d="M0 0h55l18 76H-18z" fill="#ffe4b7" />
      <path d="M24 230h7" stroke="#7a5d48" strokeWidth="18" strokeLinecap="round" />
    </g>

    <g transform="translate(0 312)">
      <path d="M0 0H620" stroke="#bab7dc" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 0h68M415 0h94" stroke="#ff8f27" strokeWidth="5" strokeLinecap="round" />
    </g>

    <text x="310" y="174" textAnchor="middle" fill="#31306f" fontSize="58" fontWeight="900">
      <tspan x="310">RENTAL</tspan>
      <tspan x="310" dy="58">
        HUB
      </tspan>
    </text>
  </svg>
);

const BusinessIllustration = () => (
  <svg
    className="onboarding-illustration business-illustration"
    viewBox="0 0 560 350"
    role="img"
    aria-labelledby="business-title"
  >
    <title id="business-title">Business rentals illustration</title>
    <path d="M70 288h430" stroke="#c9c7e9" strokeWidth="5" strokeLinecap="round" />
    <g transform="translate(66 56)">
      <rect x="0" y="72" width="126" height="145" rx="4" fill="#f18a24" />
      <path d="M0 72h126M0 118h126M0 164h126" stroke="#ffbd70" strokeWidth="6" />
      <path d="M20 72V26M63 72V0M106 72V26" stroke="#f18a24" strokeWidth="9" strokeLinecap="round" />
      <path d="M-18 32H144" stroke="#f18a24" strokeWidth="9" strokeLinecap="round" />
      <circle cx="64" cy="96" r="5" fill="#ffd28b" />
      <circle cx="64" cy="142" r="5" fill="#ffd28b" />
      <circle cx="64" cy="188" r="5" fill="#ffd28b" />
    </g>
    <g transform="translate(28 128)">
      <circle cx="48" cy="31" r="26" fill="#8a4a2f" />
      <rect x="23" y="62" width="55" height="117" rx="18" fill="#ff9226" />
      <path d="M19 83l-9 68M79 83l52-29" stroke="#ff9226" strokeWidth="18" strokeLinecap="round" />
      <path d="M78 155h37v95H74zM28 155h37l-19 95H10z" fill="#1f5f9c" />
      <path d="M8 250h39M74 250h42" stroke="#20345e" strokeWidth="13" strokeLinecap="round" />
    </g>
    <g transform="translate(234 73)">
      <rect x="0" y="72" width="182" height="118" rx="10" fill="#245f96" />
      <rect x="17" y="88" width="148" height="84" rx="5" fill="#e9f4fa" />
      <rect x="76" y="190" width="31" height="34" fill="#245f96" />
      <path d="M52 224h79" stroke="#245f96" strokeWidth="12" strokeLinecap="round" />
      <circle cx="55" cy="38" r="30" fill="#173b70" />
      <path d="M20 99c4-43 24-65 59-65 38 0 58 22 62 65z" fill="#173b70" />
      <path d="M51 107l-47 65M114 109l52 57" stroke="#173b70" strokeWidth="17" strokeLinecap="round" />
    </g>
    <g transform="translate(418 126)">
      <circle cx="45" cy="31" r="27" fill="#f8b04a" />
      <path d="M12 148c2-63 17-98 56-98 38 0 54 35 56 98z" fill="#3c8ed1" />
      <path d="M10 83l-50 40M122 83l47 44" stroke="#3c8ed1" strokeWidth="18" strokeLinecap="round" />
      <path d="M25 148h38v99H16zM74 148h38l24 99H94z" fill="#173b70" />
      <path d="M15 247h50M92 247h45" stroke="#173b70" strokeWidth="13" strokeLinecap="round" />
    </g>
  </svg>
);

const SecureIllustration = () => (
  <svg
    className="onboarding-illustration secure-illustration"
    viewBox="0 0 560 350"
    role="img"
    aria-labelledby="secure-title"
  >
    <title id="secure-title">Secure rental app illustration</title>
    <path d="M92 292h376" stroke="#c9c7e9" strokeWidth="5" strokeLinecap="round" />
    <g transform="translate(176 10)">
      <rect x="41" y="0" width="184" height="324" rx="24" fill="#183971" />
      <rect x="58" y="24" width="150" height="276" rx="14" fill="#ffffff" />
      <rect x="88" y="51" width="90" height="10" rx="5" fill="#bde3ff" />
      <circle cx="133" cy="100" r="42" fill="#5aa9ef" />
      <path d="M133 71c21 14 42 14 42 14 0 44-42 63-42 63s-42-19-42-63c0 0 21 0 42-14z" fill="#ffffff" />
      <path d="M116 102l13 13 25-31" fill="none" stroke="#0f4da1" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="84" y="169" width="98" height="15" rx="7" fill="#dfe6ee" />
      <rect x="84" y="201" width="98" height="15" rx="7" fill="#dfe6ee" />
      <rect x="99" y="237" width="68" height="44" rx="22" fill="#0f4da1" />
      <path d="M113 237v-19c0-18 12-31 30-31s30 13 30 31v19" fill="none" stroke="#ffb83d" strokeWidth="11" strokeLinecap="round" />
      <circle cx="133" cy="259" r="8" fill="#ffffff" />
    </g>
    <g transform="translate(36 128)">
      <rect x="0" y="48" width="96" height="88" rx="8" fill="#ec6c56" />
      <path d="M0 48l48-36 48 36" fill="#f9a23d" />
      <rect x="27" y="80" width="42" height="56" rx="6" fill="#ffffff" />
      <path d="M24 170h57" stroke="#19365f" strokeWidth="13" strokeLinecap="round" />
    </g>
    <g transform="translate(408 132)">
      <rect x="18" y="58" width="104" height="74" rx="8" fill="#8bdad6" />
      <path d="M38 58V42c0-29 64-29 64 0v16" fill="none" stroke="#0f4da1" strokeWidth="12" strokeLinecap="round" />
      <circle cx="70" cy="91" r="11" fill="#ffffff" />
      <path d="M70 99v21" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <path d="M32 170h83" stroke="#19365f" strokeWidth="13" strokeLinecap="round" />
    </g>
    <circle cx="96" cy="91" r="10" fill="#ff8f27" />
    <circle cx="458" cy="82" r="8" fill="#ff8f27" />
    <path d="M119 65l32-20M426 58l-33-22" stroke="#8bdad6" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const steps: OnboardingStep[] = [
  {
    title: "Welcome to All By Rent",
    description: "Rent, earn, and discover useful items available around you.",
    buttonLabel: "Start",
    variant: "welcome",
    Illustration: WelcomeIllustration,
  },
  {
    title: "Rent locally",
    description: "For Personal or Professional Use",
    variant: "local",
    Illustration: LocalRentIllustration,
  },
  {
    title: "Get what you need. Profit from what you don't.",
    description:
      "Easily find and rent anything from cars to homes to electronics. Explore a wide variety of items and make your rental experience seamless",
    variant: "hub",
    Illustration: RentalHubIllustration,
  },
  {
    title: "Unlock Business Potential with Rentals",
    description:
      "Leverage or rent out assets like commercial spaces, vehicles, or equipment to maximize revenue or cut costs",
    variant: "business",
    Illustration: BusinessIllustration,
  },
  {
    title: "Secure. Local. Flexible.",
    description: "Your items stay close. Verified rentals keep every exchange simple and protected.",
    buttonLabel: "Get Started",
    variant: "secure",
    Illustration: SecureIllustration,
  },
];

const getInitialStep = () => {
  const stepFromUrl = Number(new URLSearchParams(window.location.search).get("step"));

  if (Number.isInteger(stepFromUrl) && stepFromUrl >= 0 && stepFromUrl < steps.length) {
    return stepFromUrl;
  }

  return 0;
};

const OnboardingScreen = () => {
  const [activeIndex, setActiveIndex] = useState(getInitialStep);
  const activeStep = steps[activeIndex];
  const Illustration = activeStep.Illustration;

  const goToNextStep = () => {
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1));
  };

  const skipToFinalStep = () => {
    setActiveIndex(steps.length - 1);
  };

  return (
    <main className="screen-shell" aria-label="All By Rent onboarding">
      <section className={`phone-frame phone-frame-${activeStep.variant}`}>
      <DecorativeShapes />
      <button className="skip-button" type="button" onClick={skipToFinalStep}>
        Skip
      </button>

      <div className="content">
        <Illustration />
        <h1>{activeStep.title}</h1>
        <p>{activeStep.description}</p>
      </div>

      <div className="progress-dots" aria-label={`Step ${activeIndex + 1} of ${steps.length}`}>
        {steps.map((step, index) => (
          <button
            aria-label={`Go to ${step.title}`}
            className={index === activeIndex ? "progress-dot progress-dot-active" : "progress-dot"}
            key={step.title}
            onClick={() => setActiveIndex(index)}
            type="button"
          />
        ))}
      </div>

      <button className="next-button" type="button" onClick={goToNextStep}>
        {activeStep.buttonLabel ?? "Next"}
      </button>
    </section>
  </main>
  );
};

export const App = () => <OnboardingScreen />;
