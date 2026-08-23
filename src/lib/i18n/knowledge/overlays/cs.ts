import type { CategoryFactsOverlay } from "../types";

/** CS FactCard overlay — missing shelves inherit canonical EN via resolveCategoryFacts.
 *  Only Vehicles (+ commercial) host translations kept; other shelves deleted so cleaned EN shows through.
 */
export const categoryFactsCsOverlay: CategoryFactsOverlay = {
  expand: "Zjistit více",
  collapse: "Skrýt detaily",
  byCategory: {
    Vehicles: {
      title: "FAQ půjčení osobního / lehkého auta",
      summary: "Krátké odpovědi pro auta a lehké náklaďáky pod komerční hmotností.",
      qa: [
        { q: "Potřebuji CDL?", a: "Ne u lehkých osobních aut pod 26 001 lb GVWR, pokud místní zákon nestanoví jinak." },
        { q: "Jaké pojištění potřebuji?", a: "Platné osobní auto pojištění na toto auto. Nahrajte doklad v aplikaci před odemčením PIN nebo klíčů." },
        { q: "Jak funguje storno?", a: "Storno ≥24 h před startem: plná refundace. Do 24 h: 50 %." },
        { q: "Palivo a pozdní návrat?", a: "Palivo plná→plná (+$20 při nedodání). Pozdní návrat: 30 min grace, pak $20 + $15/h." },
        { q: "Proč GPS pro PIN?", a: "PIN se odemkne jen na místě vyzvednutí (nebo přes QR na autě)—ne přeposlaný kód." },
        { q: "Jaké fotky jsou povinné?", a: "Předprohlídka karoserie + čtyři pneumatiky před startem; stejná sada při vrácení." },
      ],
    },
    VehiclesCommercial: {
      title: "FAQ komerční dopravy (≥26 001 lb / semi)",
      summary: "Krátké odpovědi pro těžké komerční náklaďáky a semi.",
      qa: [
        { q: "Potřebuji CDL?", a: "Ano, pokud je GVWR 26 001 lb nebo více (nebo jak vyžaduje místní zákon)." },
        { q: "Jakou hmotnost zadávám?", a: "GVWR v librách—ne hodnotu v dolarech." },
        { q: "Jak funguje doklad pojištění?", a: "Agent nájemce pošle doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů." },
        { q: "Je povinné physical damage (PD)?", a: "Ano. Limity PD vycházejí z GVWR (lb); hold depozitu sleduje komerční spoluúčast / PD." },
        { q: "Jaká prohlídka je povinná?", a: "Komerční předprohlídka všech kol před startem; stejná sada při vrácení." },
        { q: "Proč GPS pro PIN?", a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód." },
      ],
    },
  },
  bySubcategory: {
    Vehicles: {
      "Cars & Trucks": {
        title: "FAQ půjčení osobního / lehkého auta",
        summary: "Krátké odpovědi pro auta a lehké náklaďáky pod komerční hmotností.",
        qa: [
          { q: "Potřebuji CDL?", a: "Ne u lehkých osobních aut pod 26 001 lb GVWR, pokud místní zákon nestanoví jinak." },
          { q: "Jaké pojištění potřebuji?", a: "Platné osobní auto pojištění na toto auto. Nahrajte doklad v aplikaci před odemčením PIN nebo klíčů." },
          { q: "Jak funguje storno?", a: "Storno ≥24 h před startem: plná refundace. Do 24 h: 50 %." },
          { q: "Palivo a pozdní návrat?", a: "Palivo plná→plná (+$20 při nedodání). Pozdní návrat: 30 min grace, pak $20 + $15/h." },
          { q: "Proč GPS pro PIN?", a: "PIN se odemkne jen na místě vyzvednutí (nebo přes QR na autě)—ne přeposlaný kód." },
          { q: "Jaké fotky jsou povinné?", a: "Předprohlídka karoserie + čtyři pneumatiky před startem; stejná sada při vrácení." },
        ],
      },
      Motorcycles: {
        title: "FAQ půjčení motocyklů",
        summary: "Krátké odpovědi pro motocykly.",
        qa: [
          { q: "Potřebuji motocyklovou doložku / endorsement?", a: "Ano. Potvrďte platnou motocyklovou doložku (nebo místní ekvivalent) pro jmenovaného jezdce." },
          { q: "Stačí běžný řidičák na auto?", a: "Ne, pokud tento inzerát vyžaduje motocyklovou doložku." },
          { q: "Jaké pojištění potřebuji?", a: "Doklad kryjící tuto motorku, nahraný v aplikaci před odemčením PIN nebo klíčů." },
          { q: "Helma?", a: "Dodržte místní zákon a politiku helem v inzerátu." },
          { q: "Jaké fotky jsou povinné?", a: "Předprohlídka karoserie a pneumatik před startem; stejná sada při vrácení." },
        ],
      },
      ATVs: {
        title: "FAQ půjčení ATV / OHV",
        summary: "Krátké odpovědi pro ATV a OHV.",
        qa: [
          { q: "Je povinné prohlášení o terénu?", a: "Ano ve výchozím nastavení—potvrďte riziko terénu OHV / ATV při rezervaci před odemčením vyzvednutí." },
          { q: "Jaký řidičák potřebuji?", a: "Platný průkaz nebo povolení dle místního OHV zákona a inzerátu." },
          { q: "Jaké pojištění potřebuji?", a: "Doklad kryjící toto ATV, nahraný před odemčením PIN nebo klíčů." },
          { q: "Helma / výbava?", a: "Dodržte místní zákon a pravidla helem / výbavy v inzerátu." },
          { q: "Jaké fotky jsou povinné?", a: "Předprohlídka karoserie a pneumatik před startem; stejná sada při vrácení." },
        ],
      },
      "Tow Vehicles": {
        title: "FAQ půjčení odtahových vozidel",
        summary: "Krátké odpovědi pro odtahy a tow vehicles.",
        qa: [
          { q: "Potřebuji CDL?", a: "Ano, když je GVWR nebo kombinovaná hmotnost 26 001 lb nebo více (nebo jak vyžaduje místní zákon)." },
          { q: "Co dalšího je povinné?", a: "Platné tow oprávnění dle inzerátu a komerční pojištění agent→majitel, pokud to tato police vyžaduje." },
          { q: "Nosnost odtahu?", a: "Zůstaňte v publikovaném tow ratingu a třídě tažného zařízení v inzerátu." },
          { q: "Jaká prohlídka je povinná?", a: "Karoserie a více pneumatik před startem; stejná sada při vrácení." },
          { q: "Proč GPS pro PIN?", a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód." },
        ],
      },
      Trailers: {
        title: "FAQ půjčení přívěsů",
        summary: "Krátké odpovědi pro lehké / utility přívěsy pod komerční hmotností.",
        qa: [
          { q: "Potřebuji CDL?", a: "Obvykle ne pod 26 001 lb GVWR—zkontrolujte místní zákon, třídu tažného zařízení a brzdy." },
          { q: "Tažné zařízení a světla?", a: "Shoda třídy hitch; při předání ověřte světla a brzdy." },
          { q: "Jaké pojištění potřebuji?", a: "Krytí přívěsu dle inzerátu; nahrajte doklad před předáním." },
          { q: "Limity nákladu?", a: "Nepřekračujte publikované GVWR ani payload." },
          { q: "Jaké fotky jsou povinné?", a: "Rám, spojka, pneumatiky a světla při předprohlídce; stejná sada při vrácení." },
        ],
      },
      "Equipment Trailers": {
        title: "FAQ půjčení equipment přívěsů",
        summary: "Krátké odpovědi pro komerční / equipment přívěsy.",
        qa: [
          { q: "Potřebuji CDL?", a: "Ano, když je GVWR nebo kombinovaná hmotnost 26 001 lb nebo více (nebo jak vyžaduje komerční přeprava)." },
          { q: "Jak funguje doklad pojištění?", a: "Agent pošle komerční / PD doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů." },
          { q: "Limity nákladu?", a: "Nepřekračujte publikované GVWR ani payload." },
          { q: "Jaká prohlídka je povinná?", a: "Fotky rámu a všech kol před startem; stejná sada při vrácení." },
          { q: "Proč GPS pro PIN?", a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód." },
        ],
      },
      "Commercial Trucks": {
        title: "FAQ půjčení komerčních náklaďáků",
        summary: "Krátké odpovědi pro komerční náklaďáky a semi.",
        qa: [
          { q: "Potřebuji CDL?", a: "Ano, pokud je GVWR 26 001 lb nebo více (nebo jak vyžaduje místní zákon)." },
          { q: "Jakou hmotnost zadávám?", a: "GVWR v librách—ne hodnotu v dolarech." },
          { q: "Jak funguje doklad pojištění?", a: "Agent nájemce pošle doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů." },
          { q: "Je povinné physical damage (PD)?", a: "Ano. Limity PD vycházejí z GVWR (lb); hold depozitu sleduje komerční spoluúčast / PD." },
          { q: "Jaká prohlídka je povinná?", a: "Komerční předprohlídka všech kol před startem; stejná sada při vrácení." },
        ],
      },
      "Cargo Vans": {
        title: "FAQ nákladních dodávek",
        summary: "Krátké odpovědi k cargo a pracovním dodávkám.",
        qa: [
          { q: "Potřebuji CDL?", a: "Obvykle ne pod 26 001 lb GVWR—ověřte místní zákon a váhovou třídu inzerátu." },
          { q: "Jaké pojištění?", a: "Krytí této dodávky dle inzerátu; nahrajte doklad před odemčením PIN/klíčů." },
          { q: "Nákladové limity?", a: "Dodržujte publikovaný payload a zajištění nákladu." },
          { q: "Jaké fotky?", a: "Karoserie, nákladový prostor a pneumatiky při pre-trip; stejné při vrácení." },
          { q: "Proč GPS pro PIN?", a: "PIN/lockbox jen na místě vyzvednutí nebo přes QR—ne přeposlaný kód." },
        ],
      },
      "RVs & Campers": {
        title: "FAQ obytných vozů",
        summary: "Krátké odpovědi k RV, karavanům a campers.",
        qa: [
          { q: "Speciální řidičák?", a: "Dodržujte místní RV/komerční pravidla a poznámku v inzerátu." },
          { q: "Jaké pojištění?", a: "Krytí tohoto RV dle inzerátu; nahrajte doklad před odemčením." },
          { q: "Přípojky a dump?", a: "Ověřte elektřinu/vodu/kanalizaci v inzerátu—kauce nejsou poplatky kempu." },
          { q: "Jaké fotky?", a: "Exteriér, pneumatiky a obytný prostor při pre-trip; stejné při vrácení." },
          { q: "Co kryje kauce?", a: "Interiér a chybějící příslušenství—ne pojištění storna výletu." },
        ],
      },
      "Special Vehicles": {
        title: "FAQ speciálních vozidel",
        summary: "Krátké odpovědi k nestandardním vozovým policím.",
        qa: [
          { q: "Jaké oprávnění?", a: "Podle inzerátu—CDL, endorsement nebo speciální povolení." },
          { q: "Jaké pojištění?", a: "Doklad kryjící tuto třídu vozidla před PIN/klíči." },
          { q: "Komerční police?", a: "U komerční třídy platí agent→owner pojištění a PD pravidla." },
          { q: "Jaké fotky?", a: "Karoserie a pneumatiky při pre-trip; stejné při vrácení." },
          { q: "Pojmenovaná police?", a: "Přesuňte na Cars, Trucks, Trailers, ATVs, RVs nebo Tow, pokud sedí." },
        ],
      },
      Other: {
        title: "Ostatní vozidla — nejdřív pojmenovaná police",
        summary: "Preferujte Cars, Motorcycles, Trailers, ATVs, RVs, Commercial, Cargo, Equipment, Tow nebo Special.",
        qa: [
          { q: "Použít Other?", a: "Přesuňte na pojmenovanou Vehicles polici, kdykoli sedí." },
          { q: "Co stále platí?", a: "VIN, pojištění a foto kontrola u Vehicles pronájmů." },
          { q: "Komerční vs lehké?", a: "Při komerčním GVWR/použití preferujte Commercial / Equipment / Tow." },
          { q: "Jaké fotky?", a: "Pre-trip karoserie a pneumatiky; stejné při vrácení." },
          { q: "Co není v ceně?", a: "Žádné partner pojištění ani CDL školení od Evorios." },
        ],
      },
    },
  },
};
