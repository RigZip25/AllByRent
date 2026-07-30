import type { AppMessages } from "../types";

export const cs: AppMessages = {
  tagline: "Evoluce vlastnictví.",
  taglineShort: "Vaše garáž online.",
  modes: {
    earn: "Moje garáž",
    rent: "Procházet",
  },
  nav: {
    home: "Domů",
    stock: "Přidat",
    garage: "Garáž",
    more: "Více",
  },
  profile: {
    language: "Jazyk",
    languageAuto: "Automaticky (zařízení)",
    languageValue: (label) => label,
  },
  onboarding: {
    roleChoice: {
      title: "Co vás sem přivádí?",
      subtitle: "Nastavíme váš blok nebo garáž.",
      stockGarage: {
        title: "Naplnit garáž",
        subtitle:
          "Vystavte, co máte — půjčit, prodat nebo předat ze své vitríny.",
        cta: "Otevřít moji garáž →",
      },
      browseBlock: {
        title: "Procházet blok",
        subtitle: "Najděte vybavení, nářadí a nabídky v sousedských garážích.",
        cta: "Vybrat, kde hledat →",
      },
      footer: "Mezi Moje garáž a Procházet můžete přepínat kdykoli.",
    },
    location: {
      title: "Kde je váš blok?",
      subtitle: "Ukážeme garáže a police poblíž vás.",
      onBlock: {
        title: "Jsem na svém bloku",
        subtitle: "Použijte GPS nebo adresu — řazení podle vzdálenosti od domova.",
        cta: "Hledat poblíž →",
      },
      trip: {
        title: "Jsem v jiné oblasti",
        subtitle: "Vyberte město nebo čtvrť, kam jedete.",
        cta: "Vybrat destinaci →",
      },
    },
    tripDestination: {
      title: "Kam míříte?",
      subtitle: "Město nebo čtvrť, kde si vyzvednete věci z garáže",
      ctaWithCity: (city) => `Procházet garáže u ${city} →`,
      ctaDefault: "Pokračovat →",
    },
    allSet: {
      title: "Hotovo!",
      subtitle: "Vítejte v Evorios — evoluce vlastnictví.",
      exploreCta: "Jak chcete procházet →",
      stockGarageCta: "Naplnit garáž →",
    },
    browseHub: {
      title: "Co vás sem přivádí?",
      subtitle: "Běžné hledání nebo garážový výprodej.",
      findGear: {
        title: "Procházet blok",
        subtitle: "Hledat věci · Feed nebo Garáže",
        cta: "Začít procházet →",
      },
      yardSales: {
        title: "Garážové výprodeje",
        subtitle: "Beta — výprodeje a aukce ve vašem bloku",
        cta: "Výprodeje (Beta) →",
      },
      footer: "Půjčit a vystavit můžete kdykoli přes Přidat (+) nebo Moje garáž.",
    },
  },
};
