import type { AppMessages } from "../types";

export const faq: AppMessages["faq"] = {
  panel: {
    searchPlaceholder: "Hledat v nápovědě…",
    searchAria: "Hledat v FAQ",
    noMatchesTitle: "Žádné výsledky",
    noMatchesBody: (mascot) => `Zkuste jiná slova, nebo se zeptejte přímo ${mascot}.`,
    askAboutQuery: (mascot) => `Zeptat se ${mascot} na toto`,
    askDefault: (mascot) => `Nenašli jste odpověď? Zeptejte se ${mascot}`,
  },
  sections: {
    gettingStarted: "Začínáme",
    navigation: "Navigace",
    hosting: "Hostování a nabídky",
    qrPickup: "QR a vyzvednutí",
    renting: "Půjčování",
    payments: "Platby a bezpečnost",
    location: "Lokalita",
    account: "Účet",
  },
  items: {
    "what-is": {
      q: "Co je Evorios?",
      a: "Evorios je sousedský trh: každá domácnost je obchodní buňka — garážová výloha na bloku. Sousedé půjčují, prodávají nebo darují (Prodat za 0 Kč). Procházejte kategorie na Domů, nebo naplňte garáž zeleným tlačítkem +.",
    },
    "home-feed": {
      q: "Jak funguje Domů?",
      a: "Domů otevře hub procházení. Klepněte na čip kategorie (Nářadí, Zahrada, Párty…) nebo „Procházet blok“, pak filtrujte Vše · Půjčit · Koupit ve feedu. V patičce není lupa — kategorie jsou na Domů. Středové + vystaví věc z vaší garáže.",
    },
    "categories-nav": {
      q: "Jak procházím podle kategorie?",
      a: "Otevřete Domů → použijte čipy kategorií na hubu, nebo pás ve feedu pod Půjčit/Koupit. V Účet → Jak funguje Evorios (nebo úvod) klepněte na kategorii a rozbalte podkategorie. Při vystavení přes + vyberte stejné kategorie ve wizardu. V patičce není lupa.",
    },
    "garage-tab": {
      q: "Co je záložka Moje garáž?",
      a: "Záložka Garáž je výloha vaší domácnosti — aktivní nabídky, žádosti o rezervaci a statistiky. Nastavení (ozubené kolo) otevře profil. Věci přidáte kdykoli středovým tlačítkem +.",
    },
    "location-rent": {
      q: "Proč musím nastavit svůj blok?",
      a: "Ukazujeme garáže a věci ve vašem okolí (ve výchozím nastavení asi 40 km). Blok nastavíte při onboarding nebo klepnutím na lokalitu na Domů. Málo nabídek? Klepněte Hledat šířeji pro cca 80+ km.",
    },
    "install-pwa": {
      q: "Jak nainstaluji aplikaci do telefonu?",
      a: "Klepněte na Mr. Evorios v dolním menu pro tipy k instalaci, nebo použijte Přidat na plochu. Na iPhonu: Sdílet → Přidat na plochu. Na Androidu: použijte výzvu prohlížeče k instalaci, když se objeví.",
    },
    "list-first": {
      q: "Jak vystavím první věc?",
      a: "Klepněte na zelené + v patičce (nebo Garáž → Nové), pak rychlý wizard: 1) fotky, 2) detaily a cena (Půjčit / Prodat), 3) kontrola a publikace. U půjčování můžete po publikaci nastavit QR samolepku. Chcete něco darovat? Použijte Prodat s cenou 0 Kč. Mr. Evorios pomáhá v každém kroku.",
    },
    "photos-ai": {
      q: "Co se stane po přidání fotek?",
      a: "V kroku 1 při pokračování Mr. Evorios analyzuje fotky a navrhne název, kategorii, stav, popis a odhadovanou hodnotu. Vše můžete upravit v kroku 2.",
    },
    "pricing-modes": {
      q: "Jaké režimy ceny mám zvolit?",
      a: "V kroku 2 (Detaily a cena) zapněte Půjčit a/nebo Prodat. Povinná jsou jen pole pro zapnuté režimy. Nabídky jen na prodej přeskočí QR samolepku. Cena 0 Kč u Prodat = darování zdarma (samostatný režim Darovat zatím není).",
    },
    "replacement-value": {
      q: "Co je náhradní hodnota?",
      a: "Je to cena nové náhrady dnes — používá se pro ochranu vkladu a způsobilost k půjčení. Zadejte aktuální maloobchodní cenu, ne cenu z druhé ruky. AI navrhne hodnotu z fotek.",
    },
    "qr-sticker": {
      q: "Proč potřebuji QR samolepku?",
      a: "U půjčování fyzické QR na věci pomáhá ověřit předání. Po publikaci můžete vytisknout samolepku nebo použít QR na obrazovce. Nabídky jen na koupi nebo zdarma (prodej za 0 Kč) mohou samolepku přeskočit.",
    },
    "pickup-delivery": {
      q: "Jak funguje vyzvednutí a doručení?",
      a: "Nové nabídky začínají s rozumnými sousedskými výchozími hodnotami (všední hodiny na verandě). Po publikaci otevřete nabídku z Moje garáž → Úplná úprava (nebo rychlé úpravy na detailu) a nastavte osobní / bezkontaktní vyzvednutí a kilometry a poplatky za doručení. Přesná adresa se sdílí s potvrzeným nájemcem po rezervaci.",
    },
    "book-item": {
      q: "Jak si půjčím věc?",
      a: "Hledejte na Domů nebo procházejte Feed, otevřete věc a požádejte o rezervaci. Autorizujete platbu za půjčení a případnou zálohu zvlášť. Aktivní půjčky sledujte z ikony rezervací na Domů.",
    },
    "post-request": {
      q: "Ve výsledcích nic není — co teď?",
      a: "Pošlete poptávku z prázdného výsledku hledání. Sousedé se správným vybavením mohou odpovědět. Žádné falešné počty — ukazujeme reálné nabídky na vašem bloku, jak se garáže plní.",
    },
    "notifications": {
      q: "Kde jsou moje oznámení?",
      a: "Klepněte na zvonek na Domů. Záložky ukazují Vše, Rezervace a Zprávy.",
    },
    "payments": {
      q: "Jak fungují platby?",
      a: "Půjčky: zaplatíte celkovou cenu půjčení, pak samostatnou zálohu (ochrana vkladu), pokud ji hostitel nastavil. Platby jdou přes Stripe — Evorios neukládá kartu. Hostitelé připojí Stripe pro výplaty. Měna odpovídá zemi, kde máte nastavený blok.",
    },
    "dispute": {
      q: "S půjčkou se něco pokazilo — co teď?",
      a: "Zaznamenejte problém fotkami a zprávami v aplikaci. Při naléhavém ohrožení bezpečnosti nejdřív kontaktujte místní úřady. Mr. Evorios vás provede dalšími kroky v aplikaci, ale spory sám nerozhoduje.",
    },
    "availability-step5": {
      q: "Jak nastavím dostupnost nebo pozastavím nabídku?",
      a: "Otevřete Moje garáž → klepněte na nabídku:\n• Pozastavit / Obnovit skryje nebo vrátí věc do procházení bez smazání.\n• Upravte časy dostupnosti (všední dny / víkend) z rychlé úpravy nebo Úplné úpravy.\n• Smazat trvale odstraní nabídku z garáže i ze serveru.",
    },
    "skip-onboarding": {
      q: "Mohu přeskočit onboarding?",
      a: "Ano — Přeskočit na úvodních obrazovkách vás pošle nastavit blok a pak rovnou na Domů. Lokalitu můžete dokončit později z čipu lokality na Domů.",
    },
    "bottom-nav": {
      q: "Co dělají tlačítka dolního menu?",
      a: "Domů = hub a kategorie. Mr. Evorios = nápověda (FAQ + chat). Zelené + = nová věc. Garáž = vaše výloha a výdělky. Účet = profil, půjčky, oblíbené a Jak funguje Evorios. V patičce není lupa.",
    },
    "more-menu": {
      q: "Co je v menu Účet?",
      a: "Účet obsahuje kartu profilu, Půjčky, Zprávy (chat v aplikaci), Oblíbené, Oznámení, zkratku Moje garáž, přehled výdělků, interaktivního průvodce Jak funguje Evorios a chat s Mr. Evorios.",
    },
    "in-app-chat": {
      q: "Jak napíšu sousedovi v aplikaci?",
      a: "Otevřete Účet → Zprávy pro všechna vlákna. U půjčky: Půjčky → otevřete rezervaci → Zpráva. U nákupu: nabídka → ikona zprávy. Odpovědi mohou poslat push, pokud má druhá osoba push zapnuté.",
    },
    "mre-tab": {
      q: "Jak používám Mr. Evorios?",
      a: "Klepněte na jeho záložku v patičce. FAQ = okamžité odpovědi (bez nákladů na AI). Chat nejdřív zkontroluje FAQ, AI jen když je potřeba (odpovědi se cachují). Záložka Instalace pomůže přidat aplikaci na plochu.",
    },
    "profile-vs-garage": {
      q: "Profil vs Garáž — jaký je rozdíl?",
      a: "Garáž je pro hostování: nabídky, žádosti a statistiky. Profil je vaše identita: jméno, fotka, telefon, výplaty, preference oznámení a odhlášení.",
    },
    "zip-only": {
      q: "Potřebuji přesnou uliční adresu?",
      a: "Ne. Město + PSČ (např. Praha 1, 110 00) stačí k procházení blízkých garáží. Přesná adresa se sdílí jen s potvrzeným nájemcem při předání, když zvolíte ten režim vyzvednutí.",
    },
    "arkansas-rural": {
      q: "Jsem na venkově — proč je tak málo nabídek?",
      a: "Nové bloky se plní, jak sousedé plní garáže. Použijte Hledat šířeji na Domů (cca 80+ km), pošlete poptávku, nebo vystavte vlastní věci — raní hostitelé mají větší viditelnost.",
    },
    "traveling-mode": {
      q: "Cestuji — jak prohlížím jinou oblast?",
      a: "Při onboarding zvolte Cestování, nebo změňte lokalitu z čipu na Domů. Vyberte cílové město/PSČ — ukazujeme garáže tam, ne na vašem domácím bloku.",
    },
    "neighbor-garage": {
      q: "Jak otevřu garáž souseda?",
      a: "Na Domů přepněte na objektiv Garáže, nebo klepněte na kartu hostitele ve feedu. Uvidíte výlohu a aktivní nabídky.",
    },
    "favorites": {
      q: "Jak fungují uložené oblíbené?",
      a: "Účet → Oblíbené ukládá nabídky, které jste označili srdcem. Klepnutím otevřete věc a znovu rezervujete.",
    },
    "active-rental": {
      q: "Kde je moje aktivní půjčka?",
      a: "Účet → Půjčky, nebo ikona schránky na Domů. Otevřete rezervaci pro okno vyzvednutí, zprávy, QR check-in a kroky vrácení.",
    },
    "extend-rental": {
      q: "Mohu prodloužit půjčku?",
      a: "Pokud to hostitel dovolí, otevřete aktivní půjčku a požádejte o další dny před vrácením. Hostitel schválí a cena se v aplikaci aktualizuje.",
    },
    "cancel-booking": {
      q: "Jak zruším rezervaci?",
      a: "Otevřete půjčku v Půjčky a zvolte Zrušit, pokud je ještě před vyzvednutím. Pravidla refundace závisí na politice hostitele a načasování — viz souhrn rezervace.",
    },
    "host-payouts": {
      q: "Jak dostávají hostitelé peníze?",
      a: "Připojte Stripe v Profil → výplaty. Výplaty z půjček přijdou po úspěšném vrácení; poplatky platformy jsou vidět před publikací.",
    },
    "deposit-release": {
      q: "Kdy se uvolní moje záloha?",
      a: "Poté, co hostitel potvrdí vrácení (nebo po auto-uvolnění, pokud není spor). Zálohy jsou na výpisu karty oddělené od poplatku za půjčení.",
    },
    "passkey": {
      q: "Co je passkey?",
      a: "Passkey umožní přihlášení přes Face ID / otisk místo zadávání e-mailového kódu pokaždé. Po prvním přihlášení může aplikace nabídnout nastavení — volitelné, ale rychlejší. Přihlašovací kódy stále chodí e-mailem.",
    },
    "co-host": {
      q: "Mohu přidat spoluhostitele?",
      a: "Profil → Spoluhostitelé umožní pozvat někoho, kdo pomůže spravovat garáž. Může odpovídat na žádosti podle oprávnění, která nastavíte.",
    },
    "pause-listing": {
      q: "Jak pozastavím nabídku?",
      a: "Moje garáž → otevřete nabídku → Pozastavit nabídku. Okamžitě zmizí z procházení. Klepněte Obnovit, až budete připraveni. Smazat použijte jen když ji chcete pryč navždy.",
    },
    "edit-listing": {
      q: "Jak upravím publikovanou nabídku?",
      a: "Garáž → klepněte na nabídku → použijte rychlé úpravy na detailu, nebo Úplnou úpravu pro fotky a ceny. Pozastavit a Smazat jsou ve stejné sekci Správa.",
    },
    "boost-listing": {
      q: "Jak získám více zobrazení?",
      a: "Nejvíc pomohou jasné fotky, férová cena a kompletní dostupnost. Placený boost (když je k dispozici) zvýrazní věc ve feedu bloku.",
    },
    "report-issue": {
      q: "Jak nahlásím uživatele nebo nabídku?",
      a: "Otevřete nabídku nebo vlákno půjčky → Nahlásit. Při nouzi nejdřív volejte místní úřady. U škod uveďte fotky a data.",
    },
    "app-update": {
      q: "Aplikace chtěla aktualizaci — co mám udělat?",
      a: "Evorios stahuje aktualizace na pozadí a instaluje je přes noc kolem 2:00 (nebo při příštím otevření). Můžete také otevřít Oznámení (zvonek) a klepnout Aktualizovat dříve. Pokud se obrazovka po aktualizaci zasekne, aplikaci zavřete a znovu otevřete.",
    },
    "offline": {
      q: "Funguje Evorios offline?",
      a: "Procházení cachovaných stránek může chvíli fungovat, ale rezervace, chat a nové hledání potřebují internet. Bez připojení uvidíte offline obrazovku.",
    },
  },
};
