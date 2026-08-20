import type { CategoryFactsOverlay } from "../types";

/** CS FactCard overlay — missing shelves inherit canonical EN via resolveCategoryFacts. */
export const categoryFactsCsOverlay: CategoryFactsOverlay = {
  expand: "Zjistit více",
  collapse: "Skrýt detaily",
  byCategory: {
    Vehicles: {
        title: "FAQ půjčení osobního / lehkého auta",
        summary: "Krátké odpovědi pro auta a lehké náklaďáky pod komerční hmotností.",
        qa: [
          {
            q: "Potřebuji CDL?",
            a: "Ne u lehkých osobních aut pod 26 001 lb GVWR, pokud místní zákon nestanoví jinak.",
          },
          {
            q: "Jaké pojištění potřebuji?",
            a: "Platné osobní auto pojištění na toto auto. Nahrajte doklad v aplikaci před odemčením PIN nebo klíčů.",
          },
          {
            q: "Jak funguje storno?",
            a: "Storno ≥24 h před startem: plná refundace. Do 24 h: 50 %.",
          },
          {
            q: "Palivo a pozdní návrat?",
            a: "Palivo plná→plná (+$20 při nedodání). Pozdní návrat: 30 min grace, pak $20 + $15/h.",
          },
          {
            q: "Proč GPS pro PIN?",
            a: "PIN se odemkne jen na místě vyzvednutí (nebo přes QR na autě)—ne přeposlaný kód.",
          },
          {
            q: "Jaké fotky jsou povinné?",
            a: "Předprohlídka karoserie + čtyři pneumatiky před startem; stejná sada při vrácení.",
          },
        ],
      },
    VehiclesCommercial: {
        title: "FAQ komerční dopravy (≥26 001 lb / semi)",
        summary: "Krátké odpovědi pro těžké komerční náklaďáky a semi.",
        qa: [
          {
            q: "Potřebuji CDL?",
            a: "Ano, pokud je GVWR 26 001 lb nebo více (nebo jak vyžaduje místní zákon).",
          },
          {
            q: "Jakou hmotnost zadávám?",
            a: "GVWR v librách—ne hodnotu v dolarech.",
          },
          {
            q: "Jak funguje doklad pojištění?",
            a: "Agent nájemce pošle doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů.",
          },
          {
            q: "Je povinné physical damage (PD)?",
            a: "Ano. Limity PD vycházejí z GVWR (lb); hold depozitu sleduje komerční spoluúčast / PD.",
          },
          {
            q: "Jaká prohlídka je povinná?",
            a: "Komerční předprohlídka všech kol před startem; stejná sada při vrácení.",
          },
          {
            q: "Proč GPS pro PIN?",
            a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód.",
          },
        ],
      },
    "Heavy Equipment": {
          title: "FAQ pronájmu těžké techniky",
          summary: "Krátké odpovědi pro vysokozdvižné vozíky, bagry, jeřáby a podobnou techniku.",
          qa: [
            {
              q: "Kdo může půjčit?",
              a: "Ve výchozím stavu profesionálové. DIY jen pokud hostitel bránu vypne.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano, pokud podkategorie vyžaduje doklad (vozík/jeřáb/bagr/obecné)—nahrajte před předáním.",
            },
            {
              q: "Je pojištění povinné?",
              a: "Ano—doklad o poškození před PIN/klíči. Kauce odpovídá spoluúčasti.",
            },
            {
              q: "Jaká prohlídka je povinná?",
              a: "Povinné foto před výjezdem; obě strany potvrdí před startem i při vrácení.",
            },
            {
              q: "Co kryje kauce?",
              a: "Držení ve výši spoluúčasti—ne plnou náhradu. Primární je pojištění.",
            },
          ],
        },
    Construction: {
          title: "FAQ pronájmu stavebnin",
          summary: "Krátké odpovědi pro sousedskou stavbu (ne národní autopůjčovnu techniky).",
          qa: [
            {
              q: "Jen pro profesionály?",
              a: "Poháněné a jeřábové police vyžadují pro + strukturované COI. Měkké PPE může být lehčí.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano u jeřábu, bagru a dalších těžkých polic, které to žádají.",
            },
            {
              q: "Jak funguje palivo?",
              a: "Když hostitel nastaví typ paliva: vraťte plná-plná.",
            },
            {
              q: "Lze měsíční sazba?",
              a: "Ano—hostitelé mohou nabídnout měsíční ceny na delší zakázky.",
            },
            {
              q: "Jaká foto jsou povinná?",
              a: "Předvýjezdová prohlídka blokuje start; bednění má checklist kusů při vrácení.",
            },
          ],
        },
    "Boats & Water": {
          title: "FAQ lodí a vodní techniky",
          summary: "Krátké odpovědi pro motorové lodě, paddle a plavby s kapitánem.",
          qa: [
            {
              q: "Potřebuji ID trupu?",
              a: "Ano u motorových (HIN/CIN/místní registrace). Kajaky/SUP/nafukovací bez motoru ne.",
            },
            {
              q: "Věk / licence?",
              a: "Bez kapitána: 25 + licence dle potřeby. S kapitánem: věk 18, bez licence nájemce.",
            },
            {
              q: "Jaké bezpečnostní vybavení?",
              a: "Motorové: sada USCG/místní. Paddle: potvrzení PFD politiky.",
            },
            {
              q: "Jaká foto?",
              a: "Obchůzka trupu (příď, záď, levý/pravý bok, paluba) před startem i při vrácení.",
            },
            {
              q: "Pojištění?",
              a: "Ano—doklad před předáním. Kauce dle spoluúčasti.",
            },
          ],
        },
    "Real Estate": {
          title: "FAQ krátkodobého ubytování",
          summary: "Krátké odpovědi k pravidlům domu, úklidu a ID při check-inu.",
          qa: [
            {
              q: "Jsou pravidla domu povinná?",
              a: "Ano u pronájmu—hluk, hosté, kouření, mazlíčci, checkout.",
            },
            {
              q: "Úklidový poplatek?",
              a: "Volitelný—pokud je, zobrazí se při rezervaci a zamrzne ve smlouvě.",
            },
            {
              q: "Jaké ID při check-inu?",
              a: "Selfie / nahrání dokladu na začátku—stejný vzor jako u vozidel.",
            },
            {
              q: "Jaká kauce?",
              a: "Obvykle kolem jednoho měsíčního nájmu, pokud hostitel nenastaví jinak.",
            },
            {
              q: "Kdy se odemkne přístup?",
              a: "Až po startovním ID na místě—ne jen z přeposlaného potvrzení.",
            },
          ],
        },
    "Photo & Video": {
          title: "Photo & video rental FAQ",
          summary: "Short answers for kits, drones Remote ID, media, and deposit claims \u2014 no gear-insurance promo.",
          qa: [
            {
              q: "What is required on Photo & Video rentals?",
              a: "Brand, model, kit class, and a kit inventory. Drones also freeze weight class and Remote ID status.",
            },
            {
              q: "Who brings memory cards?",
              a: "Capture-media field freezes included, partial, renter brings, or internal-only.",
            },
            {
              q: "Do drones need Remote ID?",
              a: "Yes unless under-250g exempt \u2014 host marks built-in, add-on, or valid exempt. Mismatch blocks publish.",
            },
            {
              q: "What does the deposit cover?",
              a: "Body damage and missing kit pieces against the frozen list \u2014 not a production insurance policy.",
            },
            {
              q: "Partner promo?",
              a: "No camera-shop affiliate or lens-insurance hard-sell.",
            },
          ],
        },
    "Electronics & Tech": {
          title: "FAQ elektroniky a tech",
          summary: "Krátké odpovědi k sériím, sadám, wipe a kauci.",
          qa: [
            {
              q: "Sériové číslo + inventář?",
              a: "Ano u pronájmu—uvedte nabíječky, dongly, pouzdra, ovladače.",
            },
            {
              q: "Wipe u zařízení s úložištěm?",
              a: "Ano—host wipe/unlink před publikací; nájemce potvrdí při rezervaci.",
            },
            {
              q: "Partnerské pojištění?",
              a: "Ne. Důvěra sousedů + kauce.",
            },
            {
              q: "Kontrola při předání?",
              a: "Spočítejte každou položku inventáře.",
            },
            {
              q: "Něco chybí?",
              a: "Inventář + série podpoří reklamaci; kauce pokryje mezeru.",
            },
          ],
        },
    "Gym & Fitness": {
          title: "FAQ k půjčení fitness vybavení",
          summary: "Krátké odpovědi k vzdání se odpovědnosti, váhovým limitům, hygieně a branám polic.",
          qa: [
            {
              q: "Potřebuji vzdání se odpovědnosti?",
                a: "Ano, ve výchozím stavu u půjček Gym & Fitness—vzdání se rizika / odpovědnosti při rezervaci, pokud host nenastaví „není vyžadováno“.",
            },
            {
              q: "Je maximální váha uživatele?",
                a: "U Cardio, Commercial Treadmills a Weight Machines host nastaví pásmo max. váhy—držte se ho.",
            },
            {
              q: "Co kryje kauce?",
                a: "Poškození a chybějící díly. Vzdání se odpovědnosti kryje běžné riziko zranění, ne poškození vybavení.",
            },
            {
              q: "Mají měkké zboží stejné brány jako stroje?",
                a: "Jóga, gumy a recovery používají hygienu a sadu; stroje přidávají napájení, půdorys a max. váhu uživatele.",
            },
            {
              q: "Je pojištění fitness součástí?",
                a: "Ne. Jen kauce + vzdání se odpovědnosti + specifikace police—bez promo třetí strany.",
            },
          ],
        },
    "Sports & Recreation": {
          title: "FAQ sportu a rekreace",
          summary: "Krátké odpovědi k waiveru, PFD, DIN/helmě, inventáři a kauci.",
          qa: [
            {
              q: "Co je povinné u Sports pronájmů?",
              a: "Velikost/délka a skill na každém inzerátu. Sníh zmrazí formu, DIN, helmu a waiver. Voda/pro voda zmrazí třídu, PFD a waiver. Ostatní police mají typové pole.",
            },
            {
              q: "Kdy je povinný waiver?",
              a: "Snow Sports, Water Sports a Pro Water Sports publikují pole liability waiver.",
            },
            {
              q: "Je PFD v ceně u vody?",
              a: "Inzerát zmrazí v ceně / nájemce / N/A — nepředpokládejte záchrannou vestu.",
            },
            {
              q: "Co kryje kauce?",
              a: "Poškození a chybějící kusy podle inventáře — ne úrazové pojištění.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné lekce, guide ani zdravotní krytí od Evorios.",
            },
          ],
        },
    "Outdoor & Camping": {
          title: "FAQ outdoor a kempování",
          summary: "Krátké odpovědi k vzdání se nároků, hygieně a chybějícím dílům.",
          qa: [
            {
              q: "Kdy vzdání se nároků?",
              a: "U expedičních / survival polic při rezervaci.",
            },
            {
              q: "Stany a spacáky?",
              a: "Host potvrdí vyčištění/vyvětrání; nájemce hygienický checklist.",
            },
            {
              q: "Jaké specifikace?",
              a: "Kapacita a sezonní rating na inzerátu.",
            },
            {
              q: "Co kryje kauce?",
              a: "Tyčky, tropiko, díly vařiče a další chybějící/poškozené kusy.",
            },
            {
              q: "Cestovní pojištění?",
              a: "Ne—jen kauce + vzdání/hygiena.",
            },
          ],
        },
    "Bikes & Scooters": {
          title: "FAQ kol a koloběžek",
          summary: "Krátké odpovědi k helmě, zámku, e-pohonu a dětem.",
          qa: [
            {
              q: "Helma, zámek, noční uložení?",
              a: "Ano—hostitel musí vše tři uvést u pronájmu.",
            },
            {
              q: "E-kola / e-koloběžky?",
              a: "Min. věk + třída e-kola, pokud je police E-Bikes nebo Electric = ano.",
            },
            {
              q: "Vzdání u MTB / racing?",
              a: "Ano ve výchozím stavu.",
            },
            {
              q: "Dětská kola?",
              a: "Potvrzení zákonného zástupce; helma nesmí být „nevyžadována“.",
            },
            {
              q: "Cargo / adaptive?",
              a: "Cargo: nosnost + politika dítěte. Adaptive: uvedený subtype.",
            },
          ],
        },
    "Party & Events": {
          title: "FAQ pronájmu párty a akcí",
          summary: "Krátké odpovědi k kapacitě, poplatku za stavbu, napájení, zrušení kvůli počasí a sanitaci cateringu.",
          qa: [
            {
              q: "Je poplatek za stavbu/demontáž?",
              a: "Profi AV / pódium / světla ho často uvádějí — zmrazí se ve smlouvě při rezervaci.",
            },
            {
              q: "Jaké info o napájení se zobrazí?",
              a: "Ampéry / okruhy u Pódia, Zvuku, Světel, Photoboothu a Cateringu, když je host nastaví — zkontrolujte před rezervací.",
            },
            {
              q: "Jak funguje zrušení kvůli počasí?",
              a: "Venkovní markýzy/stany a venkovní půdorysy uvádějí okno (24 h / 12 h / uvážení hostitele) pro plnou refundaci.",
            },
            {
              q: "Potřebují stoly a dekorace zrušení kvůli počasí?",
              a: "Ne u vnitřní měkké dekorace — venkovní půdorys stále vyžaduje okno, když je povinné.",
            },
            {
              q: "Kdy je povinná sanitace cateringu?",
              a: "Serving Equipment a Catering Equipment vyžadují potvrzení sanitace hostitelem před předáním.",
            },
            {
              q: "Co kryje kauce?",
              a: "Skvrny, trhliny, chybějící kusy a zneužití napájení nad běžné opotřebení — ne pojištění akce.",
            },
          ],
        },
    "Tools & DIY": {
          title: "FAQ nářadí a DIY",
          summary: "Krátké odpovědi k PPE, školení a kauci.",
          qa: [
            {
              q: "Kdy bezpečnostní briefing?",
              a: "Pily, svářečky a lešení—potvrďte PPE/briefing před předáním.",
            },
            {
              q: "Jaké PPE?",
              a: "Oči, uši, ruce; svařovací PPE dle potřeby.",
            },
            {
              q: "Vrtačky?",
              a: "Většina ručního nářadí jen soused + kauce.",
            },
            {
              q: "Co kryje kauce?",
              a: "Kotouče, baterie a příslušenství—ne plné pojištění nářadí.",
            },
            {
              q: "Co pomůže u reklamace?",
              a: "Fotky při předání + potvrzení briefingu.",
            },
          ],
        },
    "Unique & Other": {
          title: "Unique & other FAQ",
          summary: "Krátké odpovědi pro one-off věci, křehkost a kauci — bez promo pojištění.",
          qa: [
            {
              q: "Co je vždy povinné?",
              a: "Use case, transport a pásmo křehkosti u Unique pronájmů.",
            },
            {
              q: "Kdy je checklist povinný?",
              a: "Hobby, Specialty, Props, Custom a Other zamrazí inventář.",
            },
            {
              q: "Co kryje kauce?",
              a: "Poškození a chybějící kusy — ne pojištění sbírky, umění nebo nástroje.",
            },
            {
              q: "Mám přesunout?",
              a: "Ano, když sedí pojmenovaná kategorie (Music pro běžné nástroje, Party pro párty sady).",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell aukcí, galerií nebo specialty pojištění.",
            },
          ],
        },
    "Garden & Yard": {
          title: "Zahrada a dvůr — FAQ",
          summary: "Krátké odpovědi k nářadí, rostlinám, závlaze a pařezovým frézám.",
          qa: [
            {
              q: "Potřebují foukače listí pojištění?",
              a: "Ne—běžné nářadí používá důvěru sousedů, specifikace police a kauci.",
            },
            {
              q: "Co vyžadují pařezové frézy?",
              a: "Kapacitu, OOP, vzdání se odpovědnosti, důkaz pojištění a bezpečnostní instruktáž před předáním.",
            },
            {
              q: "Jaká pole u rostlin jsou důležitá?",
              a: "Obecný název, výška, slunce, nádoba, zdravotní stupeň, zálivka a politika přesazení/vrácení při pronájmu.",
            },
            {
              q: "Co mám vyfotit?",
              a: "Stav při předání—nože, vaky, baterie, kanystry a květináče často způsobují spory.",
            },
            {
              q: "Pojišťuje Evorios zahradní práce?",
              a: "Ne—důkaz nájemce (když je vyžadován) a kauce jsou hlavní vrstvy.",
            },
          ],
        },
    "Home & Kitchen": {
          title: "FAQ domácnosti a kuchyně",
          summary: "Krátké odpovědi ke spotřebičům a komerčním kávovarům.",
          qa: [
            {
              q: "Běžné spotřebiče?",
              a: "Soused + kauce, plus kapacita a vrácení v čistotě.",
            },
            {
              q: "Komerční espresso / brew?",
              a: "Napětí, NSF status a instalace (voda/pevná montáž) na inzerátu.",
            },
            {
              q: "Proč napětí?",
              a: "Špatné napětí nebo chybějící přívod vody pokazí event—fakta zamrznou ve smlouvě.",
            },
            {
              q: "Co kryje kauce?",
              a: "Poškození a chybějící příslušenství.",
            },
            {
              q: "Certifikuje Evorios NSF?",
              a: "Ne—hostitel uvádí status.",
            },
          ],
        },
    "Office & Business": {
          title: "Office & business rental FAQ",
          summary: "Short answers for furniture vs devices with storage, wipe plans, and deposit claims.",
          qa: [
            {
              q: "Do desks need a data wipe?",
              a: "No\u2014furniture stays neighbor + deposit. Devices that store jobs or accounts freeze storage status and a wipe plan.",
            },
            {
              q: "When is a wipe required?",
              a: "When the listing marks onboard storage\u2014especially POS, servers, copiers, and printers with jobs. Host wipe status + renter wipe ack at booking.",
            },
            {
              q: "Who handles cyber insurance?",
              a: "Neither party gets platform cyber cover\u2014wipe attestation is the privacy layer.",
            },
            {
              q: "What does the deposit cover?",
              a: "Physical damage and missing trays, cables, stands, or readers against the frozen kit list.",
            },
            {
              q: "What if data is left on the device?",
              a: "Follow the published wipe status and booking acknowledgment\u2014Evorios does not certify data erasure.",
            },
          ],
        },
    "Music & Audio": {
          title: "FAQ p\u016fj\u010den\u00ed hudby a audia",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi k n\u00e1stroj\u016fm, PA invent\u00e1\u0159i, kabel\u016fm, kufr\u016fm a kauci \u2014 bez poji\u0161t\u011bn\u00ed backline.",
          qa: [
            {
              q: "Co je povinn\u00e9 u Music & Audio?",
              a: "Zna\u010dka a model u ka\u017ed\u00e9 nab\u00eddky. Nap\u00e1jen\u00e9 police maj\u00ed t\u0159\u00eddu v\u00fdkonu. V\u00edced\u00edln\u00e9 sady by m\u011bly m\u00edt checklist kabel\u016f, stojan\u016f a kufr\u016f. PA Systems vy\u017eaduj\u00ed invent\u00e1\u0159 kabel\u016f/stojan\u016f p\u0159i p\u0159ed\u00e1n\u00ed.",
            },
            {
              q: "Pot\u0159ebuji s\u00e9riov\u00e9 \u010d\u00edslo?",
              a: "Ano u p\u016fj\u010den\u00ed Music & Audio \u2014 s\u00e9riov\u00e9 / v\u00fdrobn\u00ed \u010d\u00edslo se zmraz\u00ed s nab\u00eddkou pro p\u0159ed\u00e1n\u00ed a reklamace.",
            },
            {
              q: "Kdy je povinn\u00fd invent\u00e1\u0159 kabel\u016f/stojan\u016f?",
              a: "V\u017edy u PA Systems. Ostatn\u00ed police maj\u00ed doporu\u010den\u00fd checklist sady, aby \u0161ly reklamovat chyb\u011bj\u00edc\u00ed XLR, stojany a ped\u00e1ly.",
            },
            {
              q: "Co kryje kauce?",
              a: "\u0160kr\u00e1bance, po\u0161kozen\u00fd hardware a chyb\u011bj\u00edc\u00ed p\u0159\u00edslu\u0161enstv\u00ed podle zmrazen\u00e9ho invent\u00e1\u0159e \u2014 ne pojistku backline ani Fat Llama.",
            },
            {
              q: "Je to Electronics Pro Audio?",
              a: "Ne. Studio capture u Electronics z\u016fst\u00e1v\u00e1 v Pro Audio. \u017div\u00e9 sestavy a n\u00e1stroje z\u016fst\u00e1vaj\u00ed v Music & Audio.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd Sweetwater / Guitar Center affiliate, \u017e\u00e1dn\u00e1 pr\u00e1ce stage tech a \u017e\u00e1dn\u00fd upsell poji\u0161t\u011bn\u00ed n\u00e1stroj\u016f od Evorios.",
            },
          ],
        },
    "Costume & Cosplay": {
          title: "FAQ kostýmů a cosplay",
          summary: "Krátké odpovědi k vrácení, poplatku za čištění a hygieně.",
          qa: [
            {
              q: "Je stav při vrácení povinný?",
              a: "Ano—pravidla (+ volitelný poplatek za čištění) zamrznou ve smlouvě.",
            },
            {
              q: "Kontaktní kusy sanitizace?",
              a: "Ano u masek, makeupu, paruk a interiérů kostýmů dle police.",
            },
            {
              q: "Kdy inventář kusů?",
              a: "Divadlo, filmové rekvizity, pro makeup a full suit.",
            },
            {
              q: "Full suit vzdání?",
              a: "Ano—plus vedení k teplu/viditelnosti. Animatronika také se vzdáním.",
            },
            {
              q: "Co kryje kauce?",
              a: "Trhliny a chybějící kusy nad publikovaný poplatek za čištění.",
            },
          ],
        },
    "Baby & Kids": {
          title: "FAQ dětské bezpečnosti",
          summary: "Krátké odpovědi k sedačkám, postýlkám a komerčnímu hraní.",
          qa: [
            {
              q: "Expirovaná sedačka?",
              a: "Ne—expirace a recall blokují publikaci i rezervaci.",
            },
            {
              q: "Postýlky?",
              a: "Bez drop-side; standard spánku; pevná matrace; sanitizace.",
            },
            {
              q: "Komerční herní prvky?",
              a: "Certifikace, kapacita a vzdání se nároků.",
            },
            {
              q: "Co musí hostitel ukázat?",
              a: "Foto štítku, recall check a sanitizaci dle potřeby.",
            },
            {
              q: "Co potvrzuje nájemce?",
              a: "Bezpečnostní potvrzení při rezervaci před odemčením.",
            },
          ],
        },
  },
  bySubcategory: {
    "Unique & Other": {
        "Collectibles": {
          title: "Sběratelské — autenticita + péče",
          summary: "Autenticita, use case, transport a křehkost.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Autenticita, use case, transport a pásmo křehkosti.",
            },
            {
              q: "Je to pravé?",
              a: "Host označí doložené, neznámé nebo replika ok — ne znalecký posudek.",
            },
            {
              q: "Kauce?",
              a: "Kryje oděrky a chybějící stojany — ne pojištění sbírky.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell aukčních domů.",
            },
          ],
        },
        "Art & Sculpture": {
          title: "Umění — médium + křehkost",
          summary: "Médium, transport a křehkost pro pronájem umění.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Médium, use case, transport a křehkost.",
            },
            {
              q: "Zavěšení?",
              a: "Uveďte úchyty/stojany v poznámkách.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození povrchu — ne pojištění trhu umění.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell galerií.",
            },
          ],
        },
        "Hobby Equipment": {
          title: "Hobby — třída + inventář",
          summary: "Hobby třída plus checklist pro sady.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Hobby třída, use case, transport, křehkost a checklist.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící kusy podle seznamu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell hobby store.",
            },
            {
              q: "Přesun?",
              a: "Párty sady mohou patřit do Party — Unique je one-off hobby.",
            },
          ],
        },
        "Unusual Items": {
          title: "Unusual — třída + péče",
          summary: "Novinky a zážitky zamrazí třídu.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Unusual třída, use case, transport a křehkost.",
            },
            {
              q: "Jak divné je ok?",
              a: "Popište bezpečné použití — bez skrytých rizik.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození a chybějící kusy.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell novelty shop.",
            },
          ],
        },
        "Seasonal Items": {
          title: "Sezónní — třída + péče",
          summary: "Sváteční a sezónní vybavení zamrazí třídu.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Sezónní třída, use case, transport a křehkost.",
            },
            {
              q: "Vrácení balení?",
              a: "Uveďte očekávání balení.",
            },
            {
              q: "Kauce?",
              a: "Kryje rozbité dekory a chybějící světla.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell holiday store.",
            },
          ],
        },
        "Specialty Equipment": {
          title: "Specialty — třída + inventář",
          summary: "Lab/trade specialty zamrazí třídu a checklist.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Specialty třída, use case, transport, křehkost a checklist.",
            },
            {
              q: "Školení?",
              a: "Host poznamená skill operátora.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící moduly — ne pojištění odpovědnosti.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell specialty vendorů.",
            },
          ],
        },
        "Industrial Oddities": {
          title: "Průmyslové kuriozity — třída + péče",
          summary: "Stroje/fixture zamrazí třídu a zacházení.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída kuriozity, use case, transport a křehkost.",
            },
            {
              q: "Napájení / instalace?",
              a: "Uveďte v poznámkách.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození při transportu — ne pojištění stavby.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell surplus dealerů.",
            },
          ],
        },
        "Professional Props": {
          title: "Rekvizity — třída + inventář",
          summary: "Film/jeviště/foto zamrazí třídu a checklist.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída rekvizity, use case, transport, křehkost a checklist.",
            },
            {
              q: "Pravidla na place?",
              a: "Uveďte no-food / no-weather.",
            },
            {
              q: "Kauce?",
              a: "Kryje oděrky a chybějící kusy podle seznamu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell prop house.",
            },
          ],
        },
        "Rare Instruments": {
          title: "Vzácné nástroje — třída + péče",
          summary: "Vzácné nástroje zamrazí třídu; standard patří do Music.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída nástroje, use case, transport a křehkost.",
            },
            {
              q: "Proč Unique?",
              a: "Když je kus rare/one-off — běžné kytary do Music.",
            },
            {
              q: "Kauce?",
              a: "Kryje pouzdro a chybějící smyčce — ne pojištění nástroje.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell pojištění nástrojů.",
            },
          ],
        },
        "Custom Builds": {
          title: "Custom builds — třída + inventář",
          summary: "Custom nábytek/zařízení zamrazí třídu a checklist.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Custom třída, use case, transport, křehkost a checklist.",
            },
            {
              q: "Poznámky maker?",
              a: "Uveďte tolerance a montáž.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození povrchu a chybějící hardware.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell maker marketplace.",
            },
          ],
        },
        "Other": {
          title: "Unique other — přesuňte na pojmenovanou polici",
          summary: "Catch-all publikuje druh a checklist.",
          qa: [
            {
              q: "Kdy Other?",
              a: "Jen když nepasuje pojmenovaná Unique police.",
            },
            {
              q: "Jaké brány?",
              a: "uniqueOtherKind, use case, transport, křehkost a checklist.",
            },
            {
              q: "Přesun?",
              a: "Na Collectibles, Art, Hobby, Unusual, Seasonal, Specialty, Props, Instruments nebo Custom.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící kusy podle checklistu.",
            },
          ],
        },
      },
    "Tools & DIY": {
        "Hand Tools": {
          title: "Ruční — třída + sada",
          summary: "Gola a klíče zamrazí třídu a single vs sada.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída ručního nářadí, zdroj energie a single vs sada. Sady potřebují checklist.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící hlavice a poškozené rukojeti podle seznamu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell tool store.",
            },
            {
              q: "Ruční pohon?",
              a: "Power source může být manual u neelektrických nástrojů.",
            },
          ],
        },
        "Power Drills": {
          title: "Vrtačky — třída + pohon",
          summary: "Šroubováky a příklepy zamrazí třídu a pohon.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída vrtačky, pohon a napětí u AKU.",
            },
            {
              q: "Baterie?",
              a: "Baterie a nabíječky do checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození sklíčidla a chybějící baterie.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell bateriových platforem.",
            },
          ],
        },
        "Measuring Tools": {
          title: "Měření — třída",
          summary: "Metry, vodováhy a úhelníky zamrazí třídu.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída měřidel a pohon (manual u metrů).",
            },
            {
              q: "Přesnost?",
              a: "Hostem deklarovaná třída — ne kalibrační certifikát.",
            },
            {
              q: "Kauce?",
              a: "Kryje ohnuté úhelníky a chybějící pouzdra.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell metrologie.",
            },
          ],
        },
        "Ladders": {
          title: "Žebříky — výška + duty",
          summary: "Výška a duty rating před pronájmem.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Výška, duty rating a pohon (manual).",
            },
            {
              q: "Duty rating?",
              a: "Pásma typu IAA–III — držte se štítku.",
            },
            {
              q: "Kauce?",
              a: "Kryje ohnuté bočnice — ne pojištění pádu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell pojištění žebříků.",
            },
          ],
        },
        "Painting Tools": {
          title: "Malování — třída + sada",
          summary: "Stříkačky a válečky zamrazí třídu a single vs sada.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída malířského nářadí, pohon a sada. Sady potřebují inventář.",
            },
            {
              q: "Úklid?",
              a: "Uveďte očekávání vrácení čisté.",
            },
            {
              q: "Kauce?",
              a: "Kryje ucpané stříkačky a chybějící trysky.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell paint značek.",
            },
          ],
        },
        "Industrial Drills": {
          title: "Průmyslové vrtačky — třída + pohon",
          summary: "Pro vrtačky stejná brána třídy.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída vrtačky, pohon a napětí.",
            },
            {
              q: "PPE?",
              a: "Bitý a PPE do checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje motor a chybějící baterie.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell distributorů.",
            },
          ],
        },
        "Welding Equipment": {
          title: "Sváření — proces, ampéry, PPE, briefing",
          summary: "Proces, amp, PPE a bezpečnostní briefing.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Proces, amp pásmo, PPE a briefing ready.",
            },
            {
              q: "Kdo nese PPE?",
              a: "Pole PPE: helma/rukavice v ceně vs renter donese.",
            },
            {
              q: "Kauce?",
              a: "Kryje špičky a kabely — ne pojištění popálenin.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell svářecích plynů.",
            },
          ],
        },
        "Scaffolding Systems": {
          title: "Lešení — výška, zátěž, briefing",
          summary: "Výška, zátěž a briefing.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Výška, zátěž a briefing ready.",
            },
            {
              q: "Montáž?",
              a: "Briefing pokrývá montáž/inspekci.",
            },
            {
              q: "Kauce?",
              a: "Kryje ohnuté rámy — ne pojištění pádu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell půjčoven lešení.",
            },
          ],
        },
        "Laser Measuring": {
          title: "Laser — třída",
          summary: "Dálkoměry a lasery zamrazí třídu.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída laseru a pohon.",
            },
            {
              q: "Přesnost?",
              a: "Hostem deklarovaná třída — ne geodetický certifikát.",
            },
            {
              q: "Kauce?",
              a: "Kryje prasklá skla a chybějící stativy.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell laser vendorů.",
            },
          ],
        },
        "Power Saws": {
          title: "Pily — třída + briefing",
          summary: "Třída pily a bezpečnostní briefing.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída pily, pohon a briefing ready.",
            },
            {
              q: "Kotouče?",
              a: "Náhradní kotouče do checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškozené kryty — ne pojištění úrazu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell značek pil.",
            },
          ],
        },
        "Other": {
          title: "Tools other — přesuňte na pojmenovanou polici",
          summary: "Catch-all publikuje druh, sadu a inventář.",
          qa: [
            {
              q: "Kdy Other?",
              a: "Jen když nepasuje pojmenovaná Tools police.",
            },
            {
              q: "Jaké brány?",
              a: "toolsOtherKind, sada, pohon a checklist.",
            },
            {
              q: "Přesun?",
              a: "Na Hand, Drill, Measure, Ladder, Paint, Weld, Scaffold, Saw nebo Laser.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící kusy podle checklistu.",
            },
          ],
        },
      },
    "Sports & Recreation": {
        "Snow Sports": {
          title: "Zima — forma, DIN, helma",
          summary: "Forma lyží/boardu, pásmo DIN, helma a waiver před pronájmem.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Forma sněhového vybavení, DIN, helma, velikost, skill a waiver.",
            },
            {
              q: "Co znamená DIN?",
              a: "Hostem uvedené pásmo vázání — ne certifikace vašich bot.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškození hran a chybějící hole — ne zranění. Waiver kryje běžné riziko úrazu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell pojištění od ski shopu.",
            },
          ],
        },
        "Water Sports": {
          title: "Voda — plavidlo, PFD, waiver",
          summary: "Třída plavidla, PFD a waiver pro boardy a paddle sporty.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída vodního vybavení, PFD, velikost, skill a waiver.",
            },
            {
              q: "Kdo nese PFD?",
              a: "Pole PFD: v ceně, renter donese, nebo nepoužitelné.",
            },
            {
              q: "Kauce?",
              a: "Kryje oděrky a chybějící ploutve — ne pojištění úrazu ve vodě.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell pojištění watersports.",
            },
          ],
        },
        "Pro Water Sports": {
          title: "Pro voda — plavidlo, PFD, waiver",
          summary: "Pro police používají stejné brány craft/PFD/waiver.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída plavidla, PFD, velikost, skill a waiver.",
            },
            {
              q: "Pro vs osobní?",
              a: "Stejné bezpečnostní brány — pro kit uveďte v checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící tow lana a boardy — ne pojištění akce.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell sponzora turnaje.",
            },
          ],
        },
        "Racket Sports": {
          title: "Rakety — typ sportu",
          summary: "Tenis až pickleball zamrazí typ sportu plus velikost a skill.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Typ raketového sportu, velikost a skill.",
            },
            {
              q: "Struny / napětí?",
              a: "Poznamenejte v checklistu, pokud na tom záleží.",
            },
            {
              q: "Kauce?",
              a: "Kryje prasklé rámy a chybějící obaly — ne záruku strun.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell předplatného raket.",
            },
          ],
        },
        "Skating": {
          title: "Brusle — typ, velikost, skill",
          summary: "Inline, led, quad a boardy zamrazí typ před pronájmem.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Typ bruslí/skate, velikost a skill.",
            },
            {
              q: "Chrániče / helma?",
              a: "Uveďte v checklistu — jinak nepředpokládejte.",
            },
            {
              q: "Kauce?",
              a: "Kryje zlomené trucký a chybějící kolečka.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell skate shopu.",
            },
          ],
        },
        "Fishing Gear": {
          title: "Rybaření — třída prutu",
          summary: "Třída prutu/navijáku plus velikost a skill.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Třída prutu/vybavení, velikost a skill.",
            },
            {
              q: "Nálety v ceně?",
              a: "Výčty nástrah a sítí do checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje zlomené pruty a chybějící navijáky.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell fishing značky.",
            },
          ],
        },
        "Competition Gear": {
          title: "Soutěž — třída sportu",
          summary: "Track/field/court třída zamrazí záměr police.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Soutěžní třída, velikost a skill.",
            },
            {
              q: "Pravidla závodu?",
              a: "Host uvede třídu — renter ověří pravidla zvlášť.",
            },
            {
              q: "Kauce?",
              a: "Kryje poškozené náčiní a chybějící zátěže.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell federací.",
            },
          ],
        },
        "Coaching Equipment": {
          title: "Trenink — typ pomůcky",
          summary: "Kužely, vozíky a agility sady zamrazí typ.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Typ trenérské pomůcky, počet a skill.",
            },
            {
              q: "Kolik kusů?",
              a: "Počty do checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící kužely a poškozené překážky.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell trenérských vendorů.",
            },
          ],
        },
        "Timing Systems": {
          title: "Časomíra — typ systému",
          summary: "Hodiny, čipy a photo-finish zamrazí typ.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Typ časomíry, poznámky k napájení a skill.",
            },
            {
              q: "Napájení / setup?",
              a: "Uveďte v checklistu.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící senzory — ne pojištění výsledků.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell timing vendorů.",
            },
          ],
        },
        "Team Sports Gear": {
          title: "Týmové — pásmo + inventář",
          summary: "Míče, branky a ochrana zamrazí pásmo a inventář.",
          qa: [
            {
              q: "Co musí být uvedeno?",
              a: "Pásmo týmové sady, velikost, skill a checklist inventáře.",
            },
            {
              q: "Proč inventář?",
              a: "Týmové tašky ztrácejí kusy — zamrazit před unlock.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící míče a sítě podle seznamu.",
            },
            {
              q: "Partner promo?",
              a: "Žádný hard-sell team store.",
            },
          ],
        },
        "Other": {
          title: "Sport other — přesuňte na pojmenovanou polici",
          summary: "Catch-all stále publikuje druh a inventář.",
          qa: [
            {
              q: "Kdy Other?",
              a: "Jen když nepasuje pojmenovaná Sports police.",
            },
            {
              q: "Jaké brány?",
              a: "sportsOtherKind plus checklist, velikost a skill.",
            },
            {
              q: "Přesun?",
              a: "Na Snow, Water, Racket, Skating, Fishing, Team nebo pro police.",
            },
            {
              q: "Kauce?",
              a: "Kryje chybějící kusy podle checklistu.",
            },
          ],
        },
      },
    "Photo & Video": {
        "Camera Kits": {
          title: "Camera kits \u2014 sensor, media, kit list",
          summary: "Bodies and kits freeze sensor/mount, media policy, and inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Model, kit class, sensor/mount, media include, and kit inventory items/checklist.",
            },
            {
              q: "Body only vs full kit?",
              a: "kitIncludes freezes body-only, kit lens, full kit, or accessories-only.",
            },
            {
              q: "Deposit?",
              a: "Covers drops and missing batteries/chargers/cards against the list.",
            },
            {
              q: "Partner promo?",
              a: "No retailer affiliate hard-sell.",
            },
          ],
        },
        "Action Cameras": {
          title: "Action cameras \u2014 mount, media, sensor",
          summary: "Action cams freeze sensor class, media, and mounts in the kit list.",
          qa: [
            {
              q: "What must be listed?",
              a: "Model, kit class, sensor/mount band, media policy, and inventory for mounts/batteries.",
            },
            {
              q: "Waterproof housing?",
              a: "Disclose in kit checklist \u2014 assume not included unless listed.",
            },
            {
              q: "Media?",
              a: "Hosts mark cards included, partial, renter brings, or internal-only.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts.",
            },
          ],
        },
        "Tripods & Mounts": {
          title: "Tripods \u2014 payload, head type",
          summary: "Supports freeze payload band and head type before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Payload band, head type, kit class, and inventory for plates/spreaders.",
            },
            {
              q: "Will it hold my camera?",
              a: "Payload band is the host\u2019s rated class \u2014 not a lab certification.",
            },
            {
              q: "Head included?",
              a: "Hosts mark ball, pan-tilt, fluid, gimbal head, legs-only, or other.",
            },
            {
              q: "Deposit?",
              a: "Covers bent legs and missing plates.",
            },
          ],
        },
        "Basic Lighting": {
          title: "Basic lighting \u2014 class, power",
          summary: "LED/flash kits freeze lighting class and power source.",
          qa: [
            {
              q: "What must be listed?",
              a: "Lighting class, power source, kit class, and stands/modifiers in inventory.",
            },
            {
              q: "Battery or AC?",
              a: "Power source freezes AC, battery, both, or passive modifiers only.",
            },
            {
              q: "Deposit?",
              a: "Covers broken mounts and missing softboxes \u2014 not lamp life insurance.",
            },
            {
              q: "Partner promo?",
              a: "No lighting-vendor affiliate hard-sell.",
            },
          ],
        },
        "Drones": {
          title: "Drones \u2014 weight class, Remote ID",
          summary: "Drone rentals freeze FAA-style weight class and Remote ID hardware status.",
          qa: [
            {
              q: "What gates apply?",
              a: "Weight class and Remote ID (built-in, add-on, or under-250g exempt). Exempt requires under-250g weight.",
            },
            {
              q: "Pilot license?",
              a: "Follow local law \u2014 Evorios freezes Remote ID facts; it does not issue certificates.",
            },
            {
              q: "Kit?",
              a: "Batteries, props, and controllers belong on the kit inventory.",
            },
            {
              q: "Partner promo?",
              a: "No drone-insurance affiliate hard-sell.",
            },
          ],
        },
        "Cinema Cameras": {
          title: "Cinema cameras \u2014 sensor, media",
          summary: "Cinema bodies freeze sensor class and media policy plus kit inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Sensor/mount class, media include, kit class, and full inventory for cages/batteries.",
            },
            {
              q: "Who brings media?",
              a: "Media field freezes included vs renter-provided cinema media.",
            },
            {
              q: "Deposit?",
              a: "High-value deposit covers body and missing modules \u2014 not production insurance.",
            },
            {
              q: "Partner promo?",
              a: "No cinema-rental-house affiliate hard-sell.",
            },
          ],
        },
        "Professional Lenses": {
          title: "Lenses \u2014 mount, focal band",
          summary: "Lenses freeze mount and focal class before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Mount type, focal band, model, and caps/hoods in kit inventory.",
            },
            {
              q: "Will it fit my body?",
              a: "Mount field is the gate \u2014 adapters only if listed in the kit.",
            },
            {
              q: "Deposit?",
              a: "Covers glass damage and missing caps \u2014 fungus disclosure belongs in notes.",
            },
            {
              q: "Partner promo?",
              a: "No lens-subscription affiliate hard-sell.",
            },
          ],
        },
        "Studio Lighting": {
          title: "Studio lighting \u2014 class, power",
          summary: "Studio lights freeze class and power like basic lighting with heavier kits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Lighting class, power source, kit class, and inventory for stands/c-stands.",
            },
            {
              q: "HMI / Fresnel?",
              a: "Class field includes HMI/Fresnel \u2014 confirm power needs before pickup.",
            },
            {
              q: "Deposit?",
              a: "Covers heads and modifiers; bulbs disclosed separately in notes.",
            },
            {
              q: "Partner promo?",
              a: "No studio-expendables affiliate hard-sell.",
            },
          ],
        },
        "Stabilizers & Rigs": {
          title: "Stabilizers \u2014 type, payload",
          summary: "Gimbals and rigs freeze type and payload band.",
          qa: [
            {
              q: "What must be listed?",
              a: "Stabilizer type, payload band, kit class, and batteries/cages in inventory.",
            },
            {
              q: "Payload?",
              a: "Payload band is host-rated \u2014 balance and tune at handoff.",
            },
            {
              q: "Deposit?",
              a: "Covers motors and missing batteries/chargers.",
            },
            {
              q: "Partner promo?",
              a: "No gimbal-brand affiliate hard-sell.",
            },
          ],
        },
        "Broadcast Gear": {
          title: "Broadcast \u2014 subtype, media",
          summary: "Switchers and encoders freeze subtype and media/capture policy.",
          qa: [
            {
              q: "What gates apply?",
              a: "Broadcast subtype, media include, kit class, and I/O cables in inventory.",
            },
            {
              q: "Switcher vs encoder?",
              a: "Subtype stops wrong-box bookings for livestream days.",
            },
            {
              q: "Deposit?",
              a: "Covers ports and missing SDI/HDMI kits.",
            },
            {
              q: "Partner promo?",
              a: "No broadcast-integrator affiliate hard-sell.",
            },
          ],
        },
        "Other": {
          title: "Photo other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind and kit inventory.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Photo shelf fits.",
            },
            {
              q: "What gates publish?",
              a: "Kind, model, kit class, and kit inventory checklist.",
            },
            {
              q: "Re-shelf?",
              a: "Move to Camera Kits, Action, Tripods, Lighting, Drones, Cinema, Lenses, Stabilizers, or Broadcast when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no gear-affiliate hard-sell.",
            },
          ],
        },
      },
    "Office & Business": {
        "Printers": {
          title: "Printers \u2014 tech, paper, ink, storage wipe",
          summary: "Office printers rent cleanly when tech, paper size, ink/toner, and storage/wipe are frozen.",
          qa: [
            {
              q: "What gates apply?",
              a: "Brand, model, printer tech, paper size, ink/toner include, storage status, and wipe plan when storage is present.",
            },
            {
              q: "Is ink included?",
              a: "Hosts mark ink/toner included, partial, renter provides, or unknown\u2014assume nothing ships full unless listed.",
            },
            {
              q: "Do printers need a wipe?",
              a: "Yes when the unit has onboard storage or accounts. Host declares wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers jams beyond fair wear, missing trays/cables, and physical damage\u2014not print-quality insurance.",
            },
          ],
        },
        "Monitors & Displays": {
          title: "Monitors \u2014 size, panel, inputs",
          summary: "Displays need size, panel, and input/cable kit before rent.",
          qa: [
            {
              q: "What must be listed?",
              a: "Size band, panel type, inputs/cables, storage status (usually no), and a kit checklist for stands/adapters.",
            },
            {
              q: "Are cables included?",
              a: "Input kit freezes HDMI-only through multi-input kits\u2014do not assume a dock ships.",
            },
            {
              q: "Wipe?",
              a: "Only if the display stores accounts or schedules; most panels are no_storage.",
            },
            {
              q: "Partner promo?",
              a: "No monitor-affiliate hard-sell.",
            },
          ],
        },
        "Webcams & Streaming": {
          title: "Webcams \u2014 resolution, mic, wipe",
          summary: "Streaming cams freeze resolution, mic include, and storage/wipe when accounts remain.",
          qa: [
            {
              q: "What gates apply?",
              a: "Resolution band, mic include, storage status, wipe when storage/accounts, and kit list for mounts/cables.",
            },
            {
              q: "Built-in mic?",
              a: "Hosts mark built-in, none, or external mic kit.",
            },
            {
              q: "Accounts?",
              a: "If the cam stays linked to a host account, mark storage and publish a wipe/unlink plan.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked housings and missing mounts\u2014not stream-quality guarantees.",
            },
          ],
        },
        "Office Furniture": {
          title: "Office furniture \u2014 type, size, condition",
          summary: "Desks and chairs skip device wipe; freeze type, size/seats, and condition.",
          qa: [
            {
              q: "What gates apply?",
              a: "Furniture type, size/seat band, and condition grade. No device storage wipe on this shelf.",
            },
            {
              q: "Assembly?",
              a: "Publish what ships assembled vs flat-pack in notes/kit list. Deposit covers missing hardware.",
            },
            {
              q: "Data wipe?",
              a: "Not required for furniture\u2014use Printers/POS/Servers for devices with storage.",
            },
            {
              q: "Partner promo?",
              a: "No office-furniture affiliate hard-sell.",
            },
          ],
        },
        "Presentation Gear": {
          title: "Presentation \u2014 device, lumens/size, cables",
          summary: "Projectors and screens freeze device type, brightness/size, and storage/wipe when networked.",
          qa: [
            {
              q: "What must be listed?",
              a: "Device type, lumens or screen size, storage status, wipe when applicable, and cable/remote kit.",
            },
            {
              q: "Lamp / bulb?",
              a: "Disclose remaining lamp life in notes when known. Deposit is not a free lamp replacement plan.",
            },
            {
              q: "Wipe?",
              a: "Networked conference displays with accounts need storage + wipe status.",
            },
            {
              q: "Deposit?",
              a: "Covers cracked screens, missing remotes/cables, and drop damage.",
            },
          ],
        },
        "Large Format Printers": {
          title: "Large format \u2014 width, ink class, wipe",
          summary: "Plotters need max width, ink class, ink include, and wipe when jobs are stored.",
          qa: [
            {
              q: "What gates apply?",
              a: "Max media width, ink class, ink/toner include, storage + wipe, and kit inventory for stands/roll holders.",
            },
            {
              q: "Who brings media?",
              a: "Assume renter brings rolls unless the kit list says media is included.",
            },
            {
              q: "Wipe?",
              a: "Required when onboard storage holds jobs\u2014host wipe plan freezes before booking.",
            },
            {
              q: "Partner promo?",
              a: "No plotter-lease affiliate hard-sell.",
            },
          ],
        },
        "POS Systems": {
          title: "POS \u2014 terminal, payments, wipe",
          summary: "POS rentals freeze terminal type, payment readiness, and a wipe plan for stored credentials.",
          qa: [
            {
              q: "What must be listed?",
              a: "POS type, payment readiness, storage status, wipe plan, and kit list for drawers/readers/cables.",
            },
            {
              q: "Who provides the card reader?",
              a: "Reader included, software-only, renter brings reader, or cash-only kit.",
            },
            {
              q: "Wipe required?",
              a: "Yes when storage is present or unknown\u2014POS holds merchant credentials. Host wipe status is required.",
            },
            {
              q: "Cyber cover?",
              a: "Evorios does not sell cyber insurance\u2014wipe attestation is the privacy layer.",
            },
          ],
        },
        "Commercial Copiers": {
          title: "Copiers \u2014 duty, finishers, wipe",
          summary: "Commercial copiers freeze duty class, finishers, ink, and wipe for stored jobs.",
          qa: [
            {
              q: "What gates apply?",
              a: "Duty band, finishers, ink/toner include, storage + wipe, and move notes in the kit list.",
            },
            {
              q: "Finisher?",
              a: "Hosts mark stapler finisher, booklet, none, or unknown.",
            },
            {
              q: "Wipe?",
              a: "Copiers with hard disks need wipe-before-list, wipe-at-handoff, or renter-responsible.",
            },
            {
              q: "Deposit?",
              a: "Covers panels, trays, and finishers\u2014not print SLA insurance.",
            },
          ],
        },
        "Conference Systems": {
          title: "Conference \u2014 system, seats, wipe",
          summary: "Room kits freeze system type, seat band, and wipe when accounts remain linked.",
          qa: [
            {
              q: "What must be listed?",
              a: "System type, seat/room band, storage status, wipe when accounts exist, and mic/cam kit list.",
            },
            {
              q: "Room size fit?",
              a: "Seat band (huddle through hall) sets expectation\u2014do not book a huddle kit for a 20-person room.",
            },
            {
              q: "Accounts?",
              a: "Zoom/Teams room logins count as storage\u2014publish unlink/wipe status.",
            },
            {
              q: "Partner promo?",
              a: "No conference-vendor affiliate hard-sell.",
            },
          ],
        },
        "Server Equipment": {
          title: "Servers \u2014 form factor, wipe, rack notes",
          summary: "Servers and NAS always need a wipe plan plus form factor and rack/power notes.",
          qa: [
            {
              q: "What gates apply?",
              a: "Form factor, storage status, required wipe plan, and recommended rack/power notes plus kit inventory.",
            },
            {
              q: "Is wipe optional?",
              a: "No\u2014server shelves require wipe-before-list, wipe-at-handoff, or renter-responsible before publish.",
            },
            {
              q: "Rack rails?",
              a: "Publish rails/PDU/network needs in rack notes. Deposit is not a free install tech.",
            },
            {
              q: "Cyber cover?",
              a: "Platform does not insure data loss\u2014wipe attestation is mandatory.",
            },
          ],
        },
        "Other": {
          title: "Office other \u2014 re-shelf when named fits",
          summary: "Catch-all still publishes kind, storage/wipe when needed, and kit list.",
          qa: [
            {
              q: "When use Other?",
              a: "Only when no named Office shelf fits. Named shelves carry wipe, size, or duty gates renters expect.",
            },
            {
              q: "What still gates publish?",
              a: "Kind, model, storage/wipe for devices, and kit inventory (except pure furniture kinds).",
            },
            {
              q: "Re-shelf?",
              a: "Move to Printers, Monitors, Webcams, Furniture, Presentation, Large Format, POS, Copiers, Conference, or Servers when those gates fit.",
            },
            {
              q: "Essays or promo?",
              a: "No vague essays and no office-supply affiliate hard-sell.",
            },
          ],
        },
      },
    "Music & Audio": {
        "Guitars & Bass": {
          title: "Kytary a baskytary \u2014 typ, kufr, struny, kabel",
          summary: "Peer kytary a baskytary funguj\u00ed, kdy\u017e jsou typ, kufr, stav strun, kabel a kr\u00e1tk\u00fd checklist zmrazen\u00e9 se s\u00e9riov\u00fdm \u010d\u00edslem a kauc\u00ed.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "P\u016fj\u010den\u00ed zmraz\u00ed zna\u010dku, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ n\u00e1stroje, kufr, stav strun, kabel a doporu\u010den\u00fd checklist (popruh, trs\u00e1tka, capo).",
            },
            {
              q: "Tvrd\u00fd kufr nebo gig bag?",
              a: "Hostitel ozna\u010d\u00ed tvrd\u00fd kufr, m\u011bkk\u00fd gig bag, flight case, bez kufru nebo voliteln\u00fd dopln\u011bk. Nic nep\u0159edpokl\u00e1dejte.",
            },
            {
              q: "Kdo nese kabel?",
              a: "Kabel v cen\u011b, nen\u00ed v cen\u011b, jen wireless, nebo se domluv\u00edte p\u0159i p\u0159ed\u00e1n\u00ed.",
            },
            {
              q: "Stav strun?",
              a: "Nov\u00e9, dobr\u00e9/hrateln\u00e9, opot\u0159eben\u00e9, nebo se zeptejte hostitele. Nen\u00ed to slu\u017eba v\u00fdm\u011bny strun.",
            },
            {
              q: "Kauce a reklamace?",
              a: "Kauce kryje po\u0161kozen\u00ed t\u011bla, chyb\u011bj\u00edc\u00ed kufr/kabel a po\u0161kozen\u00fd hardware. Evorios neprod\u00e1v\u00e1 poji\u0161t\u011bn\u00ed kytar.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "Pokud nen\u00ed uvedeno: zesilova\u010d, ped\u00e1ly, v\u00fdm\u011bna strun, lekce a affiliate Guitar Center / Sweetwater.",
            },
          ],
        },
        "Keyboards": {
          title: "Kl\u00e1vesy \u2014 typ, po\u010det kl\u00e1ves, stojan, nap\u00e1jen\u00ed",
          summary: "Digit\u00e1ln\u00ed piana a synthy pot\u0159ebuj\u00ed typ, po\u010det kl\u00e1ves, stojan/ped\u00e1ly, t\u0159\u00eddu v\u00fdkonu, kufr a checklist.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ, po\u010det kl\u00e1ves, stojan/ped\u00e1ly, v\u00fdkon, kufr a checklist.",
            },
            {
              q: "88 kl\u00e1ves vs kompakt?",
              a: "P\u00e1smo po\u010dtu kl\u00e1ves (25\u201388) ur\u010duje pou\u017eitelnost. Kontrolery nejsou v\u00e1\u017een\u00e1 piana.",
            },
            {
              q: "Jsou stojan a ped\u00e1ly v cen\u011b?",
              a: "Stojan+ped\u00e1ly, jen stojan, jen ped\u00e1ly, nic (zajist\u00ed n\u00e1jemce), nebo vestav\u011bn\u00fd console.",
            },
            {
              q: "T\u0159\u00edda v\u00fdkonu?",
              a: "Do 50 W a\u017e 1000 W+ nebo pasivn\u00ed. Ov\u011b\u0159te z\u00e1suvku p\u0159ed akc\u00ed.",
            },
            {
              q: "Kauce?",
              a: "Chyb\u011bj\u00edc\u00ed ped\u00e1ly, stojany a nap\u00e1jec\u00ed zdroje jdou z kauce. Bez poji\u0161t\u011bn\u00ed kl\u00e1ves.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "Lavice pokud nen\u00ed uvedena, licence DAW, retail affiliate.",
            },
          ],
        },
        "Drums": {
          title: "Bic\u00ed \u2014 typ sady, kusy, hardware",
          summary: "Akustick\u00e9 a e-sady pot\u0159ebuj\u00ed typ, po\u010det kus\u016f, hardware a pln\u00fd invent\u00e1\u0159 \u010dinel\u016f a stojan\u016f.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ sady, po\u010det kus\u016f, hardware a checklist v\u0161ech bubn\u016f, \u010dinel\u016f a stojan\u016f.",
            },
            {
              q: "Cel\u00e1 sada nebo jeden kus?",
              a: "Typ odd\u011bluje akustickou sadu, e-kit, jen snare, pack \u010dinel\u016f, jen hardware, hand percussion nebo jin\u00e9.",
            },
            {
              q: "Je hardware v cen\u011b?",
              a: "Pln\u00fd hardware+stoli\u010dka+ped\u00e1ly, jen stojany, jen ped\u00e1ly, nic, nebo e-kit rack. Chyb\u011bj\u00edc\u00ed stoli\u010dka/ped\u00e1ly jsou \u010dast\u00e9 spory.",
            },
            {
              q: "Pro\u010d checklist kus\u016f?",
              a: "\u010cinely a svorky miz\u00ed po koncertech. Potvr\u010fte seznam p\u0159i rezervaci; spo\u010d\u00edtejte p\u0159i p\u0159ed\u00e1n\u00ed a vr\u00e1cen\u00ed.",
            },
            {
              q: "Kauce?",
              a: "Praskl\u00e9 korpusy, chyb\u011bj\u00edc\u00ed \u010dinely a ohnut\u00e9 stojany jdou z kauce \u2014 ne poji\u0161t\u011bn\u00ed bic\u00edch.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd cartage crew, \u017e\u00e1dn\u00fd affiliate practice-pad, \u017e\u00e1dn\u00e9 p\u0159edplatn\u00e9 mesh head.",
            },
          ],
        },
        "Portable Speakers": {
          title: "P\u0159enosn\u00e9 reproduktory \u2014 typ, nap\u00e1jen\u00ed, splash, nabit\u00ed",
          summary: "Spot\u0159ebitelsk\u00e9/party Bluetooth reproduktory pot\u0159ebuj\u00ed typ, zdroj, venkovn\u00ed/splash p\u00e1smo a pravidlo nabit\u00ed \u2014 ne stage PA.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ, v\u00fdkon, baterie vs AC, splash, nabit\u00ed p\u0159i vr\u00e1cen\u00ed a checklist.",
            },
            {
              q: "Je to PA Systems?",
              a: "Ne. Portable Speakers je consumer/party. Stage stacky se stojany a XLR pat\u0159\u00ed do PA Systems.",
            },
            {
              q: "Baterie nebo AC?",
              a: "Jen baterie, jen AC, dual, nebo pasivn\u00ed. Pravidla nabit\u00ed plat\u00ed u bateriov\u00fdch jednotek.",
            },
            {
              q: "Venku / splash?",
              a: "Jen indoor, kryt\u00e1 terasa OK, splash-resistant, nebo udr\u017eet v suchu.",
            },
            {
              q: "Hlasitost v\u016f\u010di soused\u016fm?",
              a: "Hostitel m\u016f\u017ee p\u0159idat m\u011bkkou pozn\u00e1mku k no\u010dn\u00edmu klidu. Evorios necertifikuje HOA.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd Geek Squad, \u017e\u00e1dn\u00fd Fat Llama PA upsell, \u017e\u00e1dn\u00e9 stage wattage z PA police.",
            },
          ],
        },
        "Microphones": {
          title: "Mikrofony \u2014 typ, phantom, kabel, hygiena",
          summary: "Mikrofony pot\u0159ebuj\u00ed typ, 48V, klip/kabel, kufr, hygienu m\u0159\u00ed\u017eky a s\u00e9riov\u00e9 \u010d\u00edslo.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ, phantom, klip/kabel, kufr, hygiena a checklist.",
            },
            {
              q: "Pot\u0159ebuji 48V phantom?",
              a: "Ano / ne / voliteln\u011b / bateriov\u00fd mic / zeptejte se. Kondenz\u00e1tory bez phantomu nehraj\u00ed.",
            },
            {
              q: "Kabel a klip?",
              a: "XLR+klip, jen kabel, jen klip, wireless kit, nebo zajist\u00ed n\u00e1jemce.",
            },
            {
              q: "Hygiena m\u0159\u00ed\u017eky?",
              a: "Ot\u0159\u00edt p\u0159ed vr\u00e1cen\u00edm, hostitel sanitizuje, jednor\u00e1zov\u00fd kryt, nebo bez kontaktu \u00fast.",
            },
            {
              q: "Kauce?",
              a: "Ohnut\u00e9 m\u0159\u00ed\u017eky, chyb\u011bj\u00edc\u00ed klipy/kabely a vlhkost nad politikou jdou z kauce.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd Sweetwater mic bundle, \u017e\u00e1dn\u00fd vocal coach, \u017e\u00e1dn\u00e1 frekven\u010dn\u00ed koordinace.",
            },
          ],
        },
        "Amplifiers": {
          title: "Zesilova\u010de \u2014 typ, lampy/SS, box, v\u00fdkon",
          summary: "Comba a heady pot\u0159ebuj\u00ed typ, lampy vs SS, box, t\u0159\u00eddu v\u00fdkonu a checklist kabel\u016f.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ amp, tube/SS/modeling, box, v\u00fdkon a checklist.",
            },
            {
              q: "Combo vs head/cab?",
              a: "Pole typu a boxu \u0159\u00edk\u00e1, zda jede reprobox. Head bez boxu pot\u0159ebuje v\u00e1\u0161 cab.",
            },
            {
              q: "Lampy vs SS?",
              a: "Lampy pot\u0159ebuj\u00ed zah\u0159\u00e1t\u00ed a opatrn\u00fd p\u0159esun; modeling je digit\u00e1ln\u00ed.",
            },
            {
              q: "T\u0159\u00edda v\u00fdkonu?",
              a: "Sla\u010fte s m\u00edstem a sousedy. Pasivn\u00ed znamen\u00e1 extern\u00ed cestu reproduktoru.",
            },
            {
              q: "Kauce?",
              a: "Upadl\u00e1 comba, chyb\u011bj\u00edc\u00ed footswitche a sp\u00e1len\u00e9 lampy p\u0159i zneu\u017eit\u00ed jdou z kauce.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd bias tech, \u017e\u00e1dn\u00e9 p\u0159edplatn\u00e9 lamp, \u017e\u00e1dn\u00fd Guitar Center demo affiliate.",
            },
          ],
        },
        "Mixing Consoles": {
          title: "Mix\u00e1\u017en\u00ed pulty \u2014 kan\u00e1ly, powered, phantom",
          summary: "\u017div\u00e9 a install mixery pot\u0159ebuj\u00ed p\u00e1smo kan\u00e1l\u016f, powered vs unpowered, phantom, v\u00fdkon a loom kabel\u016f.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, kan\u00e1ly, powered/unpowered, phantom, v\u00fdkon a checklist snake/XLR.",
            },
            {
              q: "Kolik kan\u00e1l\u016f?",
              a: "Do 8 a\u017e 32+ nebo digit\u00e1ln\u00ed scene mixer.",
            },
            {
              q: "Powered mixer?",
              a: "Powered poh\u00e1n\u00ed reproduktory; unpowered pot\u0159ebuje aktivn\u00ed boxy nebo amp.",
            },
            {
              q: "Phantom?",
              a: "Pole phantom pokr\u00fdv\u00e1 o\u010dek\u00e1v\u00e1n\u00ed 48V pro kondenz\u00e1tory.",
            },
            {
              q: "Kauce?",
              a: "Chyb\u011bj\u00edc\u00ed snaky a nap\u00e1jec\u00ed kabely jdou z kauce.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd FOH engineer, \u017e\u00e1dn\u00fd Dante design, \u017e\u00e1dn\u00fd Sweetwater install affiliate.",
            },
          ],
        },
        "Studio Monitors": {
          title: "Studiov\u00e9 monitory \u2014 p\u00e1r, stojany, v\u00fdkon",
          summary: "Nearfieldy pot\u0159ebuj\u00ed stav p\u00e1ru, stojany/pady, v\u00fdkon a checklist kabel\u016f.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, p\u00e1smo p\u00e1ru, stojany/pady, v\u00fdkon a checklist.",
            },
            {
              q: "Jeden nebo p\u00e1r?",
              a: "Jeden, p\u00e1rovan\u00fd p\u00e1r, 2.1+sub, surround, nebo zeptejte se.",
            },
            {
              q: "Jsou stojany v cen\u011b?",
              a: "Stojany, jen izola\u010dn\u00ed pady, nejsou, nebo desktop nearfield N/A.",
            },
            {
              q: "T\u0159\u00edda v\u00fdkonu?",
              a: "Aktivn\u00ed monitory pot\u0159ebuj\u00ed z\u00e1suvky; pasivn\u00ed pot\u0159ebuj\u00ed zes\u00edlen\u00ed.",
            },
            {
              q: "Kauce?",
              a: "Chyb\u011bj\u00edc\u00ed druh\u00fd kus p\u00e1ru, stojany nebo nap\u00e1jen\u00ed jdou z kauce.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00e1 akustick\u00e1 \u00faprava m\u00edstnosti, \u017e\u00e1dn\u00e1 kalibrace, \u017e\u00e1dn\u00fd retail affiliate.",
            },
          ],
        },
        "PA Systems": {
          title: "PA syst\u00e9my \u2014 boxy, mixer, kabely, outdoor",
          summary: "Stage PA pot\u0159ebuje po\u010det box\u016f, mixer, outdoor politiku, v\u00fdkon a povinn\u00fd invent\u00e1\u0159 kabel\u016f/stojan\u016f.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, v\u00fdkon, po\u010det box\u016f, mixer, outdoor politika a povinn\u00fd invent\u00e1\u0159 kabel\u016f/stojan\u016f.",
            },
            {
              q: "Pro\u010d invent\u00e1\u0159 kabel\u016f/stojan\u016f?",
              a: "XLR, Speakon, stojany a rozvod miz\u00ed po akc\u00edch. Invent\u00e1\u0159 se zmraz\u00ed p\u0159i rezervaci a po\u010d\u00edt\u00e1 p\u0159i p\u0159ed\u00e1n\u00ed/vr\u00e1cen\u00ed.",
            },
            {
              q: "Je mixer v cen\u011b?",
              a: "Ano, ne, jen aktivn\u00ed boxy, nebo se domluv\u00edte p\u0159i p\u0159ed\u00e1n\u00ed.",
            },
            {
              q: "Venkovn\u00ed pou\u017eit\u00ed?",
              a: "Jen indoor, kryt\u00fd outdoor OK, pln\u00fd outdoor (riziko po\u010das\u00ed), nebo hostitel nastav\u00ed p\u0159i p\u0159ed\u00e1n\u00ed.",
            },
            {
              q: "Portable Speakers vs PA?",
              a: "Party Bluetooth z\u016fst\u00e1v\u00e1 u Portable Speakers. Kabelov\u00e9 stage stacky zde.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00e1 FOH labor, \u017e\u00e1dn\u00e9 povolen\u00ed hluku, \u017e\u00e1dn\u00fd United Rentals / Fat Llama PA promo.",
            },
          ],
        },
        "Recording Gear": {
          title: "Nahr\u00e1vac\u00ed technika \u2014 typ, I/O, phantom, kufr",
          summary: "Interface a recordery pot\u0159ebuj\u00ed typ, I/O, phantom, kufr, v\u00fdkon a loom \u2014 Music police, ne p\u0159ejmenov\u00e1n\u00ed Electronics Pro Audio.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Zna\u010dka, model, s\u00e9riov\u00e9 \u010d\u00edslo, typ, I/O, phantom, kufr, v\u00fdkon a checklist.",
            },
            {
              q: "Interface vs recorder?",
              a: "Typ odd\u011bluje interface, preamp, field recorder, MIDI/DAW controller, mic+pre bundle, outboard FX nebo jin\u00e9.",
            },
            {
              q: "Kolik vstup\u016f?",
              a: "I/O p\u00e1smo (2\u00d72 a\u017e 8+) ur\u010duje fit session. Not-an-interface kryje controllery a FX.",
            },
            {
              q: "Phantom a kabely?",
              a: "Pole phantom plus checklist USB/Thunderbolt/XLR. Chyb\u011bj\u00edc\u00ed loom jde z kauce.",
            },
            {
              q: "Electronics Pro Audio?",
              a: "Studio capture existuje i pod Electronics. Music Recording Gear dr\u017ete na music polici; neslu\u010dujte s PA wattage.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00e1 licence DAW, \u017e\u00e1dn\u00fd Sweetwater affiliate, \u017e\u00e1dn\u00fd engineer.",
            },
          ],
        },
        "Other": {
          title: "Ostatn\u00ed \u2014 nejd\u0159\u00edv zvolte pojmenovanou Music polici",
          summary: "Preferujte Guitars, Keyboards, Drums, Speakers, Mics, Amps, Mixers, Monitors, PA nebo Recording. Other st\u00e1le pot\u0159ebuje kind, s\u00e9riov\u00e9 \u010d\u00edslo a kit u v\u00edced\u00edln\u00fdch sad.",
          qa: [
            {
              q: "M\u00e1m pou\u017e\u00edt Other?",
              a: "P\u0159esu\u0148te nab\u00eddku na pojmenovanou Music polici, kdykoli sed\u00ed \u2014 aby platily spr\u00e1vn\u00e9 br\u00e1ny v\u00fdkonu, phantomu, PA invent\u00e1\u0159e nebo kufru.",
            },
            {
              q: "Co znamen\u00e1 kind?",
              a: "N\u00e1stroj, live sound, studio, kabel/stojan, mixed kit, nebo preferujte pojmenovanou polici.",
            },
            {
              q: "S\u00e9riov\u00e9 \u010d\u00edslo a kit?",
              a: "S\u00e9riov\u00e9 \u010d\u00edslo je povinn\u00e9 v kategorii. V\u00edced\u00edln\u00e9 sady pot\u0159ebuj\u00ed checklist.",
            },
            {
              q: "T\u0159\u00edda v\u00fdkonu?",
              a: "U nap\u00e1jen\u00fdch v\u011bc\u00ed preferujte pojmenovanou polici se povinn\u00fdm powerBand \u2014 nebo uve\u010fte v\u00fdkon v popisu.",
            },
            {
              q: "Kauce?",
              a: "Fotky + invent\u00e1\u0159 + s\u00e9riov\u00e9 \u010d\u00edslo podporuj\u00ed reklamace.",
            },
            {
              q: "Co nen\u00ed v cen\u011b?",
              a: "\u017d\u00e1dn\u00fd retail affiliate, \u017e\u00e1dn\u00e9 poji\u0161t\u011bn\u00ed backline, \u017e\u00e1dn\u00e1 stage-tech labor.",
            },
          ],
        },
      },
    "Home & Kitchen": {
        "Coffee Makers": {
          title: "K\u00e1vovary \u2014 typ, n\u00e1dr\u017e, filtry",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro drip, espresso a kapsle.",
          qa: [
            {
              q: "Co mus\u00ed hostitel uv\u00e9st?",
              a: "Typ k\u00e1vovaru, n\u00e1dr\u017e, konvici/ko\u0161\u00edk, politiku filtr\u016f/kapsl\u00ed, kapacitu a pravidla vr\u00e1cen\u00ed. Komba pot\u0159ebuj\u00ed invent\u00e1\u0159.",
            },
            {
              q: "Kdo p\u0159inese filtry nebo kapsle?",
              a: "Inzer\u00e1t zmraz\u00ed filtry v cen\u011b, opakovan\u00fd filtr, filtr n\u00e1jemce nebo kapsle zvl\u00e1\u0161\u0165.",
            },
            {
              q: "Jak \u010dist\u011b vr\u00e1tit?",
              a: "Podle politiky \u2014 um\u00fdt/osu\u0161it, opl\u00e1chnout, hostitel sanitizuje, nebo jen vypr\u00e1zdnit.",
            },
            {
              q: "Partner promo?",
              a: "Ne \u2014 \u017e\u00e1dn\u00fd hard-sell k\u00e1vov\u00fdch klub\u016f nebo kapsl\u00ed.",
            },
          ],
        },
        "Baking Equipment": {
          title: "Pe\u010den\u00ed \u2014 kusy, teplota, sanitace",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro plechy, formy a sady.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny plat\u00ed?",
              a: "Typ sady, po\u010det kus\u016f, teplota trouby, materi\u00e1l, sanitace potravinov\u00fdch povrch\u016f a vr\u00e1cen\u00ed. V\u00edcekusov\u00e9 sady pot\u0159ebuj\u00ed invent\u00e1\u0159.",
            },
            {
              q: "Je to do trouby?",
              a: "Hostitel uvede p\u00e1s teploty v\u010detn\u011b broiler-safe nebo not oven-safe.",
            },
            {
              q: "Sanitace?",
              a: "Potravinov\u00e9 povrchy mus\u00ed b\u00fdt potvrzen\u011b sanitizovan\u00e9 p\u0159ed p\u0159ed\u00e1n\u00edm.",
            },
            {
              q: "Kauce?",
              a: "Kryje deformace, chyb\u011bj\u00edc\u00ed kusy a po\u0161kozen\u00ed nep\u0159ilnav\u00e9ho povrchu nad b\u011b\u017en\u00e9 opot\u0159eben\u00ed.",
            },
          ],
        },
        "Stand Mixers": {
          title: "Roboty \u2014 m\u00edsa, n\u00e1stavce, p\u0159\u00edkon",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro tilt-head a bowl-lift.",
          qa: [
            {
              q: "Co mus\u00ed b\u00fdt uvedeno?",
              a: "Kapacita m\u00edsy, sada n\u00e1stavc\u016f, watty, tilt vs bowl-lift, sanitace a vr\u00e1cen\u00ed.",
            },
            {
              q: "Jsou n\u00e1stavce v cen\u011b?",
              a: "Od metly po plnou sadu \u2014 bohat\u00e9 sady pot\u0159ebuj\u00ed checklist.",
            },
            {
              q: "Potravinov\u00fd kontakt?",
              a: "Hostitel potvrzuje sanitaci m\u00eds a metel p\u0159ed p\u0159ed\u00e1n\u00edm.",
            },
            {
              q: "Partner promo?",
              a: "\u017d\u00e1dn\u00fd affiliate KitchenAid ani upsell z\u00e1ruky.",
            },
          ],
        },
        "Blenders & Juicers": {
          title: "Mix\u00e9ry a od\u0161\u0165av\u0148ova\u010de \u2014 n\u00e1doba, no\u017ee, watty",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro stoln\u00ed, ty\u010dov\u00e9 a od\u0161\u0165av\u0148ova\u010de.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny?",
              a: "Typ, materi\u00e1l n\u00e1doby, sada no\u017e\u016f/disk\u016f, p\u0159\u00edkon, sanitace a vr\u00e1cen\u00ed.",
            },
            {
              q: "Kdo dod\u00e1 disky?",
              a: "N\u016f\u017e, n\u016f\u017e+disky, n\u00e1jemce, nebo sealed \u2014 sady disk\u016f pot\u0159ebuj\u00ed invent\u00e1\u0159.",
            },
            {
              q: "Vr\u00e1cen\u00ed?",
              a: "Podle um\u00fdt/opl\u00e1chnout; sanitace potravinov\u00fdch povrch\u016f p\u0159i p\u0159ed\u00e1n\u00ed.",
            },
            {
              q: "Kauce?",
              a: "Kryje praskl\u00e9 n\u00e1doby, chyb\u011bj\u00edc\u00ed no\u017ee/disky a zneu\u017eit\u00ed motoru.",
            },
          ],
        },
        "Cleaning Appliances": {
          title: "\u00daklidov\u00e9 spot\u0159ebi\u010de \u2014 typ, n\u00e1dr\u017ee, filtry",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro vysava\u010de, koberce a p\u00e1ru.",
          qa: [
            {
              q: "Co uv\u00e9st?",
              a: "Typ, nap\u00e1jen\u00ed, s\u00e1\u010dek/n\u00e1dr\u017e, filtr, politiku vypr\u00e1zdn\u011bn\u00ed, kapacitu a vr\u00e1cen\u00ed.",
            },
            {
              q: "Mus\u00edm vypr\u00e1zdnit?",
              a: "Politika \u0159\u00edk\u00e1 n\u00e1jemce, hostitel, nebo neplat\u00ed.",
            },
            {
              q: "Filtry?",
              a: "HEPA, standard, omyvateln\u00fd, nebo nen\u00ed v cen\u011b.",
            },
            {
              q: "Sanitace potravin?",
              a: "U \u00faklidu nen\u00ed nutn\u00e1 \u2014 vypr\u00e1zdn\u011bn\u00ed a \u010dist\u00e9 vr\u00e1cen\u00ed ano.",
            },
          ],
        },
        "Commercial Coffee": {
          title: "Gastro k\u00e1va \u2014 nap\u011bt\u00ed, NSF, instalace",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro kav\u00e1rensk\u00e9 a event syst\u00e9my.",
          qa: [
            {
              q: "Jak\u00e9 P0 br\u00e1ny?",
              a: "Nap\u011bt\u00ed, NSF, instalace, typ, zm\u011bk\u010dova\u010d, t\u0159\u00edda slu\u017eby, invent\u00e1\u0159, kapacita, vr\u00e1cen\u00ed.",
            },
            {
              q: "Pro\u010d nap\u011bt\u00ed a voda?",
              a: "\u0160patn\u00e9 nap\u011bt\u00ed nebo chyb\u011bj\u00edc\u00ed voda akci pokaz\u00ed \u2014 fakta jsou na smlouv\u011b.",
            },
            {
              q: "Certifikuje Evorios NSF?",
              a: "Ne \u2014 hostitel deklaruje NSF; my necertifikujeme.",
            },
            {
              q: "Partner promo?",
              a: "\u017d\u00e1dn\u00fd hard-sell financov\u00e1n\u00ed gastro vybaven\u00ed.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Dom\u00e1c\u00ed catering \u2014 po\u010det host\u016f, oh\u0159ev, sanitace",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro chafing, cambro a serv\u00edrov\u00e1n\u00ed.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny?",
              a: "Typ, kapacita host\u016f, oh\u0159ev, proud, NSF, dvoj\u00ed sanitace, invent\u00e1\u0159 a vr\u00e1cen\u00ed.",
            },
            {
              q: "Sterno vs elekt\u0159ina?",
              a: "Metoda oh\u0159evu zmraz\u00ed sterno, elekt\u0159inu, izolaci, chlazen\u00ed nebo mix.",
            },
            {
              q: "Sanitace?",
              a: "Potravinov\u00e1 i cateringov\u00e1 sanitace mus\u00ed b\u00fdt potvrzena p\u0159ed p\u0159ed\u00e1n\u00edm.",
            },
            {
              q: "Party vs Home?",
              a: "Event AV/dekor z\u016fst\u00e1v\u00e1 na Party; chafing/cambro sem, kdy\u017e jde o kuchy\u0148sk\u00fd catering.",
            },
          ],
        },
        "Industrial Mixers": {
          title: "Pr\u016fmyslov\u00e9 mix\u00e9ry \u2014 m\u00edsa, f\u00e1ze, NSF",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro planet\u00e1rn\u00ed a spir\u00e1lov\u00e9.",
          qa: [
            {
              q: "Co uv\u00e9st?",
              a: "Qt m\u00edsy, styl, f\u00e1ze, nap\u011bt\u00ed, NSF, sanitace, invent\u00e1\u0159, kapacita, vr\u00e1cen\u00ed a pozn\u00e1mky k p\u0159esunu.",
            },
            {
              q: "1 vs 3 f\u00e1ze?",
              a: "F\u00e1ze a nap\u011bt\u00ed mus\u00ed sed\u011bt na m\u00edsto p\u0159ed dovozem.",
            },
            {
              q: "P\u0159esun?",
              a: "Uve\u010fte hmotnost/dve\u0159e/zved\u00e1k \u2014 to nen\u00ed v\u00fddej na verand\u011b.",
            },
            {
              q: "Partner promo?",
              a: "\u017d\u00e1dn\u00fd affiliate leasing pek\u00e1ren.",
            },
          ],
        },
        "Food Processors Pro": {
          title: "Pro procesory \u2014 m\u00edsa, pod\u00e1v\u00e1n\u00ed, disky",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro batch a continuous-feed.",
          qa: [
            {
              q: "Jak\u00e9 br\u00e1ny?",
              a: "Kapacita m\u00edsy, typ pod\u00e1v\u00e1n\u00ed, sada disk\u016f, nap\u011bt\u00ed, NSF, sanitace, vr\u00e1cen\u00ed. Sady disk\u016f pot\u0159ebuj\u00ed invent\u00e1\u0159.",
            },
            {
              q: "Kdo p\u0159inese disky?",
              a: "Z\u00e1kladn\u00ed n\u016f\u017e, sady disk\u016f, nebo disky n\u00e1jemce.",
            },
            {
              q: "Sanitace?",
              a: "Potravinov\u00e9 povrchy potvrzeny p\u0159ed p\u0159ed\u00e1n\u00edm.",
            },
            {
              q: "Kauce?",
              a: "Kryje chyb\u011bj\u00edc\u00ed disky, praskl\u00e9 m\u00edsy a po\u0161kozen\u00ed pohonu.",
            },
          ],
        },
        "Beverage Systems": {
          title: "N\u00e1pojov\u00e9 syst\u00e9my \u2014 plyn, voda, NSF",
          summary: "Kr\u00e1tk\u00e9 odpov\u011bdi pro kegerator, sodu a v\u011b\u017ee.",
          qa: [
            {
              q: "Co uv\u00e9st?",
              a: "Typ, CO\u2082/sirup, instalace vody, nap\u011bt\u00ed, NSF, install, sanitace, invent\u00e1\u0159, kapacita, vr\u00e1cen\u00ed.",
            },
            {
              q: "Pot\u0159ebuji vodu a odpad?",
              a: "Stav instalace zmraz\u00ed autonomn\u00ed, vodu, odpad, nebo oboj\u00ed.",
            },
            {
              q: "Plyn/sirup?",
              a: "CO\u2082, sirupov\u00e9 linky, oboj\u00ed, n\u00e1jemce, nebo nen\u00ed pot\u0159eba.",
            },
            {
              q: "Partner promo?",
              a: "\u017d\u00e1dn\u00fd affiliate dodavatel n\u00e1poj\u016f.",
            },
          ],
        },
        "Other": {
          title: "Home & kitchen jin\u00e9 \u2014 p\u0159esu\u0148te na pojmenovanou polici",
          summary: "Catch-all st\u00e1le vy\u017eaduje typ, kusy, fotky a vr\u00e1cen\u00ed.",
          qa: [
            {
              q: "Kdy Other?",
              a: "Jen kdy\u017e nesed\u00ed pojmenovan\u00e1 police. Pojmenovan\u00e9 maj\u00ed kapacitu, sanitaci, NSF nebo invent\u00e1\u0159.",
            },
            {
              q: "Co st\u00e1le blo\u010d\u00ed publish?",
              a: "Typ, single/multi, fotky, kapacita, vr\u00e1cen\u00ed; multi pot\u0159ebuje invent\u00e1\u0159.",
            },
            {
              q: "P\u0159esun?",
              a: "Na Coffee, Baking, Mixers, Blenders, Cleaning, Commercial Coffee, Catering, Industrial Mixers, Processors nebo Beverage.",
            },
            {
              q: "Eseje nebo promo?",
              a: "\u017d\u00e1dn\u00e9 v\u00e1gn\u00ed eseje ani affiliate spot\u0159ebi\u010d\u016f.",
            },
          ],
        },
      },
    "Real Estate": {
        "Rooms & Spaces": {
          title: "Pokoje a prostory — check-in, nocleh, koupelna, noční klid",
          summary: "Krátkodobé pokoje fungují, když jsou zmrazené check-in okno, nocleh, koupelna, noční klid, velikost, kapacita, přístup a domácí pravidla.",
          qa: [
            {
              q: "Jaké brány platí před pronájmem?",
              a: "Inzerát zmrazí velikost, max. kapacitu, parkování, Wi‑Fi, typ přístupu, check-in okno, nocleh, koupelnu, noční klid, domácí pravidla a volitelný úklid. Při check-inu je povinné selfie/OP.",
            },
            {
              q: "Mohou hosté zůstat přes noc?",
              a: "Hostitel označí nocleh OK, jen denní použití, nebo schválení hostitelem. Denní použití = bez spánku přes noc bez písemného souhlasu.",
            },
            {
              q: "Je koupelna součástí?",
              a: "Soukromá, sdílená, jen WC, žádná na místě, nebo mobilní blízko — nastavte očekávání před rezervací.",
            },
            {
              q: "Jaký je noční klid?",
              a: "Publikované pásmo (např. 22:00 / 23:00 / půlnoc) nebo pravidla budovy. Domácí pravidla doplní hosty, kouření, mazlíčky a checkout.",
            },
            {
              q: "Jaká je výše kauce?",
              a: "Obvykle kolem jednoho měsíčního nájmu, pokud hostitel nenastaví jinak. Úklidový poplatek se při nastavení zmrazí ve smlouvě.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádná Airbnb Instant Book franšíza, žádný hotelový housekeeping produkt a žádné pojištění ubytování od Evorios.",
            },
          ],
        },
        "Garages & Storage": {
          title: "Garáže a sklady — světlá výška, vrata, klima, pravidla použití",
          summary: "Skladovací boxy potřebují světlou výšku, šířku vrat, klima, hodiny přístupu a pravidla povoleného použití plus velikost a domácí pravidla.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí světlou výšku, šířku vrat, klima, hodiny přístupu, politiku skladování, velikost, kapacitu, přístup a domácí pravidla.",
            },
            {
              q: "Vejde se auto nebo regály?",
              a: "Použijte publikovanou světlou výšku a šířku vrat. Větší dodávky potřebují vyšší box — při neznámé výšce se zeptejte před rezervací.",
            },
            {
              q: "Je prostor klimatizovaný?",
              a: "Hostitel označí klimatizaci, jen topení, jen chlazení, okolní teplotu, nebo neznámé. Citlivé zboží v okolním boxu je riziko nájemce.",
            },
            {
              q: "Co smím skladovat?",
              a: "Politika může povolit domácí věci, jen vozidlo, bez nebezpečných látek, bez potravin, nebo hostitelův seznam. Zakázané zboží ruší nároky.",
            },
            {
              q: "Kauce a přístup?",
              a: "Kauce ≈ jeden měsíc, pokud není jinak. Přístup se odemkne po startovním ID hosta — ne jen z přeposlaného potvrzení.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné promo Neighbor/StorageMart, žádné pojištění inventáře od Evorios a žádná 24/7 ostraha, pokud to hostitel neuvede.",
            },
          ],
        },
        "Parking Spots": {
          title: "Parkovací místa — typ, velikost vozu, EV, nocleh",
          summary: "Místa fungují, když jsou zveřejněny typ, velikost vozu, EV nabíjení, noční stání a hodiny přístupu s domácími pravidly.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí typ místa, velikost vozu, EV, noční stání, hodiny přístupu, velikost, typ přístupu a domácí pravidla.",
            },
            {
              q: "Vejde se pickup nebo dodávka?",
              a: "Pásma: kompakt → sedan/SUV → plný pickup → Sprinter → nadrozměr (zeptejte se). Nadrozměr potřebuje potvrzení hostitele.",
            },
            {
              q: "Je EV nabíjení součástí?",
              a: "Level 2 v ceně, sdílená zásuvka, žádné, nebo kabel nájemce. Sdílené zásuvky mohou mít pravidla budovy.",
            },
            {
              q: "Noční stání?",
              a: "Noc OK, jen den, nebo schválení hostitele. Denní místa musí být uvolněna podle pravidel.",
            },
            {
              q: "Kauce a ID?",
              a: "Kauce směřuje k ~jednomu měsíci nájmu. Selfie/OP při startu odemkne přístup.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné affiliate SpotHero/ParkWhiz, žádná obrana parkovacích pokut a žádný EV billing produkt od Evorios.",
            },
          ],
        },
        "Shared Offices": {
          title: "Sdílené kanceláře — stoly, meetingy, hodiny, koupelna",
          summary: "Pronájem stolů potřebuje počet míst, meeting místnost, pracovní hodiny, koupelnu a volitelný monitor/dock kit s domácími pravidly.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí počet stolů, meeting přístup, hodiny, koupelnu, Wi‑Fi, velikost, kapacitu, přístup, domácí pravidla a doporučený monitor/dock.",
            },
            {
              q: "Kolik stolů?",
              a: "1 stůl, 2–4, 5–10, 11+, nebo hot-desk. Kapacita musí zůstat v publikovaném maximu.",
            },
            {
              q: "Jsou meeting místnosti v ceně?",
              a: "V ceně, za příplatek, žádné na místě, nebo jen open space — nepočítejte se soukromou místností.",
            },
            {
              q: "Pracovní doba vs 24/7?",
              a: "Pásmo hodin: 24/7, pracovní doba, extended, jen po domluvě, nebo rozvrh hostitele.",
            },
            {
              q: "Kauce?",
              a: "Typicky kolem jednoho měsíce nájmu. Úklid může platit u privátních suites.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné WeWork členství, žádné IT helpdesk SLA a žádné právní poradenství ke komerčnímu nájmu od Evorios.",
            },
          ],
        },
        "Backyard & Outdoor": {
          title: "Zahrada a outdoor — proud/voda, hluk, počasí, koupelna",
          summary: "Dvorky potřebují proud/vodu, hlukový zákaz, politiku počasí, koupelnu, kapacitu a noční klid s domácími pravidly.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí outdoor proud/vodu, hlukový zákaz, počasí, koupelnu, noční klid, velikost, kapacitu, parkování, přístup a domácí pravidla.",
            },
            {
              q: "Je na místě proud nebo voda?",
              a: "Hostitel označí obojí, jen proud, jen vodu, nic, nebo se zeptejte. Vlastní generátor jen pokud pravidla dovolí.",
            },
            {
              q: "Můžeme pouštět hudbu?",
              a: "Hluková politika může dovolit hudbu do zákazu, zakázat zesílení, jen tiché setkání, HOA pravidla, nebo zákaz hostitele. Porušení může jít z kauce.",
            },
            {
              q: "Co když prší?",
              a: "Za každého počasí, krytý backup, zrušení/přeplanování, nebo rozhodnutí hostitele v den akce.",
            },
            {
              q: "Kauce a ID?",
              a: "Kauce ≈ jeden měsíc. Startovní ID hosta před odemčením.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný Peerspace insurance upsell, žádné catering promo a žádné vyřizování hlukových povolení od Evorios.",
            },
          ],
        },
        "Other": {
          title: "Nemovitosti jiné — uveďte typ prostoru",
          summary: "Catch-all musí deklarovat typ, velikost, kapacitu, přístup a domácí pravidla — přesuňte na pojmenovanou polici, když sedí.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí typ prostoru, velikost, max. kapacitu, parkování, Wi‑Fi, přístup a domácí pravidla. Preferujte pojmenovanou polici.",
            },
            {
              q: "Proč typ prostoru?",
              a: "Říká, zda jde o pokoj, parkování/sklad, kancelář, outdoor, venue/studio, sklad/retail, nebo mix — ať si nájemce neplete produkt.",
            },
            {
              q: "Kauce a check-in?",
              a: "Kauce směřuje k jednomu měsíci. Selfie/OP při startu před odemčením.",
            },
            {
              q: "Úklidový poplatek?",
              a: "Volitelný; když je nastaven, ukáže se při rezervaci a zmrazí se ve smlouvě.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné generické Airbnb promo a žádné platformové pojištění ubytování.",
            },
          ],
        },
        "Commercial Space": {
          title: "Komerční prostor — povolené užití, load-in, hodiny",
          summary: "Pro suites zmrazí povolené užití, load-in, hodiny přístupu, meeting přístup a domácí pravidla s velikostí a kapacitou.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí povolené užití, load-in, hodiny, meeting přístup, velikost, kapacitu, parkování, Wi‑Fi, přístup a domácí pravidla.",
            },
            {
              q: "Jaké užití je povoleno?",
              a: "Kancelář/admin, lehká produkce, schůzky s klienty, soft pop-up, nebo jen hostitelův seznam. Zoning zůstává na hostiteli a nájemci.",
            },
            {
              q: "Jak naložíme techniku?",
              a: "Přízemí snadno, nákladní výtah, jen schody, rampa/dock, nebo curbside — naplánujte posádku předem.",
            },
            {
              q: "Kauce?",
              a: "Obvykle jeden měsíc nájmu, pokud hostitel nenastaví jinak.",
            },
            {
              q: "ID hosta?",
              a: "Ano — startovní ID/selfie před odemčením, stejně jako u ostatních Real Estate.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné zprostředkování komerčního nájmu, žádný COI marketplace partner a žádná Instant Book office franšíza.",
            },
          ],
        },
        "Event Venues": {
          title: "Event venues — typ akce, alkohol, AV/kuchyň, hluk",
          summary: "Venues potřebují povolený typ akce, alkohol, AV/kuchyň, hlukový zákaz, noční klid, load-in a kapacitu s domácími pravidly.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí typ akce, alkohol, AV/kuchyň, hlukový zákaz, noční klid, load-in, velikost, kapacitu, parkování, přístup a domácí pravidla.",
            },
            {
              q: "Jaké akce jsou povoleny?",
              a: "Jen meetingy, sociální party, svatby/formální, film/foto, nebo mix dle pravidel hostitele.",
            },
            {
              q: "Je alkohol povolen?",
              a: "BYOB OK, jen licencovaný caterer, bez alkoholu, nebo schválení hostitele. Místní zákon stále platí.",
            },
            {
              q: "AV a kuchyň?",
              a: "Obojí, jen AV, jen kuchyň, prázdný sál, nebo částečně — chybějící techniku si přivezte.",
            },
            {
              q: "Kauce a úklid?",
              a: "Kauce ≈ jeden měsíc. Úklidový poplatek často po eventech.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné Peerspace/The Knot affiliate, žádné pojištění akce od Evorios a žádná ostraha, pokud není uvedena.",
            },
          ],
        },
        "Studio Space": {
          title: "Studio — typ, proud, zvuk, cyc/grid",
          summary: "Content studia zmrazí typ studia, pásmo proudu, úpravu zvuku a cyc/grid s přístupem a domácími pravidly.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí typ studia, pásmo proudu, úpravu zvuku, cyc/grid, velikost, kapacitu, Wi‑Fi, parkování, přístup a domácí pravidla.",
            },
            {
              q: "Foto, video, podcast, nebo zkouška?",
              a: "Typ studia nastaví očekávání. Mix místnosti nemusí být šeptavě tiché — zkontrolujte úpravu zvuku.",
            },
            {
              q: "Jaký proud je k dispozici?",
              a: "Domácí okruhy, 20A+ dedicated, třífáz, jen baterie/generátor, nebo se zeptejte na zátěž. Přetížení jističů je riziko nájemce.",
            },
            {
              q: "Je cyc nebo grid?",
              a: "Cyc i grid, jen cyc, jen trubky/grid, prázdná místnost, nebo částečné pozadí.",
            },
            {
              q: "Kauce?",
              a: "Směřuje k jednomu měsíci nájmu. Startovní ID před odemčením.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné Giggster/Peerspace promo, žádný gear kit pokud není uveden, a žádné produkční pojištění od Evorios.",
            },
          ],
        },
        "Warehouse & Storage": {
          title: "Sklad — světlá výška, dock, VZV, klima",
          summary: "Sklady přidávají dock a politiku VZV navíc ke světlé výšce, vratům, klimatu, hodinám a load-in.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí světlou výšku, šířku vrat, klima, dock, VZV politiku, load-in, hodiny, velikost, kapacitu, přístup a domácí pravidla.",
            },
            {
              q: "Dock a VZV?",
              a: "Dock high/low, drive-in, jen zem, nebo sdílený dock. VZV může být s operátorem, jen s certifikací nájemce, žádný, nebo jen paletový vozík.",
            },
            {
              q: "Světlá výška a vrata?",
              a: "Použijte publikovaná pásma před příjezdem box trucků nebo regálů.",
            },
            {
              q: "Klima?",
              a: "Klimatizováno vs okolní — chraňte citlivý inventář.",
            },
            {
              q: "Kauce a ID?",
              a: "Kauce ≈ jeden měsíc. Startovní ID před přístupem.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné Flexe affiliate, žádné cargo pojištění od Evorios a žádný staffovaný VZV, pokud není uveden.",
            },
          ],
        },
        "Retail Space": {
          title: "Retail — výloha, vybavení, load-in, hodiny",
          summary: "Retail suites zmrazí typ výlohy, fixtures, load-in, hodiny přístupu a domácí pravidla s velikostí a kapacitou.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí typ výlohy, fixtures, load-in, hodiny, velikost, kapacitu, parkování, Wi‑Fi, přístup a domácí pravidla.",
            },
            {
              q: "Jaký typ výlohy?",
              a: "Ulice, mall inline, kiosk/pop-up, interiérová suite, nebo sdílený trh — návštěvnost není zaručena.",
            },
            {
              q: "Jsou fixtures v ceně?",
              a: "Fixtures v ceně, jen regály, prázdný vanilla, nebo částečně. Spočítejte, co potřebujete před nastěhováním.",
            },
            {
              q: "Hodiny?",
              a: "Pásmo hodin určuje, kdy smíte prostor užívat. Pravidla mallu/budovy mohou mít přednost.",
            },
            {
              q: "Kauce?",
              a: "Obvykle jeden měsíc nájmu, pokud hostitel nenastaví jinak.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné Storefront.com/Appear Here affiliate, žádné POS promo a žádná registrace DPH od Evorios.",
            },
          ],
        },
      },
    Vehicles: {
        "Cars & Trucks": {
          title: "FAQ půjčení osobního / lehkého auta",
          summary: "Krátké odpovědi pro auta a lehké náklaďáky pod komerční hmotností.",
          qa: [
            {
              q: "Potřebuji CDL?",
              a: "Ne u lehkých osobních aut pod 26 001 lb GVWR, pokud místní zákon nestanoví jinak.",
            },
            {
              q: "Jaké pojištění potřebuji?",
              a: "Platné osobní auto pojištění na toto auto. Nahrajte doklad v aplikaci před odemčením PIN nebo klíčů.",
            },
            {
              q: "Jak funguje storno?",
              a: "Storno ≥24 h před startem: plná refundace. Do 24 h: 50 %.",
            },
            {
              q: "Palivo a pozdní návrat?",
              a: "Palivo plná→plná (+$20 při nedodání). Pozdní návrat: 30 min grace, pak $20 + $15/h.",
            },
            {
              q: "Proč GPS pro PIN?",
              a: "PIN se odemkne jen na místě vyzvednutí (nebo přes QR na autě)—ne přeposlaný kód.",
            },
            {
              q: "Jaké fotky jsou povinné?",
              a: "Předprohlídka karoserie + čtyři pneumatiky před startem; stejná sada při vrácení.",
            },
          ],
        },
        Motorcycles: {
          title: "FAQ půjčení motocyklů",
          summary: "Krátké odpovědi pro motocykly.",
          qa: [
            {
              q: "Potřebuji motocyklovou doložku / endorsement?",
              a: "Ano. Potvrďte platnou motocyklovou doložku (nebo místní ekvivalent) pro jmenovaného jezdce.",
            },
            {
              q: "Stačí běžný řidičák na auto?",
              a: "Ne, pokud tento inzerát vyžaduje motocyklovou doložku.",
            },
            {
              q: "Jaké pojištění potřebuji?",
              a: "Doklad kryjící tuto motorku, nahraný v aplikaci před odemčením PIN nebo klíčů.",
            },
            {
              q: "Helma?",
              a: "Dodržte místní zákon a politiku helem v inzerátu.",
            },
            {
              q: "Jaké fotky jsou povinné?",
              a: "Předprohlídka karoserie a pneumatik před startem; stejná sada při vrácení.",
            },
          ],
        },
        ATVs: {
          title: "FAQ půjčení ATV / OHV",
          summary: "Krátké odpovědi pro ATV a OHV.",
          qa: [
            {
              q: "Je povinné prohlášení o terénu?",
              a: "Ano ve výchozím nastavení—potvrďte riziko terénu OHV / ATV při rezervaci před odemčením vyzvednutí.",
            },
            {
              q: "Jaký řidičák potřebuji?",
              a: "Platný průkaz nebo povolení dle místního OHV zákona a inzerátu.",
            },
            {
              q: "Jaké pojištění potřebuji?",
              a: "Doklad kryjící toto ATV, nahraný před odemčením PIN nebo klíčů.",
            },
            {
              q: "Helma / výbava?",
              a: "Dodržte místní zákon a pravidla helem / výbavy v inzerátu.",
            },
            {
              q: "Jaké fotky jsou povinné?",
              a: "Předprohlídka karoserie a pneumatik před startem; stejná sada při vrácení.",
            },
          ],
        },
        "Tow Vehicles": {
          title: "FAQ půjčení odtahových vozidel",
          summary: "Krátké odpovědi pro odtahy a tow vehicles.",
          qa: [
            {
              q: "Potřebuji CDL?",
              a: "Ano, když je GVWR nebo kombinovaná hmotnost 26 001 lb nebo více (nebo jak vyžaduje místní zákon).",
            },
            {
              q: "Co dalšího je povinné?",
              a: "Platné tow oprávnění dle inzerátu a komerční pojištění agent→majitel, pokud to tato police vyžaduje.",
            },
            {
              q: "Nosnost odtahu?",
              a: "Zůstaňte v publikovaném tow ratingu a třídě tažného zařízení v inzerátu.",
            },
            {
              q: "Jaká prohlídka je povinná?",
              a: "Karoserie a více pneumatik před startem; stejná sada při vrácení.",
            },
            {
              q: "Proč GPS pro PIN?",
              a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód.",
            },
          ],
        },
        Trailers: {
          title: "FAQ půjčení přívěsů",
          summary: "Krátké odpovědi pro lehké / utility přívěsy pod komerční hmotností.",
          qa: [
            {
              q: "Potřebuji CDL?",
              a: "Obvykle ne pod 26 001 lb GVWR—zkontrolujte místní zákon, třídu tažného zařízení a brzdy.",
            },
            {
              q: "Tažné zařízení a světla?",
              a: "Shoda třídy hitch; při předání ověřte světla a brzdy.",
            },
            {
              q: "Jaké pojištění potřebuji?",
              a: "Krytí přívěsu dle inzerátu; nahrajte doklad před předáním.",
            },
            {
              q: "Limity nákladu?",
              a: "Nepřekračujte publikované GVWR ani payload.",
            },
            {
              q: "Jaké fotky jsou povinné?",
              a: "Rám, spojka, pneumatiky a světla při předprohlídce; stejná sada při vrácení.",
            },
          ],
        },
        "Equipment Trailers": {
          title: "FAQ půjčení equipment přívěsů",
          summary: "Krátké odpovědi pro komerční / equipment přívěsy.",
          qa: [
            {
              q: "Potřebuji CDL?",
              a: "Ano, když je GVWR nebo kombinovaná hmotnost 26 001 lb nebo více (nebo jak vyžaduje komerční přeprava).",
            },
            {
              q: "Jak funguje doklad pojištění?",
              a: "Agent pošle komerční / PD doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů.",
            },
            {
              q: "Limity nákladu?",
              a: "Nepřekračujte publikované GVWR ani payload.",
            },
            {
              q: "Jaká prohlídka je povinná?",
              a: "Fotky rámu a všech kol před startem; stejná sada při vrácení.",
            },
            {
              q: "Proč GPS pro PIN?",
              a: "PIN nebo schránka se odemkne jen na místě vyzvednutí nebo přes QR vozidla—ne přeposlaný kód.",
            },
          ],
        },
        "Commercial Trucks": {
          title: "FAQ půjčení komerčních náklaďáků",
          summary: "Krátké odpovědi pro komerční náklaďáky a semi.",
          qa: [
            {
              q: "Potřebuji CDL?",
              a: "Ano, pokud je GVWR 26 001 lb nebo více (nebo jak vyžaduje místní zákon).",
            },
            {
              q: "Jakou hmotnost zadávám?",
              a: "GVWR v librách—ne hodnotu v dolarech.",
            },
            {
              q: "Jak funguje doklad pojištění?",
              a: "Agent nájemce pošle doklad e-mailem na adresu majitele v inzerátu před odemčením PIN nebo klíčů.",
            },
            {
              q: "Je povinné physical damage (PD)?",
              a: "Ano. Limity PD vycházejí z GVWR (lb); hold depozitu sleduje komerční spoluúčast / PD.",
            },
            {
              q: "Jaká prohlídka je povinná?",
              a: "Komerční předprohlídka všech kol před startem; stejná sada při vrácení.",
            },
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
    Construction: {
        "Concrete Mixers": {
          title: "Míchačky — výkon + duty",
          summary: "Duty class, výkon/palivo a pojištění u míchaček.",
          qa: [
            { q: "Jaké brány platí?", a: "Duty class, power band, fuel type a pojišťovací pásma." },
            { q: "Motohodiny?", a: "Hours band je doporučený, aby nájemce znal opotřebení před předáním." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění betonářské zakázky." },
            { q: "Partner promo?", a: "Žádný hard-sell půjčovny techniky." },
          ],
        },
        "Safety Equipment": {
          title: "PPE — tier + kontrola",
          summary: "PPE risk tier, velikost, norma a stav kontroly.",
          qa: [
            { q: "Jaké brány platí?", a: "PPE risk tier (soft / fall / mixed), velikost, norma a inspection status." },
            { q: "Fall protection?", a: "Fall nebo mixed kit vyžaduje normu a inspected_current nebo tag_visible." },
            { q: "Soft PPE?", a: "Soft PPE může mít not_required_soft_ppe — stále zveřejněte velikost a tier." },
            { q: "Kauce?", a: "Kryje chybějící/poškozené PPE — ne pojištění úrazu." },
            { q: "Partner promo?", a: "Žádný hard-sell distributora PPE." },
          ],
        },
        "Site Lighting": {
          title: "Staveništní světla — výkon + palivo",
          summary: "Duty, výkon/palivo a pojištění dočasného osvětlení.",
          qa: [
            { q: "Co musí být uvedeno?", a: "Duty class, power band, fuel type a pojištění." },
            { q: "Kauce?", a: "Kryje poškození světel/věží — ne pojištění zpoždění zakázky." },
            { q: "Partner promo?", a: "Žádný hard-sell půjčovny světel." },
            { q: "Motohodiny?", a: "Hours band je doporučený u generátorů / light towers." },
          ],
        },
        "Hand Tools Pro": {
          title: "Pro ruční nářadí — class + duty",
          summary: "Třída pro ručního nářadí a duty s pojištěním.",
          qa: [
            { q: "Jaké brány platí?", a: "Hand-tools pro class, duty class a pojištění." },
            { q: "Inventář?", a: "U vícedílných sad uveďte checklist, aby šly uplatnit chybějící kusy." },
            { q: "Kauce?", a: "Kryje chybějící nářadí a poškození — ne pojištění úrazu." },
            { q: "Partner promo?", a: "Žádný hard-sell tool-trucku." },
          ],
        },
        "Formwork Basic": {
          title: "Bednění basic — počet + checklist",
          summary: "Pásmo počtu kusů a kit inventory checklist.",
          qa: [
            { q: "Jaké brány platí?", a: "Počet kusů bednění, checklist, duty class a pojištění." },
            { q: "Vrácení?", a: "Počítejte kusy podle zamrazeného checklistu při předání i návratu." },
            { q: "Kauce?", a: "Kryje chybějící panely/podpěry — ne pojištění neúspěšné betonáže." },
            { q: "Partner promo?", a: "Žádný hard-sell dodavatele bednění." },
          ],
        },
        "Large Concrete Equipment": {
          title: "Velká betonářská technika — výkon + duty",
          summary: "Výkon/palivo a duty u velké betonářské techniky.",
          qa: [
            { q: "Jaké brány platí?", a: "Duty class, power band, fuel type a pojištění." },
            { q: "Operátor?", a: "Uveďte v poznámkách, zda je operátor v ceně, pokud je to relevantní." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění zpoždění projektu." },
            { q: "Partner promo?", a: "Žádný hard-sell půjčovny těžké betonářské techniky." },
          ],
        },
        "Crane & Lifting": {
          title: "Jeřáb & zdvih — kapacita + operátor",
          summary: "Kapacita v tunách a režim operátora s pojištěním.",
          qa: [
            { q: "Jaké brány platí?", a: "Kapacita tun, operator mode, výkon/palivo, duty a pojištění." },
            { q: "Operátor v ceně?", a: "Bare rental vs operator included/optional se zamrazí před publish." },
            { q: "Oprávnění?", a: "Crane-class zakázky mohou vyžadovat doklad operátora před odemčením handoff." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění selhání zdvihu." },
            { q: "Partner promo?", a: "Žádný hard-sell crane brokera." },
          ],
        },
        "Professional Formwork": {
          title: "Pro bednění — počet + checklist",
          summary: "Stejné formwork brány jako basic v pro měřítku.",
          qa: [
            { q: "Jaké brány platí?", a: "Počet kusů, checklist, duty class a pojištění." },
            { q: "Vrácení?", a: "Počítejte každý panel/podpěru podle checklistu." },
            { q: "Kauce?", a: "Kryje chybějící kusy podle seznamu." },
            { q: "Partner promo?", a: "Žádný hard-sell formwork yardu." },
          ],
        },
        "Excavation Tools": {
          title: "Výkopové nářadí — výkon + duty",
          summary: "Výkon/palivo a duty u výkopového nářadí.",
          qa: [
            { q: "Jaké brány platí?", a: "Duty class, power band, fuel type a pojištění." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění zásahu do sítí." },
            { q: "Partner promo?", a: "Žádný hard-sell půjčovny výkopové techniky." },
            { q: "Motohodiny?", a: "Hours band je doporučený u motorového výkopového nářadí." },
          ],
        },
        "Structural Equipment": {
          title: "Konstrukční vybavení — class + duty",
          summary: "Třída konstrukčního vybavení a duty s pojištěním.",
          qa: [
            { q: "Jaké brány platí?", a: "Structural equipment class, duty class a pojištění." },
            { q: "Kauce?", a: "Kryje poškození a chybějící kusy — ne pojištění selhání konstrukce." },
            { q: "Partner promo?", a: "Žádný hard-sell dodavatele pažení." },
            { q: "Přesun police?", a: "Skutečné jeřáby patří na Crane & Lifting; bednění na Formwork." },
          ],
        },
        Other: {
          title: "Ostatní construction — nejdřív pojmenovaná police",
          summary: "Preferujte Mixers, Safety, Lighting, Hand Tools, Formwork, Concrete, Crane, Excavation nebo Structural.",
          qa: [
            { q: "Mám použít Other?", a: "Přesuňte na pojmenovanou Construction polici, kdykoli sedí, aby platily PPE, formwork nebo crane brány." },
            { q: "Co stále platí?", a: "Duty class, pojištění a constructionOtherKind stále zamrznou u rent." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění zakázky." },
            { q: "Partner promo?", a: "Žádný hard-sell půjčovny techniky." },
          ],
        },
      },
    "Boats & Water": {
        "Kayaks & Canoes": {
          title: "Kajaky a kánoe — PFD + délka",
          summary: "Délka, kapacita, motor a PFD politika pro paddle craft.",
          qa: [
            { q: "Jaké brány platí?", a: "Pásmo délky, kapacita osob, motor, PFD politika a pojišťovací pásma." },
            { q: "Je HIN povinné?", a: "Ne u nemotorových kajaků — HIN je povinné při motor yes nebo electric_only." },
            { q: "PFD?", a: "Listing nastaví included, renter provides nebo not required — nepočítejte s vestami automaticky." },
            { q: "Kauce?", a: "Kryje poškození trupu/výbavy a chybějící PFD — ne pojištění výletu." },
            { q: "Partner promo?", a: "Žádný hard-sell outfitteru ani paddle pojištění." },
          ],
        },
        "SUP Boards": {
          title: "SUP — PFD + délka",
          summary: "Délka, kapacita a PFD pro paddleboardy.",
          qa: [
            { q: "Co musí být uvedeno?", a: "Délka, kapacita, motor, PFD politika a pojištění." },
            { q: "HIN?", a: "Není povinné u nemotorových SUP — povinné pokud je motor." },
            { q: "Kauce?", a: "Kryje poškození boardu/ploutve a chybějící PFD." },
            { q: "Partner promo?", a: "Žádný hard-sell SUP shopu." },
          ],
        },
        "Fishing Boats": {
          title: "Rybářské lodě — HIN + safety kit",
          summary: "Motorové rybářské lodě: HIN, USCG kit a pojištění.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG-style kit a pojištění." },
            { q: "Je HIN povinné?", a: "Ano u Fishing Boats — zadejte HIN/CIN/místní registraci před publish." },
            { q: "Fotky?", a: "Obchůzka trupu (příď, záď, boky, paluba) před startem a při návratu." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění rybářského výletu." },
            { q: "Partner promo?", a: "Žádný hard-sell mariny ani pojišťovny lodí." },
          ],
        },
        "Inflatable Boats": {
          title: "Nafukovací — motor vs paddle",
          summary: "PFD u nemotorových; HIN při motoru.",
          qa: [
            { q: "HIN?", a: "Povinné při motor yes nebo electric_only; volitelné u nemotorových." },
            { q: "PFD?", a: "Nemotorové nafukovací zamrazí PFD included / renter provides / not required." },
            { q: "Kauce?", a: "Kryje defekt/poškození a chybějící PFD." },
            { q: "Partner promo?", a: "Žádný hard-sell prodejce nafukovacích lodí." },
          ],
        },
        "Jet Skis": {
          title: "Jet Ski — HIN + safety kit",
          summary: "PWC: HIN, USCG kit, věk/licence a pojištění.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit a pojištění." },
            { q: "Věk / licence?", a: "Bareboat: věk 25 + boater/PWC oprávnění, pokud to vyžaduje zákon a listing." },
            { q: "Fotky?", a: "Obchůzka trupu před startem a stejné při návratu." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — Evorios neprodává PWC pojištění." },
            { q: "Partner promo?", a: "Žádný hard-sell řetězce půjčoven jet ski." },
          ],
        },
        Motorboats: {
          title: "Motorové lodě — captain mode + HIN",
          summary: "HIN, USCG kit, captain vs bareboat a pojištění.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit, captain mode a pojištění." },
            { q: "Bareboat vs captain?", a: "Bareboat: věk/licence. Captain included: host 18+ bez renter licence gate." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti na listingu." },
            { q: "Partner promo?", a: "Žádný hard-sell charter brokera." },
          ],
        },
        "Pontoon Boats": {
          title: "Pontony — captain mode + HIN",
          summary: "Stejné motorové brány jako u motorboats.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit, captain mode a pojištění." },
            { q: "Captain included?", a: "Při captain_included platí věk hosta 18 a renter licence gate je vypnutý." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění party lodi." },
            { q: "Partner promo?", a: "Žádný hard-sell prodejce pontonů." },
          ],
        },
        "Commercial Fishing": {
          title: "Komerční rybolov — HIN + kit",
          summary: "Motorové komerční rybářské craft: HIN, USCG kit, pojištění.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit a pojištění." },
            { q: "Komerční použití?", a: "Zveřejněte skutečnou kapacitu a stav safety kit — kauce není pojištění úlovku." },
            { q: "Fotky?", a: "Obchůzka trupu před startem a při návratu." },
            { q: "Partner promo?", a: "Žádný hard-sell komerční rybářské pojišťovny." },
          ],
        },
        "Dive Boats": {
          title: "Potápěčské lodě — HIN + kit",
          summary: "Motorové dive support: HIN, USCG kit, pojištění.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit a pojištění." },
            { q: "Je dive gear v ceně?", a: "Jen co říká inventory listingu — lahve/regulátory se nepředpokládají." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění potápěčské nehody." },
            { q: "Partner promo?", a: "Žádný hard-sell dive shopu ani PADI." },
          ],
        },
        "Charter Vessels": {
          title: "Charter — captain + HIN",
          summary: "Captain mode, HIN, USCG kit a pojištění pro charter.",
          qa: [
            { q: "Jaké brány platí?", a: "Délka, kapacita, motor, HIN, USCG kit, captain mode a pojištění." },
            { q: "Potřebuji licenci?", a: "Captain included: host 18+, bez renter licence. Bareboat: věk 25 + credential dle potřeby." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti na listingu." },
            { q: "Partner promo?", a: "Žádný hard-sell charter marketplace." },
          ],
        },
        Other: {
          title: "Ostatní plavidla — nejdřív pojmenovaná police",
          summary: "Preferujte Kayak, SUP, Fishing, Inflatable, Jet Ski, Motorboat, Pontoon, Dive nebo Charter.",
          qa: [
            { q: "Mám použít Other?", a: "Přesuňte na pojmenovanou Boats polici, kdykoli sedí, aby platily HIN, PFD nebo captain brány." },
            { q: "Co stále platí?", a: "Délka, kapacita, motor, pojištění a boatsOtherKind stále zamrznou u rent." },
            { q: "HIN?", a: "Povinné u motorových craft (motor yes / electric_only) nebo na motorové polici." },
            { q: "Kauce?", a: "Odpovídá pásmu spoluúčasti — ne pojištění výletu." },
            { q: "Partner promo?", a: "Žádný hard-sell mariny." },
          ],
        },
      },
    "Bikes & Scooters": {
        "Mountain Bikes": {
          title: "Horská kola — trail waiver + helma",
          summary: "Velikost rámu, helma/zámek/úschova a MTB waiver.",
          qa: [
            { q: "Jaké brány platí?", a: "Velikost rámu/kol, helma, zámek, noční úschova a liability waiver (required nebo not_required)." },
            { q: "Je waiver povinný?", a: "Host musí u Mountain Bikes před publish nastavit required nebo not_required." },
            { q: "Helma / zámek?", a: "Politika helmy a zámku je povinná u každého Bikes pronájmu." },
            { q: "Kauce?", a: "Kryje poškození rámu/kol a chybějící zámek/helmu — ne pojištění úrazu na trailu." },
            { q: "Partner promo?", a: "Žádný hard-sell bike shopu ani trail pojištění." },
          ],
        },
        "Road Bikes": {
          title: "Silniční kola — fit + úschova",
          summary: "Velikost rámu, helma/zámek a noční úschova.",
          qa: [
            { q: "Co musí být uvedeno?", a: "Velikost rámu/kol, helma, zámek a pravidlo noční úschovy." },
            { q: "Fit?", a: "Použijte velikost rámu a doporučené pásmo výšky jezdce před rezervací." },
            { q: "Kauce?", a: "Kryje poškození při pádu a chybějící zámek/helmu — ne pojištění závodu." },
            { q: "Partner promo?", a: "Žádný hard-sell bike shopu." },
          ],
        },
        "E-Bikes": {
          title: "E-kola — třída + min. věk",
          summary: "Třída e-kola, min. věk, baterie/nabíječka a helma/zámek.",
          qa: [
            { q: "Jaké brány platí?", a: "Min. věk jezdce, třída e-kola (1–3 nebo neklasifikováno), helma, zámek, úschova a pole baterie/nabíječky." },
            { q: "Jaká třída?", a: "Host nastaví Class 1, 2, 3 nebo not classified — místní pravidla se mohou lišit." },
            { q: "Kauce?", a: "Kryje poškození kola/baterie a chybějící nabíječku — ne pojištění e-kola." },
            { q: "Partner promo?", a: "Žádný hard-sell pojišťovny e-kol ani shopu." },
          ],
        },
        "Kids Bikes": {
          title: "Dětská kola — zákonný zástupce + helma",
          summary: "Potvrzení zákonného zástupce; helma povinná (not_required zakázáno).",
          qa: [
            { q: "Je potřeba zákonný zástupce?", a: "Ano — dospělý musí potvrdit při rezervaci před předáním." },
            { q: "Může být helma not required?", a: "Ne u Kids Bikes — not_required je při publish blokováno." },
            { q: "Kauce?", a: "Kryje poškození a chybějící kit — ne pojištění úrazu dítěte." },
            { q: "Partner promo?", a: "Žádný hard-sell obchodu s dětskými koly." },
          ],
        },
        "Electric Scooters": {
          title: "E-koloběžky — třída + min. věk",
          summary: "Třída koloběžky, min. věk při electric, helma/zámek/úschova.",
          qa: [
            { q: "Jaké brány platí?", a: "Třída koloběžky, helma, zámek, noční úschova a min. věk, pokud Electric není no." },
            { q: "Kde smím jezdit?", a: "Dodržujte místní pravidla pro koloběžky a zveřejněné pravidlo úschovy." },
            { q: "Kauce?", a: "Kryje poškození koloběžky/baterie a chybějící nabíječku." },
            { q: "Partner promo?", a: "Žádný hard-sell scooter-share ani pojišťovny." },
          ],
        },
        Cruisers: {
          title: "Cruisery — pohodlný fit + úschova",
          summary: "Velikost rámu, helma/zámek a noční úschova pro city/beach cruisery.",
          qa: [
            { q: "Co musí být uvedeno?", a: "Velikost rámu/kol, helma, zámek a noční úschova." },
            { q: "Kauce?", a: "Kryje poškození a chybějící zámek/helmu." },
            { q: "Partner promo?", a: "Žádný hard-sell bike shopu." },
            { q: "Přespání?", a: "Venkovní noc může zrušit nárok, pokud listing vyžaduje indoor nebo covered." },
          ],
        },
        "E-Bikes Pro": {
          title: "Pro e-kola — třída + věk",
          summary: "Stejné e-power brány jako E-Bikes u fleet/pro nabídky.",
          qa: [
            { q: "Jaké brány platí?", a: "Min. věk, třída e-kola, helma, zámek, úschova a baterie/nabíječka." },
            { q: "Fleet vs osobní?", a: "Zveřejněte stejnou třídu a charge band, aby jezdec znal asistenci při předání." },
            { q: "Kauce?", a: "Kryje poškození kola/baterie a chybějící nabíječku." },
            { q: "Partner promo?", a: "Žádný hard-sell fleet pojištění." },
          ],
        },
        "Racing Bikes": {
          title: "Závodní kola — waiver + fit",
          summary: "Velikost rámu, helma/zámek, úschova a závodní waiver.",
          qa: [
            { q: "Jaké brány platí?", a: "Velikost rámu/kol, helma, zámek, úschova a liability waiver (required nebo not_required)." },
            { q: "Je waiver povinný?", a: "Host musí u Racing Bikes před publish nastavit required nebo not_required." },
            { q: "Kauce?", a: "Kryje poškození při pádu a chybějící kit — ne pojištění závodu ani medicínu." },
            { q: "Partner promo?", a: "Žádný hard-sell startovného ani bike shopu." },
          ],
        },
        "Cargo Bikes": {
          title: "Cargo kola — nosnost + děti",
          summary: "Nosnost a politika dětských cestujících s helmou/zámkem.",
          qa: [
            { q: "Jaké brány platí?", a: "Pásmo nosnosti, politika dětí, helma, zámek a noční úschova." },
            { q: "Mohou jet děti jako náklad?", a: "Jen pokud listing dovolí child seat included nebo renter seat — adult_cargo_only děti blokuje." },
            { q: "Kauce?", a: "Kryje poškození přetížením a chybějící sedačky/zámky." },
            { q: "Partner promo?", a: "Žádný hard-sell prodejce cargo kol." },
          ],
        },
        "Professional Scooters": {
          title: "Pro koloběžky — třída + věk",
          summary: "Třída koloběžky a e-power věkové brány pro fleet/pro.",
          qa: [
            { q: "Jaké brány platí?", a: "Třída koloběžky, helma, zámek, úschova a min. věk, pokud Electric není no." },
            { q: "Kauce?", a: "Kryje poškození koloběžky/baterie a chybějící nabíječku." },
            { q: "Partner promo?", a: "Žádný hard-sell pojištění fleet koloběžek." },
            { q: "Místní pravidla?", a: "Dodržujte místní pravidla a zveřejněnou úschovu." },
          ],
        },
        "Adaptive Bikes": {
          title: "Adaptivní kola — povinný podtyp",
          summary: "Podtyp adaptivního kola plus helma/zámek/úschova.",
          qa: [
            { q: "Jaký podtyp je povinný?", a: "Handcycle, tandem, trike, recumbent, wheelchair attach nebo other adaptive." },
            { q: "Co ještě platí?", a: "Helma, zámek a noční úschova u každého Bikes pronájmu." },
            { q: "Kauce?", a: "Kryje poškození a chybějící adaptivní nástavce." },
            { q: "Partner promo?", a: "Žádný hard-sell prodejce adaptivních kol." },
          ],
        },
        Other: {
          title: "Ostatní kola — nejdřív pojmenovaná police",
          summary: "Preferujte Mountain, Road, E-Bike, Kids, Scooter, Racing, Cargo nebo Adaptive.",
          qa: [
            { q: "Mám použít Other?", a: "Přesuňte na pojmenovanou Bikes polici, kdykoli sedí, aby platily věk, waiver, nosnost nebo adaptive brány." },
            { q: "Co stále platí?", a: "Helma, zámek, noční úschova a bikesOtherKind stále zamrznou u rent." },
            { q: "Electric?", a: "Pokud Electric = yes, min. věk a třída e-kola platí u kola (ne koloběžky)." },
            { q: "Kauce?", a: "Kryje poškození a chybějící zámek/helmu." },
            { q: "Partner promo?", a: "Žádný hard-sell bike shopu." },
          ],
        },
      },
    "Electronics & Tech": {
        "Broadcast Equipment": {
            title: "FAQ broadcast vybavení",
            summary: "Krátké odpovědi k switcherům, encoderům a livestream sadám.",
            qa: [
              {
                q: "Jaký subtype uvést?",
                a: "Switcher, encoder, recorder, teleprompter apod.—plus značka/model.",
              },
              {
                q: "Jaké I/O a napájení?",
                a: "Každá SDI/HDMI cesta, kabely/konvertory a power/battery plate.",
              },
              {
                q: "Je media v sadě?",
                a: "Inzerát uvádí, zda SD/CF/SSD jde se sadou.",
              },
              {
                q: "Return function test?",
                a: "Ano, pokud hostitel nastaví—kontrola zapnutí/I/O při vrácení.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kabely/media a neúspěšný return test nad opotřebení.",
              },
            ],
          },
        "Display Systems": {
            title: "FAQ display systémů",
            summary: "Krátké odpovědi k panelům, LED stěnám, držákům a proudu.",
            qa: [
              {
                q: "Jaká velikost a vstupy?",
                a: "Velikostní pásmo, rozlišení/HDR a každý HDMI/DP/SDI vstup.",
              },
              {
                q: "Indoor nebo outdoor?",
                a: "Dodržte rating na inzerátu—indoor panely ne ven.",
              },
              {
                q: "Proud?",
                a: "Zkontrolujte publikované ampéry/okruhy před instalací.",
              },
              {
                q: "Držáky / case?",
                a: "Inzerát uvádí stand/mount/flight-case.",
              },
              {
                q: "Co kryje kauce?",
                a: "Prasklé sklo, ohnuté kabinety a chybějící kabely/ovladače/moduly.",
              },
            ],
          },
        "Gaming Gear": {
            title: "FAQ herního vybavení",
            summary: "Krátké odpovědi ke konzolím, PC, VR, loginu a wipe.",
            qa: [
              {
                q: "Jaký login?",
                a: "Preferujte guest/offline dle inzerátu—nenechávejte osobní účty.",
              },
              {
                q: "Kolik ovladačů?",
                a: "Počet ovladačů a HDMI/kabely jsou v inventáři.",
              },
              {
                q: "Wipe?",
                a: "Pokud má úložiště—dodržte host wipe/unlink a return wipe.",
              },
              {
                q: "VR hygiena?",
                a: "Vyčistěte face foam dle poznámek před vrácením.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící pady/kabely a poškození nad hygienické poznámky.",
              },
            ],
          },
        "Laptops": {
            title: "FAQ notebooků",
            summary: "Krátké odpovědi k odemčení, nabíječce, baterii a wipe.",
            qa: [
              {
                q: "Je nabíječka v sadě?",
                a: "Ano, pokud je uvedena—wattáž v inventáři.",
              },
              {
                q: "Jak odemknout?",
                a: "Podle OS/admin unlock a demo-login poznámek.",
              },
              {
                q: "Jaký wipe?",
                a: "Host wipe při listingu; hloubka wipe při vrácení; potvrďte při rezervaci.",
              },
              {
                q: "Baterie?",
                a: "Dodržte publikované pásmo; vyfoťte brick při předání.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící nabíječka/sada a poškození displeje/klávesnice nad grade.",
              },
            ],
          },
        "Network Gear": {
            title: "FAQ síťových zařízení",
            summary: "Krátké odpovědi k switchům, AP, PoE a factory restore.",
            qa: [
              {
                q: "Subtype a PoE?",
                a: "Router/switch/AP/firewall/mesh plus PoE budget a port band.",
              },
              {
                q: "Factory restore při vrácení?",
                a: "Ano, pokud to inzerát vyžaduje—smažte SSID a admin hesla.",
              },
              {
                q: "Venkovní použití?",
                a: "Jen pokud outdoor rating dovolí.",
              },
              {
                q: "Jaké kusy počítat?",
                a: "Injectory, antény, SFP, rails/ears dle inventáře.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící díly a konfigurace proti restore politice.",
              },
            ],
          },
        "Other": {
            title: "FAQ ostatní elektroniky",
            summary: "Krátké odpovědi, když nesedí pojmenovaná police.",
            qa: [
              {
                q: "Použít Other?",
                a: "Raději pojmenovanou polici (Laptops, Projectors, Gaming…), ať platí správné brány.",
              },
              {
                q: "Co musí Other deklarovat?",
                a: "Napájení, úložiště ano/ne, wipe při úložišti a foto stavu.",
              },
              {
                q: "Vícedílná sada?",
                a: "Vypište každý kus v inventáři.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící díly a poškození s fotkami + sérií.",
              },
              {
                q: "Partnerské pojištění?",
                a: "Ne—jen kauce.",
              },
            ],
          },
        "Pro Audio": {
            title: "FAQ pro audio",
            summary: "Krátké odpovědi k interface, mic, phantom a loom.",
            qa: [
              {
                q: "Jaký typ zařízení?",
                a: "Interface, mixer, mic, monitor apod.—na inzerátu.",
              },
              {
                q: "48V phantom / DI?",
                a: "Zkontrolujte inzerát—nutné u mnoha kondenzátorů a baskytary.",
              },
              {
                q: "Jak se počítají kabely?",
                a: "Každý XLR/TRS/USB/ADAT v loom—počítat při předání.",
              },
              {
                q: "Return function test?",
                a: "Ano, pokud je nastaven—zapnutí/I/O při vrácení.",
              },
              {
                q: "Je to Music PA?",
                a: "Ne—studio/capture pod Electronics & Tech.",
              },
            ],
          },
        "Projectors": {
            title: "FAQ projektorů",
            summary: "Krátké odpovědi k lumenům, throw, vstupům a sadě.",
            qa: [
              {
                q: "Jak jasný?",
                a: "Publikované lumen pásmo a nativní rozlišení.",
              },
              {
                q: "Jaká throw vzdálenost?",
                a: "Podle throw/distance poznámek.",
              },
              {
                q: "Jaké vstupy?",
                a: "Počet HDMI a adaptéry v inventáři.",
              },
              {
                q: "Indoor/outdoor?",
                a: "Dodržte publikované prostředí.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící ovladač/kabely a lamp/outdoor misuse nad inzerát.",
              },
            ],
          },
        "Servers & Workstations": {
            title: "FAQ serverů a WS",
            summary: "Krátké odpovědi k form factoru, napájení, BMC a hloubce wipe.",
            qa: [
              {
                q: "Form factor a napájení?",
                a: "Tower / rack U / laptop WS plus PSU na inzerátu.",
              },
              {
                q: "Rack rails v sadě?",
                a: "Jen pokud inzerát říká—počítejte při předání.",
              },
              {
                q: "Hloubka wipe?",
                a: "Secure erase, reinstall OS, nebo vyjmuté disky—dle publikace.",
              },
              {
                q: "IPMI/iDRAC?",
                a: "Dodržte politiku přístupu BMC; nenechávejte otevřené credentials.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící rails/NIC a hardware—ne kyber pojištění.",
              },
            ],
          },
        "Smart Home Devices": {
            title: "FAQ smart home",
            summary: "Krátké odpovědi k odpojení účtu, hubu a protokolu.",
            qa: [
              {
                q: "Musím odpojit účet?",
                a: "Ano—dle account-return politiky; nenechte dalšího hosta napojeného.",
              },
              {
                q: "Je potřeba hub?",
                a: "Jen pokud protokol na inzerátu hub vyžaduje.",
              },
              {
                q: "Jaký protokol?",
                a: "Wi-Fi / Thread / Zigbee / Matter pásmo na inzerátu.",
              },
              {
                q: "Kamery?",
                a: "Použijte privacy cover; dodržte poznámky k instalaci/demontáži.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící huby/senzory a poškození stěny nad install notes.",
              },
            ],
          },
        "Speakers": {
            title: "FAQ reproduktorů",
            summary: "Krátké odpovědi k přenosným/party reproduktorům (ne stage PA).",
            qa: [
              {
                q: "Baterie nebo AC?",
                a: "Dle typu napájení; u baterie dodržte pásmo nabití při vrácení.",
              },
              {
                q: "Venku / splash?",
                a: "Jen v publikovaném weather pásmu.",
              },
              {
                q: "Kabely v sadě?",
                a: "Pojmenovaný checklist—počítejte při předání.",
              },
              {
                q: "Hlasitost?",
                a: "Dodržte neighbor-volume / quiet hours poznámky.",
              },
              {
                q: "Je to Music PA?",
                a: "Ne—spotřebitelské/přenosné; stage PA je pod Music & Audio.",
              },
            ],
          },
      },
    "Garden & Yard": {
        "Garden Tools": {
          title: "Zahradní nářadí — sada, povrch, opotřebení, čisté vrácení",
          summary: "Půjčovny a sousedské sady vyhrávají, když je jasné single vs sada, vhodný povrch, stupeň opotřebení a pravidlo vrácení s blátem. Baseline už vyžaduje značku a pohon (ruční je běžné).",
          qa: [
            {
              q: "Co znamená jeden kus vs sada nářadí?",
              a: "Jeden kus je jedna položka (jedna lopata nebo jedno kolečko). Sada je vícekusový kit — každý kus musí být v inventárním checklistu a spočítán při předání.",
            },
            {
              q: "Proč vypsat každý kus u sady?",
              a: "Chybějící hrábě, vidle nebo díly kolečka jsou nejčastější spory o kauci. Číslovaný checklist při inzerci i vrácení je lepší než dohad po víkendové práci.",
            },
            {
              q: "Co je zamýšlený povrch?",
              a: "Půda je pro kopání a záhony; trávník pro šetrné hrábě a okrajovače; tvrdý povrch pro dlažbu, kámen a štěrk; smíšené pro obecné zahradní víkendy. Zvolte podle práce, aby nářadí hostitele sedělo k úkolu.",
            },
            {
              q: "Proč pohon u ručního nářadí?",
              a: "Většina zahradního nářadí je ruční. Akumulátor je u kultivátorů, nůžek nebo malých motorových ručních nástrojů — uveďte ho kvůli nabíjení a bezpečnosti.",
            },
            {
              q: "Co pokrývá stupeň stavu?",
              a: "Upřímné opotřebení rukojetí, čepelí, hrotů a van/kol kolečka — včetně lehké rzi, která stále funguje. Zmrazí základ, aby běžné opotřebení od půdy nebylo zaměněno za nové poškození po vrácení.",
            },
            {
              q: "Jak čisté má být nářadí při vrácení?",
              a: "Hostitel zvolí měkké pravidlo: oplach a osušení, lehké suché bláto OK, férové opotřebení z použití, nebo volitelný poplatek za čištění při silné půdě. Dodržte uvedené pravidlo — není to promo externí čistírny.",
            },
            {
              q: "Co není součástí?",
              a: "Profesionální údržba zahrady, dovoz zeminy ani odvoz odpadu, pokud to hostitel neuvádí. Evorios neprodává pojištění zahrady ani affiliate Home Depot / Sunbelt / United Rentals — kauce a podmínky pronájmu řeší škody a chybějící kusy.",
            },
          ],
        },
        "Houseplants & Seedlings": {
          title: "Pokojovky — péče, bezpečí pro domácí mazlíčky",
          summary: "Indoor pronájem selhává na světle, vodě a překvapeních pro mazlíčky. Povinný kultivar, zdraví, vrácení květináče plus doporučené indoor poznámky a toxicita pro zvířata odpovídají školkové poctivosti.",
          qa: [
            {
              q: "Proč uvádět indoor care poznámky?",
              a: "Vlhkost, mlžení, zákaz přesazení a aklimatizace ze skleníku brání opadu listů a hnilobě kořenů během krátkého pronájmu.",
            },
            {
              q: "Co znamená toxicita pro mazlíčky?",
              a: "Soft-povinný select. Nájemci s kočkami, psy nebo pravidly místa potvrdí před rezervací, pokud není non_toxic.",
            },
            {
              q: "Jak funguje vrácení květináče u event dekoru?",
              a: "Event_rental_return_pot = rostlina zpět v původním květináči po akci — jako u profesionálního pronájmu rostlin.",
            },
            {
              q: "Liší se sazenice od dospělých pokojovek?",
              a: "Stejná polička — uveďte heat mat a grow light v indoorCareNotes. Sazenice stresují rychleji.",
            },
            {
              q: "Jaké škůdce uvádět?",
              a: "Roztoči, octomilky, vlnovníci — sdělte ošetření nebo aktivní problém.",
            },
            {
              q: "Proč zóna u indoor rostlin?",
              a: "Doporučeno — indoor_only pro pokojovky. Patio tropické potřebují reálné pásmo.",
            },
            {
              q: "Co pronájem nezahrnuje?",
              a: "Evorios neprodává pojištění, dopravu ani týdenní zálivku.",
            },
            {
              q: "Jak funguje kauce?",
              a: "Zdraví a květináč jsou baseline. Prasklá keramika nebo škůdce mimo sdělené poznámky mohou jít z kauce.",
            },
          ],
        },
        "Irrigation Systems": {
          title: "Zavlažování — typ, plocha, montáž",
          summary: "Profesionální pronájem zavlažování má uvést typ systému, pásmo pokrytí, controller, úroveň montáže, inventář sady a měkké zimní poznámky před předáním.",
          qa: [
            {
              q: "Co znamená typ zavlažovacího systému?",
              a: "Zvolte drip pro kapkové/trubkové sady, sprinkler_zones pro pop-up nebo rotační zóny, smart_controller když je hlavní pronájem Wi‑Fi/časovač, nebo pump pro sady kolem booster/přenosného čerpadla. U kombinací zvolte nejbližší typ a zbytek uveďte v inventáři.",
            },
            {
              q: "Jak použít pásmo pokrytí?",
              a: "Zvolte přibližnou plochu, pro kterou je sada dimenzovaná — ne celý pozemek, pokud inzerát neříká jinak. Variable/custom layout znamená záhony nebo řady bez jednoduchého obdélníku; počet hlavic a délku hadic hledejte v checklistu.",
            },
            {
              q: "Co zahrnuje controller included?",
              a: "Basic timer included = hadicový nebo zónový časovač je v sadě. Smart controller included = Wi‑Fi/app časovač je součástí pronájmu.",
            },
            {
              q: "Co znamenají úrovně install complexity?",
              a: "Renter DIY = pokládáte hadice, hlavice a napojení na existující kohoutek — bez garance výkopů. Host installs = host nastaví před nebo při předání v uvedené oblasti.",
            },
            {
              q: "Co patří do inventáře sady?",
              a: "Uveďte každou hlavici, kapku, ventil, backflow/regulátor, délku hadice, kolíky, fitinky, nářadí, controller, čerpadlo a navijáky. Nájemce a host potvrdí počty při rezervaci a vrácení — chybějící kusy řeší inventář a fotky, ne retail záruka.",
            },
            {
              q: "K čemu jsou zimní poznámky?",
              a: "Jen měkké sezónní doporučení: vypustit linky, případně vyfouknout, skladovat v interiéru před mrazem. Nejsou pojištění proti mrazu a nezaručují zimní servis, pokud to host výslovně neuvádí.",
            },
            {
              q: "Jak obvykle funguje kauce a reklamace?",
              a: "Přestřihané hadice, chybějící hlavice, prasklý rozvod nebo chybějící smart controller obvykle jdou z kauce, když to podporuje inventář a fotky z předání. Běžné opotřebení kolíků může být OK, pokud to inzerát říká — spory podle checklistu a podmínek pronájmu.",
            },
            {
              q: "Co není zahrnuto?",
              a: "Vodné, stálá povolení, garantovaný přístup k hlavní lince, certifikace backflow testu a práce certifikovaného zavaděče, pokud install complexity neříká host installs. Evorios neprodává pojištění pozemku ani partnerské služby půjčoven nářadí — zařiďte si je sami, pokud je potřebujete.",
            },
          ],
        },
        "Landscape Equipment": {
          title: "Zahradní technika — typ, inventář, doprava",
          summary: "Profesionální půjčovny označují aerátory, vertikutátory, sod cutters, secí stroje a vozíky značkou, modelem, pohonem, palivem u benzínu, plným inventářem a poznámkami k nakládce — zmrazené ve smlouvě.",
          qa: [
            {
              q: "Co patří do Zahradní techniky vs jiných podkategorií?",
              a: "Tato polička je pro tažené aerátory, power vertikutátory, sod cutters, secí stroje, těžké vozíky, válce a okrajové edgery — ne sekačky, kultivátory, frézy na pařezy ani ruční hrábě. Vyberte nejbližší typ, aby nájemce věděl, co rezervuje.",
            },
            {
              q: "Proč záleží na značce, modelu a typu?",
              a: "Typ určuje úkol (aerace vs vertikutace vs sod vs secí). Značka a model zmrazí konkrétní stroj — Ryan, BlueBird a Husqvarna se liší hmotností, trny a hopperem.",
            },
            {
              q: "Co patří do inventárního checklistu?",
              a: "Vypište každý díl: bubny/trny, hopper, olej, rampa, klíče, náhradní díly, kabely nebo baterie. Semeno, hnojivo a posyp nejsou v ceně, pokud to výslovně neuvedete.",
            },
            {
              q: "Co mají obsahovat poznámky k dopravě?",
              a: "Uveďte vyzvednutí vs rozvoz, přibližnou hmotnost, zda je potřeba přívěs nebo rampa, body upínání a zda jsou potřeba dva lidé. Sod cutters a core aerátory jsou těžké — nejasná nakládka způsobuje nejvíc sporů v den vyzvednutí.",
            },
            {
              q: "Typ paliva a vrácení benzínu — co se očekává?",
              a: "U benzínového pohonu uveďte typ paliva (benzín, nafta, propan). Napište, zda nájemce vrací plnou nádrž, stejnou hladinu, nebo doplní — politika hostitele je zmrazená v inzerátu.",
            },
            {
              q: "OOP u motorizovaných strojů?",
              a: "U benzínu, síťových nebo akumulátorových strojů noste ochranu očí a sluchu a pevné rukavice; u těžkých tažených strojů pomohou pevné boty. Hostitel může uvést dodané OOP; pokud ne, vezměte si vlastní — jde o doporučení, ne certifikaci OSHA.",
            },
            {
              q: "Co není součástí?",
              a: "Materiál (semeno, sod, hnojivo), příprava pozemku, likvidace, školení nad rámec inzerátu a produkty půjčoven nebo pojištění třetích stran nejsou součástí. Kauce kryje poškození nebo chybějící díly dle zmrazeného checklistu a fotek.",
            },
          ],
        },
        "Lawn Mowers": {
          title: "Sekačky — deck, nůž, vrácení",
          summary: "Půjčovny nářadí zmrazí šířku sečení, palivo a pravidla čistého vrácení. Peer inzeráty vyhrávají, když model, šířka, režim decku, koš/mulčovací insert, stav nože, napětí nebo palivo a politika vrácení jsou ve smlouvě — jen měkký tip OOP.",
          qa: [
            {
              q: "Proč jsou povinné šířka sečení, model a zdroj energie?",
              a: "Šířka decku (pod 16″ až 30″+) říká, zda sekačka sedí na váš pozemek. Model u značky oddělí tlačenou vs samohybnou a třídu roku — samotná značka a „benzín“ nestačí.",
            },
            {
              q: "Co znamená režim výhozu a koš/mulčovací sada?",
              a: "Boční výhoz, zadní koš, mulčování nebo 3v1 určuje, kam jde tráva. Pole koše/mulče uvádí, zda je v ceně trávní koš, rám nebo mulčovací insert — chybějící díly jsou nejčastější spor při předání.",
            },
            {
              q: "Jak se řeší stav nože?",
              a: "Hostitel zvolí ostrý připravený, nedávno nabroušený, tupý (uvedený) nebo neznámý. Nájemce očekává uvedenou kvalitu sečení; poškození od kamenů nebo obrubníků není běžné opotřebení a může jít z kauce dle podmínek.",
            },
            {
              q: "Jaká jsou pravidla paliva a čistého vrácení u benzínu?",
              a: "Benzínové inzeráty vyžadují typ paliva a pravidlo vrácení: plná→plná, host dá startovací nádrž, nebo palivo kupuje nájemce. Politika čistého vrácení říká, zda musíte očistit deck, zaplatit paušál hostitele, nebo stačí lehká tráva — obojí potvrďte při rezervaci.",
            },
            {
              q: "A co akumulátorové napětí?",
              a: "Bezdrátové sekačky vyžadují pásmo napětí (18–20 V, 40 V, 60 V+), aby bylo jasné runtime a kompatibilita nabíječky. Počet baterií a nabíječku ověřte z fotek nebo zpráv — strukturovaný inventář baterií je budoucí vylepšení.",
            },
            {
              q: "Je OOP nebo pojištění jako u stump grinderů?",
              a: "Ne. U sekaček jen měkký tip OOP — ochrana očí, sluchu a pevná obuv.",
            },
            {
              q: "Když se po půjčení něco pokazí?",
              a: "Zveřejněná pravidla vrácení a paliva plus specifikace nože/výhozu jsou zmrazené ve smlouvě. Deck zalepený trávou mimo politiku, prázdná nádrž proti plná→plná nebo poškození nože zneužitím řeší kauce a zprávy — Evorios neprodává pojištění sekaček ani partnerské půjčovny nářadí.",
            },
          ],
        },
        "Leaf Blowers": {
          title: "Foukače listí — typ, průtok, vrácení",
          summary: "Půjčovny uvádějí typ (ruční/batoh), pásmo CFM a vac sadu na kartě. Přidáváme model, palivo u benzínu nebo napětí u aku, měkké poznámky k hluku/hodinám a pravidla vrácení — zmrazené ve smlouvě. Sousedská důvěra + kauce; nejsme pojišťovna zahradní techniky.",
          qa: [
            {
              q: "Proč záleží na typu a pásmu průtoku?",
              a: "Ruční foukače jsou pro menší plochy; batohové a pojízdné zvládnou větší objem listí. Pásmo CFM je měkká třída výkonu, aby si nájemce nebral lehký aku model na velkou zahradu s dubem.",
            },
            {
              q: "Co znamená pole mulch/vac sady?",
              a: "Některé jsou jen foukač; jiné mají vysávací sáček, trubky nebo celou mulch sadu. Inzerát říká, co je v ceně, aby nájemce nepočítal s vysáváním bez příslušenství.",
            },
            {
              q: "Typ paliva u benzínu — na co si dát pozor?",
              a: "U benzínového zdroje host uvede 4taktní benzin, 2taktní premix nebo jiné. Dodržte poměr směsi a pravidlo nádrže při předání; vraťte dle dohody (často stejná hladina nebo plná).",
            },
            {
              q: "Aku — proč pásmo napětí baterie?",
              a: "Platformy 18–20V, 40V a 60V+ nejsou zaměnitelné. Pásmo pomůže sladit náhradní baterie a očekávání výdrže.",
            },
            {
              q: "Hluk a hodiny pro sousedy?",
              a: "Host může uvést klidové hodiny SVJ, víkendová omezení nebo doporučení chráničů sluchu. Jde o zdvořilostní poznámky, ne právní radu — místní pravidla si ověřte sami.",
            },
            {
              q: "Jak foukač vrátit?",
              a: "Podle poznámek hostitele: obvykle vyklepat listí, vyprázdnit vysávací sáček, otřít skříň a nevracet ucpaný filtr. Silné znečištění nad běžné opotřebení může jít do kauce.",
            },
            {
              q: "Ochrana očí a uší?",
              a: "Foukače vrhají nečistoty a jsou hlasité. Brýle a chrániče sluchu doporučujeme.",
            },
            {
              q: "Co není součástí?",
              a: "Palivo, olej do premixu, prodlužovačky, extra baterie a pytle na bio odpad obvykle dodává nájemce, pokud inventář neříká jinak. Kauce kryje poškození a chybějící uvedené příslušenství — ne pojištění od třetí strany.",
            },
          ],
        },
        "Nursery Stock": {
          title: "Školkový materiál — specifikace, B&B předání",
          summary: "Velkoobchodní visačky řídí profi zakázky. Povinný kultivar, ANSI třída kontejneru, zóna, zdraví a politika výsadby/vrácení zmrazí očekávání pro B&B a field-grown materiál.",
          qa: [
            {
              q: "Pro koho je profi polička školkového materiálu?",
              a: "Pro zahradnické firmy a designéry půjčující linery, B&B stromy nebo dočasný materiál na stavbu — ne běžné pokojovky.",
            },
            {
              q: "Proč povinný kultivar?",
              a: "Výkresy vyžadují přesné odrůdy. 'Javor' nestačí, když specifikace říká October Glory.",
            },
            {
              q: "Jak funguje třída kontejneru u B&B?",
              a: "ANSI formáty — ball_burlap a field_grown určují váhu, rýč a zálivku. Špatná velikost vede ke sporům o jeřáb a návěs.",
            },
            {
              q: "Jaká politika výsadby pro staveniště?",
              a: "Keep_planted_no_return pro instalaci. Return_in_container když materiál musí zpět na dvůr.",
            },
            {
              q: "Co sdělit o škůdcích?",
              a: "Nedávné ošetření nebo 'čistý materiál'. Phyto poznámky když platí mezistátní pravidla — Evorios nevyřizuje certifikáty.",
            },
            {
              q: "Proč zóna u velkoobchodního materiálu?",
              a: "Povinné — profi sázejí ve velkém; chybná zóna zabíjí marži.",
            },
            {
              q: "Co pronájem nezahrnuje?",
              a: "Bez yard techniky Sunbelt/United Rentals, sázečů ani pojištění školek od Evorios.",
            },
            {
              q: "Jak fungují kauce a reklamace?",
              a: "Zdraví a integrita kořenového balu jsou baseline. Roztržené B&B nebo vyschnuté kořeny řeší fotky vs kauce.",
            },
          ],
        },
        "Other": {
          title: "Ostatní — nejdřív správná police",
          summary: "Preferujte pojmenovanou polici Garden & Yard, aby platily správné brány. Pokud zůstanete u Ostatní, uveďte vybavení vs rostlina vs mix, napájení u motorizovaného gearu, potvrzení fotek stavu a seznam kusů u vícedílné sady.",
          qa: [
            {
              q: "Mám použít Ostatní nebo pojmenovanou polici?",
              a: "Přesuňte inzerát na konkrétní polici, kdykoli to dává smysl — sekačky, trimery, fukary, zahradní nářadí, postřikovače, ride-on sekačky, kultivátory, frézy na pařezy, závlahy, landscape equipment, stromy, keře, trvalky, sezónní květiny, pokojovky a sazenice nebo nursery stock. Pojmenované police nesou správné brány pro napájení, rostliny nebo bezpečnost; Ostatní jen když položka opravdu nepatří jinam.",
            },
            {
              q: "Co znamená vybavení vs rostlina vs mix?",
              a: "Vybavení jsou nástroje a motorizovaný gear (sekačky, fukary, vozíky, čerpadla). Rostlina je živý materiál v květináči.",
            },
            {
              q: "Kdy je povinné napájení?",
              a: "U vybavení nebo mixu nastavte zdroj energie (akumulátor, síť, benzín, manuální, ride-on) a značku, pokud platí. Čistě rostlinné inzeráty napájení nepotřebují — pokud položka chce palivo nebo baterii, patří spíš na pojmenovanou polici vybavení.",
            },
            {
              q: "Co když inzeruji rostliny v Ostatní?",
              a: "Preferujte pojmenovanou rostlinnou polici kvůli výšce, slunci, květináči a závlaze. Pokud zůstanete u rostlin-only Ostatní, doplňte slunce, velikost květináče a zálivku, když můžete — nájemci potřebují základy péče před rezervací.",
            },
            {
              q: "Potřebuji inventář kusů?",
              a: "U jednoho kusu stačí strukturovaná pole. U vícedílných sad — sady nářadí, patio sety, více květináčů — je povinný krátký volný seznam každého kusu pro předání a vrácení.",
            },
            {
              q: "Jaké fotky stavu mám potvrdit?",
              a: "Potvrďte, že fotky na inzerátu ukazují položku celkově, kabely/čepele/květináče dle typu, viditelné opotřebení nebo poškození a všechny kusy u vícedílné sady. Jde o měkké potvrzení — neověřujeme upload — ale fotky jsou první vrstva u sporů o chybějící díly a poškození.",
            },
            {
              q: "Co není součástí ani slib?",
              a: "Evorios neprodává pojištění zahrad třetích stran, partnerské půjčovní plány ani garance doručení ze školky. Palivo, substrát, kolíky a OOP uvádíte v inzerátu; waiver a důkaz pojištění u fréz na pařezy platí jen na polici Stump Grinders.",
            },
            {
              q: "Jak fungují reklamace u Ostatní?",
              a: "Využijte fotky stavu, inventář, napájení a kauci u chybějících baterií, zlomených čepelí nebo poškozených květináčů. Příště preferujte pojmenovanou polici, aby specializované brány byly zmrazeny v dohodě od začátku.",
            },
          ],
        },
        "Perennials": {
          title: "Trvalky — kvetení, voda, zóna",
          summary: "Školkové visačky uvádějí kultivar, kvetení a pásmo vody. Peer pronájem trvalek vyhrává, když jsou tato pole plus zdraví, zóna, vrácení a poznámky k škůdcům/půdě povinné ve smlouvě.",
          qa: [
            {
              q: "Proč jsou sezóna kvetení a voda povinné?",
              a: "Trvalky žijí roky — špatné načasování kvetení kazí event okraje a špatná voda zabíjí rostliny. To jsou základy školkové visačky.",
            },
            {
              q: "Jaký detail kultivaru uvést?",
              a: "Název a odrůda — např. šalvěj 'May Night' nebo hosta 'Patriot'.",
            },
            {
              q: "Jak funguje event vrácení?",
              a: "Event_rental_return_pot = okrajové rostliny zpět v školkových květináčích. Keep_planted_no_return = prodejní výsadba v zemi.",
            },
            {
              q: "Proč zóna mrazuvzdornosti?",
              a: "Trvalky musí přežít zimu. USDA pásmo umožní nájemci filtrovat před výsadbou.",
            },
            {
              q: "Co do poznámek o škůdcích?",
              a: "Slimáci, padlí nebo 'ošetřeno a v pořádku'. U opakovaně kvetoucích uveďte, zda se očekává odstraňování květů při vrácení.",
            },
            {
              q: "Co pronájem nezahrnuje?",
              a: "Evorios neposkytuje mulč, hnojiva ani návrh záhonu.",
            },
            {
              q: "Jak funguje kauce?",
              a: "Kontejner a zdraví jsou baseline. Zlomené růstové body nebo vyschnuté plugy řeší fotky vs kauce.",
            },
          ],
        },
        "Ride-On Mowers": {
          title: "Zahradní traktory — záběr, palivo, doprava",
          summary: "Velké sekačky potřebují před rezervací zmrazený záběr, palivo, hodiny, stav nože/výhozu a dopravu — plus lehkou instruktáž, ne CDL.",
          qa: [
            {
              q: "Co musí hostitel uvést před aktivním pronájmem?",
              a: "Značku, model, pásmo záběru, typ paliva, pásmo hodinometru, stav nožů, typ výhozu/sběru a poznámky k dopravě (přívěs, pickup, rozvoz). Uveďte, zda je potřeba instruktáž při předání.",
            },
            {
              q: "Proč záběr a hodinometr?",
              a: "Půjčovny uvádějí obojí, aby nájemce sladil velikost trávníku a opotřebení. Zmrazené pásmo na inzerátu je lepší než překvapení malého záběru nebo unaveného motoru uprostřed práce.",
            },
            {
              q: "Jak funguje doprava?",
              a: "Většina ride-onů potřebuje přívěs nebo pickup — uveďte to v poznámkách. Napište, zda rozvážíte vy, zda nájemce přiveze rampy a přibližnou hmotnost/šířku.",
            },
            {
              q: "A co palivo?",
              a: "Palivo jako u staveništní techniky: full-to-full u benzínu nebo nafty. V poznámkách k instruktáži uveďte víčko nádrže a zda je v kitu kanystr.",
            },
            {
              q: "Je to pronájem vozidla s CDL?",
              a: "Ne. Jde o zahradní techniku — měkké minimální věkové pásmo a volitelná instruktáž, ne brána řidičského průkazu ani CDL.",
            },
            {
              q: "Bezpečnostní tip před prvním sečením?",
              a: "Odstraňte kamínky a nečistoty, držte děti a domácí mazlíčky mimo dosah, noste ochranu očí a uší a vyhněte se prudkým svahům a mokré trávě. Před slezením zastavte nože — instruktáž pokryje ovládání vašeho stroje.",
            },
            {
              q: "Co není součástí?",
              a: "Evorios neprodává pojištění zahrady ani není partnerem retail půjčoven. Kauce kryje poškození nožů, kapoty a chybějící díly sběru — ne náhradní pojistku.",
            },
            {
              q: "Když se něco pokazí?",
              a: "Fotky při předání kapoty, nožů a hodinometru podporují reklamace. Otupené nebo poškozené nože nad uvedeným pásmem, poškození kapoty nebo chybějící sběrný koš mohou jít z kauce dle podmínek.",
            },
          ],
        },
        "Seasonal Flowers": {
          title: "Sezónní květiny — barva, vrácení květináčů",
          summary: "Event pronájem stojí na vrcholu barvy a pravidlech vrácení květináčů. Povinný kultivar, kvetení, voda, zdraví, zóna a politika výsadby zmrazí očekávání školkového pultu ve smlouvě.",
          qa: [
            {
              q: "Proč povinné kvetení a voda?",
              a: "Krátké okno — chryzantémy na podzim, violky na jaro. Sezóna a voda říkají, kdy vrcholí barva a jak často zalévat během pronájmu.",
            },
            {
              q: "Co je event_rental_return_pot?",
              a: "Standard pro svatby a stánky: nájemce vrátí každý květináč po akci. Chybějící nebo rozbité květináče jsou top reklamace.",
            },
            {
              q: "Jak pojmenovat sezónní inzerát?",
              a: "Kultivar a barva — např. 'Violka Matrix Mix'.",
            },
            {
              q: "Proč zóna u sezónních květin?",
              a: "Jarní květiny snášejí mráz, tropické mísy ne. Pásmo zóny brání mrazu na jemných rostlinách.",
            },
            {
              q: "Jaké poznámky o škůdcích?",
              a: "Mšice, botrytis u chryzantém, octomilky — uveďte ošetření nebo 'čisté při předání'.",
            },
            {
              q: "Co pronájem nezahrnuje?",
              a: "Bez denního zalévání, dopravy nebo frost cloth od Evorios, pokud to inzerát nepřidá.",
            },
            {
              q: "Jak funguje kauce?",
              a: "Zdraví a počet květináčů jsou baseline. Uschnuté vs mrtvé flaty a chybějící květináče řeší fotky vs kauce.",
            },
            {
              q: "Může nájemce nechat zasazené květiny?",
              a: "Jen u keep_planted_no_return — jinak očekávejte květináče zpět v dohodnutý den.",
            },
          ],
        },
        "Shrubs & Bushes": {
          title: "Keře — kultivar, kvetení, vrácení",
          summary: "Školky a event pronájmy tagují kultivar, okno kvetení a velikost květináče. Peer inzeráty vyhrávají s názvem, výškou, sluncem, stálezeleností, sezónou kvetení, zdravím, zónou, pravidly vrácení a poznámkami k škůdcům/půdě.",
          qa: [
            {
              q: "Proč uvádět kultivar keře?",
              a: "Hortenzie, zimostráz a ibišek mají různou velikost a kvetení. Kultivar umožní nájemci sladit barvu a výšku před rezervací.",
            },
            {
              q: "Jak důležitá je sezóna kvetení?",
              a: "Doporučeno vždy a soft-povinné u pronájmu — vrchol kvetení řídí svatby a terasy. Foliage_only platí pro stálezelené pozadí.",
            },
            {
              q: "Co znamená politika výsadby u živých plotů?",
              a: "Keep_planted_no_return = prodejní instalace. Event_rental_return_pot = každý keř zpět v školkovém květináči u event dekoru.",
            },
            {
              q: "Co patří do poznámek o škůdcích?",
              a: "Mšice, skvrny, okus jelenů nebo nedávné ošetření. U stálezelených uvádějte zimní popálení ve stupni zdraví.",
            },
            {
              q: "Proč zóna a poznámky k půdě?",
              a: "Keře mimo zónu nebo ve stojící vodě rychle chřadnou. Pásmo zóny a drenáž snižují nejčastější zklamání.",
            },
            {
              q: "Co pronájem nezahrnuje?",
              a: "Evorios neposkytuje pojištění školek, profesionální řez ani herbicidní programy.",
            },
            {
              q: "Jak fungují reklamace?",
              a: "Stupeň zdraví a kontejner jsou baseline. Zlomené větve, vyschnuté kořeny nebo chybějící kusy u setů řeší fotky + inventář vs kauce.",
            },
          ],
        },
        "Sprinklers": {
          title: "Zavlažovače — pokrytí, připojení, kusy",
          summary: "Krátké letní půjčky vyhrávají, když jsou ve smlouvě zmrazené pásmo pokrytí, typ připojení, timer, inventář více hlav a poznámky k vypuštění.",
          qa: [
            {
              q: "Co znamená pásmo pokrytí?",
              a: "Říká nájemci, kolik trávníku nebo záhonu má sada zavlažovat — malá plocha, střední trávník, velký trávník nebo multi-zónová sada. Volte pásmo podle hlavic nebo kapkové soustavy na fotkách, ne jen podle velikosti celé zahrady.",
            },
            {
              q: "Co je typ připojení a proč je důležitý?",
              a: "Udává, jak se výbava napojí na vodu: standardní hadicové závit, přes časovač, kapkové potrubí nebo rychlospojky. Špatný typ znamená, že nájemce přijede bez správného adaptéru nebo těla časovače.",
            },
            {
              q: "Jak spolu souvisí timer v sadě a zdroj energie?",
              a: "Timer v sadě říká, zda hadicový časovač jde s hlavicemi, nebo jde jen o časovač. Zdroj energie je manual u pasivních zavlažovačů a obvykle cordless u bateriových časovačů — obojí je zmrazené ve smlouvě, aby nájemce věděl, co přinést.",
            },
            {
              q: "Kdy je povinný inventář kusů?",
              a: "U sad s více hlavicemi (dvě a víc), u čtyř a více hlav nebo u kapkových sad musí hostitel vypsat každý kolík, hlavici, rozbočku, rychlospojku a adaptér časovače. Nájemce inventář potvrdí při rezervaci a spočítá kusy při předání a vrácení.",
            },
            {
              q: "Co jsou poznámky k vypuštění a zazimnění?",
              a: "Měkké pokyny — ne servis dílny — jak vypustit časovač, vody z hadic a svinout kapkové linky před vrácením. Snižují spory o prasklé rozdělovače a stojící vodu na podzim.",
            },
            {
              q: "Co není součástí půjčky zavlažovače?",
              a: "Pokud hostitel neuvede jinak: zahradní hadice, venkovní kohoutek, účet za vodu, zpětná klapka, in-ground závlaha a pojištění zahrady třetí strany. Evorios neprodává pojištění na landscaping ani není partner velkých půjčoven.",
            },
            {
              q: "Jak fungují kauce a reklamace?",
              a: "Chybějící hlavice, kolíky, těla časovače nebo prasklé rozdělovače se kontrolují proti zmrazenému inventáři a fotkám z předání. Běžné opotřebení rozstřiku se očekává; škoda mimo zveřejněné poznámky k vrácení může jít z kauce dle podmínek.",
            },
            {
              q: "Co se uzamkne při rezervaci?",
              a: "Pásmo pokrytí, typ připojení, timer, zdroj energie, pásmo počtu hlavic, seznam kusů kde je povinný a případné poznámky k vypuštění — plus vaše potvrzení inventáře u multi-head sad. Pole zůstanou ve smlouvě až do vrácení.",
            },
          ],
        },
        "Stump Grinders": {
          title: "Pařezové frézy — kapacita, OOP, briefing",
          summary: "Stavebně blízké zahradní vybavení: průměr pařezu, OOP, waiver, doklad pojištění, typ stroje, palivo, čipy a provozní briefing před předáním.",
          qa: [
            {
              q: "Proč jsou pařezové frézy gated?",
              a: "Letící třísky a vysoký krouticí moment je řadí blíže k lehké stavební riziko než k foukači listí. Kapacita, OOP, waiver, doklad pojištění a bezpečnostní briefing uzamknou rezervaci, dokud nejsou splněny.",
            },
            {
              q: "Co znamená pásmo kapacity pařezu?",
              a: "Je to maximální průměr pařezu, pro který je fréza určena — pod 8 palců, 8–16, 16–24 nebo 24+. Nepřekračujte pásmo; hlubší broušení nebo tvrdé dřevo může vyžadovat větší stroj.",
            },
            {
              q: "Jaké OOP se očekává?",
              a: "Hostitel uvádí, zda je součástí pokyn pro oči / uši / rukavice, částečné OOP, nebo zda OOP dodá nájemce. Nájemce potvrdí OOP při rezervaci a musí ho používat.",
            },
            {
              q: "Jaký doklad pojištění je potřeba?",
              a: "Hostitel nastaví minimální limit odpovědnosti a maximální spoluúčast. Nájemce nahraje doklad splňující pásma před odemčením vyzvednutí.",
            },
            {
              q: "Co je bezpečnostní briefing?",
              a: "Pokud je vyžadován, hostitel označí briefing jako připravený a projde bezpečný start, házení třísek, inženýrské sítě a přepravu. Nájemce potvrdí, že briefing absolvuje při předání před provozem.",
            },
            {
              q: "Co pokrývá typ stroje, přeprava a poznámky k třískám?",
              a: "Typ je ruční, tažná nebo samojízdná fréza. Přeprava popisuje přívěs, hmotnost a průjezd branou.",
            },
            {
              q: "Jak funguje palivo?",
              a: "Uveďte benzín, naftu, elektřinu, propan nebo jiné. U benzínových a naftových strojů platí full-to-full, pokud hostitel v poznámkách k předání nestanoví jinak.",
            },
            {
              q: "Co není součástí?",
              a: "Evorios neunderwrituje zahradní práci, neprodává pojištění a nespolupracuje s promo Home Depot, Sunbelt, United Rentals ani yard pojištěním typu Progressive. Primární vrstvy jsou kauce a doklad nájemce.",
            },
          ],
        },
        "Tillers & Cultivators": {
          title: "Rotavátory a kultivátory — šířka, hloubka, nože, transport",
          summary: "U profi rotavátorů zmrazte pracovní šířku, pásmo hloubky, stav nožů, model, palivo u benzínu nebo baterii u akku a poznámky k transportu ještě před předáním.",
          qa: [
            {
              q: "Co znamenají pásma šířky a hloubky?",
              a: "Šířka je pracovní pruh na jeden průjezd — mini kultivátory často pod 12 palců; záhonné rotavátory 18–24 palce+. Hloubka je reálný řez — nová půda potřebuje 8–10 palců+, lehká příprava může být pod 6 palci.",
            },
            {
              q: "Proč uvádět stav nožů?",
              a: "Otupělé nebo ohnuté nože v hlíně selhávají a vedou ke sporům o kauci. Označte nové/ostré, dobré opotřebení, opotřebované nebo poškozené — a foťte poškození před předáním.",
            },
            {
              q: "A co typ paliva u benzínu?",
              a: "U benzínového pohonu uveďte 4taktní benzin vs 2taktní směs s olejem — špatné palivo může zadřít motor. Vrácení paliva bývá full-to-full při předání, když je fuelType nastaven; nedostatek paliva může nést standardní poplatek ve smlouvě.",
            },
            {
              q: "Co když je rotavátor akumulátorový?",
              a: "Uveďte počet baterií, zda je nabíječka v sadě a zda nájemce musí dodat kompatibilní pack. Počítejte baterie a nabíječku při vyzvednutí i vrácení — chybějící pack je nejčastější spor o příslušenství.",
            },
            {
              q: "Co patří do poznámek k transportu?",
              a: "Zadní rotavátory mohou vážit přes 200 lb — uveďte trailer, rampu nebo druhou osobu, skládací rukojeti a zda stačí SUV nebo pickup. Překvapení při vyzvednutí zabíjí okno pro výsadbu.",
            },
            {
              q: "Potřebuji speciální OOP?",
              a: "Měkký tip: ochrana očí, pevná obuv a rukavice — nože házejí kamínky a hrudy. Evorios nedodává OOP ani pojištění zahradní práce; host může doplnit v inzerátu.",
            },
            {
              q: "Co není součástí?",
              a: "Bez obsluhy, bez testu půdy, bez produktu třetí strany na pojištění práce na zahradě a bez garance kvality orbání — nájemce stroj obsluhuje dle manuálu a pravidel sítí (volejte před kopáním).",
            },
            {
              q: "Jak fungují kauce a reklamace?",
              a: "Velikost kauce k motoru, nožům a bateriím. Ohnuté nože, prasklé převody nebo chybějící baterie řeší podmínky pronájmu a fotky při předání — ne affiliate pojištění.",
            },
          ],
        },
        "Trees": {
          title: "Stromy — název, zdraví, politika výsadby",
          summary: "Místní školky tagují druh, zónu a formát kořenů. Vyhráváme peer inzeráty s běžným názvem/kultivarem, výškou, sluncem, stálezeleností, třídou kontejneru, zónou mrazuvzdornosti, stupněm zdraví, pravidly výsadby/vrácení a poznámkami k škůdcům/půdě — zmrazené ve smlouvě.",
          qa: [
            {
              q: "Proč je povinný běžný název nebo kultivar?",
              a: "Druh a kultivar určují velikost, barvu a podzimní efekt — generický ' stínový strom' vede k neshodám. Pojmenujte rostlinu jako na školkové visačce.",
            },
            {
              q: "Co znamená stupeň zdraví rostliny?",
              a: "Excellent/good/fair/stressed_disclosed odpovídá školkovým pásmům. Stressed_disclosed znamená viditelné problémy (usychání, škůdci, uvolněný B&B obal) pojmenované předem.",
            },
            {
              q: "Jak funguje politika výsadby / vrácení u pronájmu?",
              a: "Keep_planted_no_return = výsadba a prodejní styl. Return_in_container a event_rental_return_pot = strom se vrací v původním květináči nebo B&B — zvolte podle režimu inzerátu a poplatku.",
            },
            {
              q: "Proč uvádět zónu mrazuvzdornosti a poznámky k půdě?",
              a: "Venkovní stromy umírají mimo zónu nebo v mokrém jílu. USDA pásma a krátká poznámka k drenáži snižují nejčastější post-rent zklamání.",
            },
            {
              q: "Co patří do poznámek o škůdcích a nemocech?",
              a: "Uveďte šupinkovce, kůrovce, houbové skvrny nebo nedávnou léčbu. 'Tuto sezónu nic pozorováno' je v pořádku.",
            },
            {
              q: "Co pronájem stromu nezahrnuje?",
              a: "Evorios neprodává pojištění školek, výsadbové služby ani podání povolení. Doprava, vázání a zálivka po předání jsou mezi hostitelem a nájemcem, pokud inzerát nestanoví jinak.",
            },
            {
              q: "Jak fungují kauce a reklamace?",
              a: "Zveřejněný stupeň zdraví a třída kontejneru jsou baseline. Poškození nad zveřejněný stres (zlomené větve, roztržený bal kořenů, vyschnutí) může jít z kauce dle podmínek.",
            },
          ],
        },
        "Trimmers": {
          title: "Křovinořezy — typ hlavy, palivo, stav struny",
          summary: "Půjčovny nářadí zmrazí záběr, struna vs nůž, postroj, palivo nebo bateriovou platformu a opotřebení cívky na tiketu. U peer inzerátů totéž — kauce a potvrzení kitu, ne promo pojištění na zahradu.",
          qa: [
            {
              q: "Co znamenají brány na inzerátu?",
              a: "Značka, model, zdroj energie, záběr, typ hlavy, postroj, palivo nebo pásmo baterie, stav struny/nože a checklist kitu se zmrazí ve smlouvě před rezervací. Kopírují předání u půjčovny — bez překvapení k typu cívky, noži nebo chybějící nabíječce.",
            },
            {
              q: "Struna vs kovový nůž — proč na tom záleží?",
              a: "Hlava se strunou stříhá trávu a lehké plevele; kovový nůž u brushcutteru řeže husté křoviny a vrhá úlomky dál. Rezervace ukáže typ hlavy, abyste sladili práci a věděli, kdy platí přísnější bezpečnost.",
            },
            {
              q: "Potřebuji ochranu očí a uší?",
              a: "Letící úlomky a hluk motoru dělají brýle a chrániče sluchu standardem u křovinořezů. Inzerát může uvést, zda si je vezmete vy, nebo je dá hostitel — měkká bezpečnostní rada, ne pojištění ani waiver jako u frézovače pařezů.",
            },
            {
              q: "Benzínové — typ paliva a mix?",
              a: "Většina benzínových používá 2t mix; některé jen 4t benzin. Inzerát uvádí typ paliva a volitelně poznámky k mixu (poměr, kdo dodá olej).",
            },
            {
              q: "Akumulátorové — platforma a nabíječka?",
              a: "Rodina napětí (18V/20V, 40V, 60V+) musí sedět k baterii a nabíječce v checklistu kitu. Špatná platforma znamená, že stroj na zahradu nepojede — počet baterií a nabíječku potvrďte při předání.",
            },
            {
              q: "Postroj u těžkých strojů?",
              a: "Rovné hřídele a brushcutter s nožem často potřebují ramenní postroj pro delší práci. Inzerát říká, zda jde o plný postroj, jen popruh, nebo nic — abyste ne drželi těžký stroj sami.",
            },
            {
              q: "Stav struny, cívky a nože při vrácení?",
              a: "Běžné opotřebení struny se počítá; vyprázdněná cívka nebo poškozený nůž mimo zveřejněné pásmo může znamenat poplatek za doplnění nebo broušení z kauce. Vyfoťte hlavu a cívku při převzetí a vrácení, pokud je stav na hraně.",
            },
            {
              q: "Co není v ceně?",
              a: "Evorios neprodává pojištění zahradní práce, plány půjčoven nářadí ani waiver třetích stran. Kauce kryje chybějící cívky, nože, nabíječky nebo škody nad běžné opotřebení; riziko zranění zůstává u bezpečné obsluhy a vašeho OOP.",
            },
          ],
        },
      },
    "Gym & Fitness": {
        "Boxing Equipment": {
          title: "Box — typ výbavy, velikost, hygiena, použití",
          summary: "Víkendové gym kity vyhrávají, když jsou typ výbavy, váha pytle, velikost rukavic, wipe/liner, inventář páru, stojan/úchyt a politika bag-only vs sparring zmrazené spolu s waiverem.",
          qa: [
            {
              q: "Co znamená typ výbavy?",
                a: "Rozděluje inzerát na těžký pytel, rukavice, lapy/pady, ring-corner výbavu nebo mix. To řídí velikost rukavic, stojan/úchyt a hloubku seznamu kusů.",
            },
            {
              q: "Jak funguje pásmo váhy a velikost rukavic?",
                a: "Pásmo váhy je naplněná hmotnost pytle (nebo lehká výbava do 10 lb). Velikost rukavic je youth až XXL nebo smíšený pár — povinné u rukavic a mixu, aby předání sedělo s kartou.",
            },
            {
              q: "Jaká je politika hygieny / wipe nebo lineru?",
                a: "Hostitel uvede wipe před vrácením, povinný liner nebo bandáže, sanitaci mezi půjčkami, vlastní rukavice nájemce, nebo bez kontaktu s kůží. Měkké poznámky mohou doplnit sprej — ne promo prádelny.",
            },
            {
              q: "Proč je povinný inventář páru / sady?",
                a: "Levá/pravá rukavice, bandáže, pady, řetězy a rohové kusy po víkendu mizí. Nájemce potvrdí inventář při rezervaci a spočítá kusy při předání a vrácení.",
            },
            {
              q: "Je součástí stojan nebo úchyt?",
                a: "U pytle, mixu a ring-corner se uvede stojan, stropní/nástěnný úchyt, úchyt není součástí, freestanding základna, nebo N/A. Nájemce musí vědět, zda potřebuje vlastní montáž.",
            },
            {
              q: "Co je politika bag-only vs sparring?",
                a: "Hostitel nastaví jen pytel, jen pady, sparring dle pravidel hostitele, nebo jen demo. Evorios neocertifikuje trenéry ani neschvaluje sparring — platí zveřejněné pravidlo hostitele.",
            },
            {
              q: "Jak funguje liability waiver?",
                a: "Půjčky Gym & Fitness obvykle vyžadují waiver při rezervaci, pokud hostitel neoznačí not required. Waiver kryje běžné riziko zranění; kauce kryje škody a chybějící kusy — ne produkt gym pojištění.",
            },
            {
              q: "Co není součástí?",
                a: "Pokud není uvedeno: koučink, chránič zubů, helma, členství v gymu, retail Title Boxing a jakékoli třetí pojištění. Evorios neprodává boxerské pojištění ani není partner velkých fight shopů.",
            },
          ],
        },
        "Cardio Equipment": {
          title: "Kardio vybavení — typ, váha, otření",
          summary: "Domácí kola, eliptikály, vesla a stair climbery se půjčují čistě, když značka, model, max. váha uživatele, napájení, skládání/půdorys, schody, otření, waiver a poznámka že záruka není v ceně jsou ve smlouvě — záruka není pojištění.",
          qa: [
            {
              q: "Jaké brány platí před půjčením kardia?",
                a: "U půjčení se zmrazí značka, model, typ kardia, skládání, napájení (zásuvka vs baterie), pásmo váhy stroje, max. váha uživatele, schody při stěhování, politika otření, poznámka že záruka není v ceně a stav liability waiver. Měkké tipy pokrývají ochranu podlahy a půdorys.",
            },
            {
              q: "Kolo, eliptikál, veslo — nebo komerční běžecký pás?",
                a: "Tato osobní police je pro domácí upright/spin/recumbent kola, eliptikály, vesla, stair climbery a jiné domácí kardio. Plné komerční běžecké pásy patří na Commercial Treadmills, kde platí pro přesun a kapacita.",
            },
            {
              q: "Proč max. váha uživatele a pásmo váhy stroje?",
                a: "Max. váha uživatele je bezpečnostní limit. Pásmo váhy stroje pomáhá naplánovat nošení a schody. Zůstaňte v uvedené max. váze; překročení může poškodit rám a jít z kauce dle podmínek.",
            },
            {
              q: "Co napájení, skládání, podlaha a schody?",
                a: "Napájení uvádí zásuvku, baterii, obojí nebo žádné/manuální. Skládání a půdorys určují fit v bytě. Schody jsou měkká poznámka k předání — dva lidé, výtah, nebo jen doručení hostitele — ne nabídka stěhovací firmy.",
            },
            {
              q: "Jaké je pravidlo hygienického otření?",
                a: "Hostitel nastaví otřít před vrácením, otření hostitelem s paušálem, jednorázové ubrousky v ceně, nebo lehký pot OK jak přijato. Potvrďte při rezervaci; pot mimo politiku může ovlivnit kauci.",
            },
            {
              q: "Waiver vs zranění — s čím souhlasím?",
                a: "Gym & Fitness ve výchozím stavu vyžaduje liability / assumption-of-risk waiver při rezervaci, pokud hostitel nevybere not required. Waiver pokrývá riziko zranění při běžném použití mezi sousedy; je oddělený od kauce, která kryje poškození vybavení.",
            },
            {
              q: "Je výrobní záruka nebo gym pojištění v ceně?",
                a: "Ne. Peer půjčky jsou as-is s měkkou poznámkou, že záruka není převedena. Evorios neprodává gym pojištění, connected-fitness předplatné ani affiliate plány Planet Fitness / Peloton / Mirror / Tonal.",
            },
            {
              q: "Když se po půjčení něco pokazí?",
                a: "Zveřejněná politika otření, limity váhy a specifikace stroje jsou zmrazené ve smlouvě. Poškození zneužitím, chybějící baterie proti uvedenému napájení nebo nečisté vrácení mimo politiku řeší kauce a zprávy — ne pojišťovací upsell.",
            },
          ],
        },
        "Commercial Treadmills": {
          title: "Komerční běžecké pásy — výkon, váha, stěhování",
          summary: "Komerční pásy potřebují značku/model, motor HP, limit váhy uživatele, deck/sklon, napájení 110/220, přístup při doručení, sanitizaci a jasnou odpovědnost za stěhování/instalaci.",
          qa: [
            {
              q: "Proč jsou komerční běžecké pásy gated?",
                a: "Těžké motory, vysoká zátěž uživatelů a úzké podmínky napájení/cesty dělají špatné předání drahé. Specifikace, sanitizace, waiver a odpovědnost za stěhování uzamknou rezervaci, dokud nejsou splněny.",
            },
            {
              q: "Co znamená motor HP a třída komerčního použití?",
                a: "Pásmo HP je kontinuální výkon, pokud je znám. Třída použití uvádí commercial-rated, light-commercial nebo čestné home-use — měkké zveřejnění zátěže, ne pojistný certifikát.",
            },
            {
              q: "Co je max. váha uživatele?",
                a: "Hostitelovo pásmo jmenovité váhy (do 200 / 250 / 300 lb, 300 lb+ nebo neuvedeno). Nepřekračujte ho; hrozí spory o pás, deck i zranění.",
            },
            {
              q: "Co s napájením, ampéry a poznámkami k doručení?",
                a: "Uveďte 110/120 vs 208/220 (nebo dual / pevná instalace). Měkké pásmo ampérů označí okruh 15A vs 20A+. Poznámky k doručení pokrývají schody, výtah, šířku cesty a kdo nese.",
            },
            {
              q: "Kdo stěhuje a instaluje?",
                a: "Hostitel uvede, zda doručí a nainstaluje, jen doručí, nájemce vyzvedne, použije se třetí stěhovák, nebo se setkáte u obrubníku. Třetí stěhovák je informace — ne partnerská rezervace Evorios.",
            },
            {
              q: "Co znamená sanitizace a motohodiny?",
                a: "Hostitel potvrdí otření madel, konzole a kontaktních ploch pásu před inzerátem nebo předáním. Měkké pásmo hodin je proxy opotřebení, ne zaručený počítadlo.",
            },
            {
              q: "Jak spolu fungují waiver a kauce?",
                a: "Waiver pokrývá předpoklad rizika zranění při běžném použití. Kauce pokrývá poškození vybavení a chybějící části. Jsou to oddělené vrstvy.",
            },
            {
              q: "Co není součástí?",
                a: "Evorios neunderwrituje zranění v posilovně, neprodává gym pojištění a nespolupracuje s dealery Life Fitness, Peloton, Planet Fitness ani promo gym pojištění. Primární vrstvy jsou waiver, kauce a prohlášení hostitele.",
            },
          ],
        },
        "Competition Gear": {
          title: "Závodní výbava — disciplína, kotouče, kit",
          summary: "Půjčky na závody vyhrávají, když jsou disciplína, měkké federální poznámky, kalibrované vs tréninkové kotouče, inventář a hostitelem uvedené poznámky k ose zmrazené s waiverem — bez platformové IWF pečeti.",
          qa: [
            {
              q: "Co znamená pásmo sportovní disciplíny?",
                a: "Označí inzerát jako powerlifting, weightlifting, CrossFit-style, strongman nebo other. To rámcuje očekávání kotoučů a federálních / meet poznámek.",
            },
            {
              q: "Co jsou měkké federální nebo pravidlové poznámky?",
                a: "Text hostitele k místnímu závodu, klubovému standardu nebo federálnímu stylu. Nejde o oficiální partnerství federace a neznamená, že Evorios certifikuje výbavu.",
            },
            {
              q: "Co je disclosure kalibrované vs tréninkové kotouče?",
                a: "Hostitel musí uvést, zda jde o kalibrované závodní kotouče, tréninkové/bumper, mix, náčiní bez kotoučů, nebo ask-host. Špatné označení „comp plates“ je největší spor.",
            },
            {
              q: "Co znamená soft text certifikace osy?",
                a: "Volitelné poznámky hostitele (tvrzení výrobce, předchozí použití na závodě). Evorios nevydává IWF, IPF ani žádné platformové schválení osy.",
            },
            {
              q: "Proč je povinný inventář kitu?",
                a: "Osy, kotouče podle nominálu, zámky, change plates, bloky a popruhy po závodech mizí. Nájemce potvrdí seznam při rezervaci a spočítá kusy při předání a vrácení.",
            },
            {
              q: "Jak zde platí pásmo váhy?",
                a: "Použijte ho pro celkovou zátěž kitu / sady kotoučů (nebo adjustable u částečných sad). Není to max-user-weight rating stroje — ten na této polici není.",
            },
            {
              q: "Jak fungují waiver, kauce a reklamace?",
                a: "Waiver kryje běžné riziko zranění, pokud je vyžadován. Kauce kryje ohnuté osy, chybějící kotouče a poškozené zámky dle inventáře. Evorios neprodává závodní pojištění.",
            },
            {
              q: "Co není součástí?",
                a: "Pokud není uvedeno: startovné, rozhodčí, křída mimo kit, Rogue retail balíčky a jakékoli třetí sportovní pojištění. Platformová IWF/IPF pečeť se nikdy neuvádí.",
            },
          ],
        },
        "Free Weights": {
          title: "Volná závaží — páry, podlaha, drop pravidla",
          summary: "Činky, kettlebelly a sady kotoučů se půjčují čistě, když pásmo váhy, pár vs sada, seznam kusů, stojan, povrch, ochrana podlahy, drop politika a waiver jsou ve smlouvě — kauce kryje poškození vybavení, ne gym pojištění.",
          qa: [
            {
              q: "Jaké brány platí před půjčením volných závaží?",
                a: "U půjčení se zmrazí pásmo váhy, forma pár/jeden/sada, pásmo počtu kusů, stojan/rack, typ povrchu, pravidlo ochrany podlahy, drop politika a stav liability waiver. Vícedílné sady vyžadují i krátký checklist každého kusu.",
            },
            {
              q: "Pár vs sada — proč záleží na počtu kusů?",
                a: "Pár jsou dva kusy; sada může mít mnoho činek, kotoučů, objímek a svorek. Checklist zmrazí, co se musí vrátit — chybějící kotouče nebo objímky jsou nejčastější spor.",
            },
            {
              q: "Je stojan nebo rack v ceně?",
                a: "Hostitel uvede v ceně, není v ceně, volitelný doplněk, nebo neuplatňuje se. Neočekávejte stojan na činky, pokud pole neříká included.",
            },
            {
              q: "Guma vs železo — a ochrana podlahy?",
                a: "Povrch (guma, uretan, holé železo, chrom, mix) ovlivňuje riziko podlahy a hluk. Ochrana může být podložka povinná, doporučená, bumper OK na holé podlaze, nebo podložku dá hostitel — potvrďte při rezervaci.",
            },
            {
              q: "Jaká je drop politika?",
                a: "Žádný drop, jen kontrolované položení, bumper drop OK, jen venku, nebo host nastaví při předání. Drop holého železa proti no-drop může poškodit podlahu i vybavení a jít z kauce.",
            },
            {
              q: "Waiver vs zranění — s čím souhlasím?",
                a: "Gym & Fitness ve výchozím stavu vyžaduje liability / assumption-of-risk waiver při rezervaci, pokud hostitel nevybere not required. Waiver pokrývá riziko zranění při běžném použití; kauce kryje poškozená nebo chybějící závaží — jsou oddělené.",
            },
            {
              q: "Co není v ceně?",
                a: "Přenos výrobní záruky, členství v gymu, spotting služby a pojištění třetích stran nejsou v ceně. Evorios neprodává plány Planet Fitness ani affiliate pojištění.",
            },
            {
              q: "Když se po půjčení něco pokazí?",
                a: "Zveřejněný seznam kusů, drop politika a pravidla povrchu/podlahy jsou zmrazené ve smlouvě. Chybějící kusy, poškození podlahy proti mat-required nebo drop proti no-drop řeší kauce a zprávy.",
            },
          ],
        },
        "Other": {
          title: "Ostatní — nejdřív správná gym police",
          summary: "Preferujte pojmenovanou polici Gym & Fitness, aby platily správné brány. Pokud zůstanete u Ostatní, uveďte typ (kardio/váhy/jóga/regenerace/box/soutěž/trénink/mix), pásmo váhy a waiver, potvrďte fotky stavu a seznam kusů u vícedílné sady.",
          qa: [
            {
              q: "Mám použít Ostatní nebo pojmenovanou polici?",
                a: "Přesuňte inzerát na konkrétní polici, kdykoli to dává smysl — Yoga & Pilates, Cardio Equipment, Free Weights, Resistance Bands, Recovery Tools (osobní), nebo Commercial Treadmills, Weight Machines, Boxing Equipment, Competition Gear, Training Systems (profesionální). Pojmenované police nesou správné brány pro napájení, drop, hygienu nebo kapacitu; Ostatní jen když položka opravdu nepatří jinam.",
            },
            {
              q: "Co znamená typový diskriminátor?",
                a: "Kardio, váhy, jóga, regenerace, box, soutěž, trénink nebo mix říká nájemcům, jaký gear očekávat a kterou pojmenovanou polici byste měli spíš použít. Mix je balíček napříč typy — uveďte upřímně.",
            },
            {
              q: "Proč jsou pásmo váhy a waiver pořád povinné?",
                a: "Gym & Fitness vyžaduje pásmo váhy/odporu v celé kategorii a stav liability waiver u půjčení. Ostatní tyto podlahy nepřeskakuje — i catch-all zmrazí, jak těžký je gear a zda je waiver při rezervaci povinný.",
            },
            {
              q: "Potřebuji max. váhu uživatele u Ostatní?",
                a: "Tvrdé brány max. váhy uživatele jsou u Cardio Equipment, Commercial Treadmills a Weight Machines. Pokud je vaše Ostatní kardio-like, doplňte max. váhu, když můžete — nebo přesuňte na pojmenovanou polici.",
            },
            {
              q: "Potřebuji inventář kusů?",
                a: "U jednoho kusu stačí strukturovaná pole. Vícedílné sady — balíčky pásek, rukavice+bandáže, regenerační balíčky — vyžadují krátký volný seznam každého kusu pro předání a vrácení.",
            },
            {
              q: "Jaké fotky stavu mám potvrdit?",
                a: "Potvrďte, že fotky ukazují položku celkově, úchyty/podložky/šňůry dle typu, viditelné opotřebení nebo poškození a všechny kusy u vícedílné sady. Jde o měkké potvrzení — neověřujeme upload — ale fotky jsou první vrstva u sporů o chybějící díly a poškození.",
            },
            {
              q: "Waiver vs zranění — a co není v ceně?",
                a: "Waiver (když je povinný) pokrývá riziko zranění při běžném použití mezi sousedy; kauce kryje poškozený nebo chybějící gear. Evorios neprodává gym pojištění, předplatné Peloton/Mirror/Tonal ani affiliate plány Planet Fitness — přenos záruky u Ostatní není implicitní.",
            },
            {
              q: "Jak fungují reklamace u Ostatní?",
                a: "Využijte fotky stavu, inventář, pásmo váhy a kauci u chybějících kusů nebo poškození. Příště preferujte pojmenovanou polici, aby specializované brány (otření, drop, max. váha, napájení) byly zmrazené ve smlouvě od začátku.",
            },
          ],
        },
        "Recovery Tools": {
          title: "Regenerační nástroje — typ, výdrž, otření, vzdání se nároků",
          summary: "Sousedské válce a masážní pistole vyhrávají, když jsou jasný typ nástroje, výdrž baterie, hygienické otření, intenzita/rychlost, měkké poznámky k hluku a vzdání se nároků v dohodě.",
          qa: [
            {
              q: "Jaké typy nástrojů jsou na této polici?",
                a: "Pěnové válce, masážní pistole, jiné perkusní přístroje, led/teplo balíčky, sady masážních míčků, nebo smíšené regenerační kity. Zvolte typ podle použití, aby se správně uplatnila výdrž a intenzita.",
            },
            {
              q: "Proč baterie nebo výdrž u motorových nástrojů?",
                a: "Pistole a perkuse potřebují nabití nebo kabel. Inzerát ukáže pod 30 min, 30–60 min, 60+ min, síťové AC, nebo neznámé — naplánujte nabíjení před delší session. Válce a balíčky obvykle nemají pohon.",
            },
            {
              q: "Co je hygienické potvrzení otření?",
                a: "Hostitel uvede otřeno při předání, nájemce otře před/po, povinný povlak, nebo zapečetěná desinfekce. Dodržte pravidlo — nástroje se dotýkají kůže a další nájemce spoléhá na čisté vrácení.",
            },
            {
              q: "Co znamená intenzita nebo rychlost u pistole?",
                a: "Nízká, střední, vysoká, více rychlostí, nebo neznámá/proměnlivá. U neznámého zařízení začněte nízko. Intenzita není lékařská rada — při ostré bolesti přestaňte a dodržujte běžné pokyny hostitele.",
            },
            {
              q: "Proč měkké poznámky k hluku?",
                a: "Perkusní pistole mohou rušit sousedy v bytech. Hostitel může uvést tiché hodiny nebo typický hluk. Jsou to měkká očekávání, ne certifikát naměřených dB.",
            },
            {
              q: "Vzdání vs kauce — co co kryje?",
                a: "Kauce kryje prasklé válce, ztracené nástavce, baterie mimo férové použití a chybějící balíčky. Vzdání se nároků kryje riziko zranění při běžném použití. Jsou oddělené — jedno nenahrazuje druhé.",
            },
            {
              q: "Co není součástí?",
                a: "Žádná fyzioterapie, klinická diagnóza ani členství v posilovně, pokud to hostitel neuvede. Evorios neprodává pojištění posilovny ani affiliate perkusních značek — kauce a podmínky řeší škody a chybějící kusy.",
            },
          ],
        },
        "Resistance Bands": {
          title: "Odporové gumy — síla, kusy, opotřebení, vzdání se nároků",
          summary: "Sousedské sady gum vyhrávají, když jsou jasná síla odporu, inventář kusů, latex vs textil, kotva, stupeň opotřebení/prasknutí a vzdání se nároků v dohodě.",
          qa: [
            {
              q: "Co znamená pásmo síly odporu?",
                a: "Lehká až extra těžká popisuje úsilí u jedné gumy nebo páru. Smíšená progresivní sada znamená více sil v jednom kitu — zkontrolujte inventář podle barev nebo štítků.",
            },
            {
              q: "Proč vypsat každý kus u sady?",
                a: "Rukojeti, dveřní kotvy a malé smyčky mizí po domácím cvičení. Číslovaný checklist při inzerci i vrácení je lepší než dohad při sporu o kauci.",
            },
            {
              q: "Latex vs textil — proč materiál?",
                a: "Latexové smyčky a trubice mohou prasknout nebo spustit alergii; textilní pásky se natahují jinak a praskají méně stejně. Zvolte materiál podle kůže a stylu cvičení.",
            },
            {
              q: "Je dveřní kotva součástí?",
                a: "Inzerát uvádí součástí, jen dveřní kotva, není součástí, nebo dodá hostitel při předání. Pokud chybí, plánujte cviky s vlastní vahou nebo bezpečnou vlastní kotvu — neimprovizujte na křehkých dveřích.",
            },
            {
              q: "Co je disclosure opotřebení / prasknutí?",
                a: "Hostitel hodnotí gumy od jako nové po viditelné vrypy nebo brzy vyměnit. Zkontrolujte při předání; opotřebený latex může selhat pod zátěží. Stupeň zmrazí základ, aby běžné stopy natažení nebyly zaměněny za nové poškození.",
            },
            {
              q: "Vzdání vs kauce — co co kryje?",
                a: "Kauce kryje protržené gumy, chybějící rukojeti a ztracené kotvy. Vzdání se nároků kryje riziko zranění při běžném použití (včetně odmrštění). Jsou oddělené — jedno nenahrazuje druhé.",
            },
            {
              q: "Co není součástí?",
                a: "Žádný trenér, přístup na gym ani členství, pokud to hostitel neuvede. Evorios neprodává pojištění posilovny ani affiliate sportovních řetězců — kauce a podmínky řeší škody a chybějící kusy.",
            },
          ],
        },
        "Training Systems": {
          title: "Tréninkové systémy — typ, instalace, wipe",
          summary: "Studio pop-upy vyhrávají, když jsou typ systému, kotva/instalace, pásmo odporu, max uživatelé, inventář, výška stropu a wipe hygiena zmrazené s waiverem — bez promo Mirror, Tonal nebo TRX.",
          qa: [
            {
              q: "Co znamená typ systému?",
                a: "Rozděluje inzerát na závěsný (strap-style), functional trainer / kabelový sloup, rack s nástavci, smart guided mirror-like jednotku, nebo other. Štítky zůstávají obecné — Evorios nepropaguje Mirror, Tonal ani TRX.",
            },
            {
              q: "Co jsou požadavky na kotvu a instalaci?",
                a: "Hostitel uvede dveřní kotvu, stropní/nástěnný úchyt, freestanding, přišroubovaný/zátěžový rack, kotvu zajistí nájemce, nebo instalaci na místě. Poznámky pokryjí tloušťku dveří nebo půdorys.",
            },
            {
              q: "Jak funguje pásmo váhy a max uživatelé?",
                a: "Pásmo váhy je max stack, odpor, jen vlastní váha, nebo adjustable. Max uživatelé je počet osob najednou (1, 2, malá skupina, třída, nebo not rated) — ne max-user-weight stroje.",
            },
            {
              q: "Proč jsou důležité poznámky k výšce stropu / clearance?",
                a: "Závěsy, racky a kabelové trenažéry potřebují výšku místnosti a prostor pro švih. Nájemce potvrdí prostor před vyzvednutím; chybějící clearance způsobuje poškození stropu.",
            },
            {
              q: "Jaká je politika wipe hygieny?",
                a: "Hostitel nastaví wipe gripů po každém použití, wipe před vrácením, sanitaci hostitelem, wipe obrazovky a gripů, nebo N/A jen venku. Měkké poznámky mohou uvést schválené čističe.",
            },
            {
              q: "Proč je povinný inventář kitu?",
                a: "Madla, popruhy, karabiny, dveřní kotvy, čepy, kabely, ovladače a podložky po pop-upech mizí. Nájemce potvrdí seznam při rezervaci a spočítá kusy při předání a vrácení.",
            },
            {
              q: "Jak fungují waiver, kauce a reklamace?",
                a: "Waiver kryje běžné riziko zranění, pokud je vyžadován. Kauce kryje chybějící nástavce a škody mimo zveřejněné wipe poznámky. Evorios neprodává gym pojištění.",
            },
            {
              q: "Co není součástí?",
                a: "Pokud není uvedeno: práce na kotvení do zdi, statika, Wi-Fi, koučink třídy, předplatné Mirror/Tonal, retail TRX a jakékoli třetí gym pojištění. Brand promo odkazy nejsou součástí rezervace.",
            },
          ],
        },
        "Weight Machines": {
          title: "Posilovací stroje — typ, stack, půdorys",
          summary: "Selektorové, kabelové, Smith a funkční stroje potřebují typ, pásmo stacku nebo plate-loaded, max. váhu uživatele, půdorys, pin/selektor, stav montáže a sanitizaci.",
          qa: [
            {
              q: "Proč jsou posilovací stroje gated?",
                a: "Těžké stacky, kabelové body sevření a špatný půdorys místnosti vedou k neúspěšným předáním. Typ, zátěž, půdorys, pin/selektor, montáž, sanitizace a category waiver uzamknou rezervaci.",
            },
            {
              q: "Co znamená typ stroje?",
                a: "Označuje cable crossover, selectorized stack, Smith, functional trainer, plate-loaded stanici, multi-gym nebo jiné — aby nájemce znal pohybový vzor před rezervací.",
            },
            {
              q: "Co je pásmo odporu / stacku?",
                a: "Je to rozsah weight stacku, dual-stack, plate-loaded nebo neznámé. U plate-loaded uveďte pin jako not-applicable. Zůstaňte v pásmu max. váhy uživatele na podložkách.",
            },
            {
              q: "Co s půdorysem, pinem a montáží?",
                a: "Půdorys odpovídá velikosti místnosti. Pin/selektor zabraňuje sporům o chybějící magnet. Stav montáže říká plně sestaveno, částečně, flat-pack, hostitel instaluje, nebo uvedená pro instalace.",
            },
            {
              q: "Co je zveřejnění opotřebení kabelů?",
                a: "Měkké pole pro kabelové stroje: kabely OK, drobné třepení uvedeno, nedávno vyměněno, není kabelový stroj, nebo neznámé. Je to informace — ne certifikace.",
            },
            {
              q: "Jaká sanitizace se očekává?",
                a: "Hostitel potvrdí otření podložek, rukojetí a pinů před inzerátem nebo předáním. Nájemce potvrdí hygienu při rezervaci a vrátí kontaktní plochy přiměřeně čisté.",
            },
            {
              q: "Jak spolu fungují waiver a kauce?",
                a: "Waiver pokrývá předpoklad rizika zranění při běžném použití. Kauce pokrývá poškození vybavení, chybějící piny a zneužití kabelů nad rámec uvedeného opotřebení. Jsou to oddělené vrstvy.",
            },
            {
              q: "Co není součástí?",
                a: "Evorios neunderwrituje zranění v posilovně, neprodává gym pojištění a nespolupracuje s dealery Life Fitness, Rogue afiliacemi ani promo gym pojištění. Primární vrstvy jsou waiver, kauce a prohlášení hostitele.",
            },
          ],
        },
        "Yoga & Pilates": {
          title: "Jóga a Pilates — podložka, sada, otření, vzdání se nároků",
          summary: "Sousedské podložky a sady vyhrávají, když jsou jasná tloušťka, povrch, inventář kostek/pásků, velikost, pravidlo otření a vzdání se nároků v dohodě.",
          qa: [
            {
              q: "Jaké údaje o podložce zkontrolovat před rezervací?",
                a: "Tloušťku (tenká cestovní vs standard vs silný polštář), typ povrchu (PVC, TPE, guma, korek) a délku/velikost. Rozhodují o komfortu, přilnavosti a tom, zda se vejde k výšce nebo do tašky.",
            },
            {
              q: "Co znamená pásmo sady a inventární checklist?",
                a: "Jen podložka je jeden kus. Sady s kostkami, pásky, kruhy nebo míči musí vypsat každý kus. Spočítejte je při předání — chybějící pomůcky jsou nejčastější spory o kauci.",
            },
            {
              q: "Co je pravidlo hygienického otření?",
                a: "Hostitel nastaví otření před i po, jen po, desinfekci při předání, nebo povinný ručník/povlak. Dodržte uvedené pravidlo, aby výbava po kontaktu s pokožkou zůstala čistá pro dalšího nájemce.",
            },
            {
              q: "Proč je u jógy vzdání se nároků?",
                a: "Jóga a Pilates mohou namáhat klouby nebo způsobit pád. Když hostitel označí vzdání jako povinné, při rezervaci potvrdíte riziko běžného použití — půjčujete od souseda, ne od řetězce studií.",
            },
            {
              q: "Co znamená weightBand u podložky?",
                a: "Je to pásmo hmotnosti/pocitu výbavy (často pod 10 lb nebo jen vlastní váha), ne limit vaší tělesné váhy. Tato police nepoužívá max. váhu uživatele — ta je u strojů a kardia.",
            },
            {
              q: "Co kryje kauce vs vzdání se nároků?",
                a: "Kauce kryje poškození, skvrny a chybějící kostky nebo pásky. Vzdání kryje riziko zranění při běžném použití. Jsou oddělené — jedno nenahrazuje druhé.",
            },
            {
              q: "Co není součástí?",
                a: "Žádná lekce ve studiu, instruktor ani členství v posilovně, pokud to hostitel neuvede. Evorios neprodává pojištění posilovny ani affiliate Planet Fitness / studií — kauce a podmínky řeší škody a chybějící kusy.",
            },
          ],
        },
      },
    "Costume & Cosplay": {
        "Halloween Costumes": {
            title: "FAQ halloweenských kostýmů",
            summary: "Krátké odpovědi k velikosti, kusům, glitteru a čištění.",
            qa: [
              {
                q: "Jaká velikost / publikum?",
                a: "Dle size/fits a kids/teen/adult/family pásma.",
              },
              {
                q: "Jaké kusy?",
                a: "Celý seznam (maska, rukavice, rekvizity)—počítat při předání.",
              },
              {
                q: "Glitter/makeup při vrácení?",
                a: "Dle poznámek; může platit poplatek za čištění.",
              },
              {
                q: "Smoke/fog?",
                a: "Jen pokud politika dovolí.",
              },
              {
                q: "Co kryje kauce?",
                a: "Trhliny a chybějící kusy nad poplatek.",
              },
            ],
          },
        "Character Costumes": {
            title: "FAQ character kostýmů",
            summary: "Krátké odpovědi k postavě, kompletnosti a fit.",
            qa: [
              {
                q: "Jaká postava?",
                a: "Inzerát jmenuje postavu a full vs partial set.",
              },
              {
                q: "Jaké kusy?",
                a: "Každý kus v inventáři—zkontrolujte fotky při vyzvednutí.",
              },
              {
                q: "Zkouška?",
                a: "Dle try-on/fit poznámek.",
              },
              {
                q: "IP / licence?",
                a: "Hostitel řeší IP-safe použití; Evorios licence nečistí.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kusy a trhliny nad poplatek za čištění.",
              },
            ],
          },
        "Wigs & Accessories": {
            title: "FAQ paruk a doplňků",
            summary: "Krátké odpovědi k sanitizaci, vláknu a reset stylu.",
            qa: [
              {
                q: "Je sanitizovaná?",
                a: "Host potvrzuje mezi nájemci—hygiena při rezervaci.",
              },
              {
                q: "Vlákno a velikost čepice?",
                a: "Typ vlákna a cap band na inzerátu—teplo podle vlákna.",
              },
              {
                q: "Mohu přečesat?",
                a: "Jen v rámci style-reset/return politiky.",
              },
              {
                q: "Poplatek za čištění?",
                a: "Jen pokud je publikovaný.",
              },
              {
                q: "Co kryje kauce?",
                a: "Roztavené vlákno, ustřižená krajka a chybějící spony.",
              },
            ],
          },
        "Period Costumes": {
            title: "FAQ dobových kostýmů",
            summary: "Krátké odpovědi k éře, jemnému vrácení a zákazu úprav.",
            qa: [
              {
                q: "Jaká éra?",
                a: "Éra na inzerátu—ověřte před rezervací.",
              },
              {
                q: "Mohu upravit / zkrátit?",
                a: "Ne—platí no-alterations.",
              },
              {
                q: "Jak vracet?",
                a: "Dry-clean-friendly / publikované vrácení + volitelný poplatek.",
              },
              {
                q: "Jaké kusy?",
                a: "Vícedílný inventář včetně spodních vrstev, pokud jsou uvedené.",
              },
              {
                q: "Co kryje kauce?",
                a: "Jemné trhliny, skvrny, chybějící kusy a nepovolené úpravy.",
              },
            ],
          },
        "Masks & Makeup": {
            title: "FAQ masek a makeupu",
            summary: "Krátké odpovědi k sanitizaci, sealed kosmetice a kontaktu s kůží.",
            qa: [
              {
                q: "Je sanitizované?",
                a: "Ano mezi nájemci—hygiena při rezervaci.",
              },
              {
                q: "Sealed nebo open?",
                a: "Inzerát uvádí; preferujte sealed.",
              },
              {
                q: "Co se dotýká kůže?",
                a: "Typ mask/foam/paint je publikovaný.",
              },
              {
                q: "Alergie?",
                a: "Jen měkké poznámky—ne lékařská rada.",
              },
              {
                q: "Kontaminovaná kosmetika?",
                a: "Nezařazujte znovu—nejprve vyměňte.",
              },
            ],
          },
        "Other": {
            title: "FAQ ostatních kostýmů",
            summary: "Krátké odpovědi, když nesedí pojmenovaná police.",
            qa: [
              {
                q: "Použít Other?",
                a: "Raději pojmenovanou polici kvůli správným branám.",
              },
              {
                q: "Co deklarovat?",
                a: "Materiál, vrácení/čištění, foto stavu a seznam kusů u multi-piece.",
              },
              {
                q: "Poplatek za čištění?",
                a: "Jen pokud hostitel publikuje.",
              },
              {
                q: "Co kryje kauce?",
                a: "Skvrny, trhliny a chybějící kusy po poplatku.",
              },
              {
                q: "Partner čistírna?",
                a: "Ne—čištění řešíte vy nebo nájemce.",
              },
            ],
          },
        "Theater Costumes": {
            title: "FAQ divadelních kostýmů",
            summary: "Krátké odpovědi k inventáři, run oknu a zákazu úprav.",
            qa: [
              {
                q: "Jaké kusy v inventáři?",
                a: "Každý wardrobe kus—počítat při předání i vrácení.",
              },
              {
                q: "Mohu upravit?",
                a: "Ne—no-alterations, pokud inzerát neříká jinak.",
              },
              {
                q: "Jaké run okno?",
                a: "Data show/run na inzerátu.",
              },
              {
                q: "Poplatek za čištění?",
                a: "Pokud je, zamrzne ve smlouvě.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kusy a nepovolené střihy/záložky.",
              },
            ],
          },
        "Film & TV Props": {
            title: "FAQ filmových rekvizit",
            summary: "Krátké odpovědi k hero vs background, fragile a looksafe.",
            qa: [
              {
                q: "Hero nebo background?",
                a: "Role grade na inzerátu—hero vyžaduje větší péči.",
              },
              {
                q: "Jak se sledují kusy?",
                a: "Plný inventář při předání i vrácení.",
              },
              {
                q: "Skutečné zbraně?",
                a: "Ne—jen looksafe repliky.",
              },
              {
                q: "Fragile handling?",
                a: "Dodržte fragile pásmo a continuity tagy.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící/rozbité hero kusy a poškození povrchu.",
              },
            ],
          },
        "Professional Makeup Kits": {
            title: "FAQ pro makeup sad",
            summary: "Krátké odpovědi k sanitizaci, sealed refill a inventáři štětců.",
            qa: [
              {
                q: "Je sada sanitizovaná?",
                a: "Ano mezi umělci.",
              },
              {
                q: "Sealed vs open?",
                a: "Dle sealed/refill politiky.",
              },
              {
                q: "Kolik štětců?",
                a: "Brush-count + inventář—počítat při vrácení.",
              },
              {
                q: "Lékařské claimy?",
                a: "Jen měkké skin-safe poznámky.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící štětce/palety; kontaminované open produkty vyměňte.",
              },
            ],
          },
        "Animatronic Props": {
            title: "FAQ animatroniky",
            summary: "Krátké odpovědi k napájení, runtime, vzdání a demu.",
            qa: [
              {
                q: "Napájení a runtime?",
                a: "Battery/AC/air/static a runtime pásmo na inzerátu.",
              },
              {
                q: "Vzdání se nároků?",
                a: "Ano při rezervaci.",
              },
              {
                q: "Demo?",
                a: "Host ukáže start/stop a keep-clear zóny při předání.",
              },
              {
                q: "Indoor/outdoor?",
                a: "Dodržte limity prostředí.",
              },
              {
                q: "Co kryje kauce?",
                a: "Mechanické poškození a chybějící ovladače.",
              },
            ],
          },
        "Full Character Suits": {
            title: "FAQ full suitů",
            summary: "Krátké odpovědi k teplu, hygieně, cyklům nošení a spotterovi.",
            qa: [
              {
                q: "Teplo a viditelnost?",
                a: "Host potvrzuje vedení—potvrďte před rezervací.",
              },
              {
                q: "Interiér sanitizovaný?",
                a: "Ano mezi nájemci.",
              },
              {
                q: "Jak dlouho nepřetržitě?",
                a: "Dodržte max. minuty souvislého nošení; dělejte pauzy.",
              },
              {
                q: "Spotter?",
                a: "Dle handler/spotter politiky.",
              },
              {
                q: "Vzdání?",
                a: "Ano. Poznámky k nošení nejsou lékařská rada.",
              },
            ],
          },
      },
    "Baby & Kids": {
        "Car Seats": {
            title: "FAQ autosedaček",
            summary: "Krátké odpovědi k expiraci, standardu a sanitizaci.",
            qa: [
              {
                q: "Expirovaná / recall?",
                a: "Ne—publikace i rezervace se blokují.",
              },
              {
                q: "Jaký standard?",
                a: "Host deklaruje FMVSS (US) nebo ECE R129/R44 (EU) ze štítku.",
              },
              {
                q: "Sanitizace?",
                a: "Ano mezi nájemci—potvrďte při rezervaci.",
              },
              {
                q: "Jaké foto?",
                a: "Čitelné foto štítku na inzerátu.",
              },
              {
                q: "Po nehodě?",
                a: "Nikdy znovu nezařazujte—nepředávejte.",
              },
            ],
          },
        "Cribs & Beds": {
            title: "FAQ postýlek",
            summary: "Krátké odpovědi ke spánkovým standardům, drop-side a matraci.",
            qa: [
              {
                q: "Drop-side?",
                a: "Ne.",
              },
              {
                q: "Jaký sleep standard?",
                a: "CPSC, EN 716 nebo jiný regionální ze štítku.",
              },
              {
                q: "Matrace?",
                a: "Pevná dle inzerátu; sanitizujte spací plochu.",
              },
              {
                q: "Mantinely / volné deky?",
                a: "Nepoužívejte.",
              },
              {
                q: "Co potvrzuje nájemce?",
                a: "Sleep standard, recall, matraci a sanitizaci při rezervaci.",
              },
            ],
          },
        "Strollers": {
            title: "FAQ kočárků",
            summary: "Krátké odpovědi k typu, hmotnosti a hygieně.",
            qa: [
              {
                q: "Jaký typ?",
                a: "Travel, jogger, double aj.—na inzerátu.",
              },
              {
                q: "Věk/hmotnost?",
                a: "Dodržte limity.",
              },
              {
                q: "Sanitizace?",
                a: "Ano mezi nájemci.",
              },
              {
                q: "Adaptéry na sedačku?",
                a: "Jen pokud jsou uvedené—chybějící = inventář.",
              },
              {
                q: "Kontrola při vyzvednutí?",
                a: "Brzdy/kola a recall.",
              },
            ],
          },
        "Baby Carriers": {
            title: "FAQ nosítek",
            summary: "Krátké odpovědi k hmotnosti, hygieně a fit.",
            qa: [
              {
                q: "Věk/hmotnost?",
                a: "Dodržte pásmo (newborn vs toddler, pokud je).",
              },
              {
                q: "Sanitizace látky?",
                a: "Ano mezi nájemci.",
              },
              {
                q: "Recall?",
                a: "Povinný před pronájmem.",
              },
              {
                q: "Fit?",
                a: "Podle návodu výrobce—žádné lékařské claimy Evorios.",
              },
              {
                q: "Poškozené přezky?",
                a: "Nepůjčujte—zastavte předání.",
              },
            ],
          },
        "Toys & Games": {
            title: "FAQ hraček",
            summary: "Krátké odpovědi k věku, small parts a počtu kusů.",
            qa: [
              {
                q: "Věk / hazard?",
                a: "Zachovejte štítky 0+/3+/8+ (nebo uvedené)—nesnímejte je.",
              },
              {
                q: "Sanitizace?",
                a: "Ano mezi nájemci.",
              },
              {
                q: "Small parts?",
                a: "Dodržte hazard pásmo kvůli dušení.",
              },
              {
                q: "Jak sledovat kusy?",
                a: "Počítejte při vyzvednutí i vrácení.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kusy.",
              },
            ],
          },
        "Other": {
            title: "FAQ ostatního baby gear",
            summary: "Krátké odpovědi, když nesedí pojmenovaná police.",
            qa: [
              {
                q: "Použít Other?",
                a: "Raději Car Seats, Cribs, Strollers nebo Carriers u safety-critical.",
              },
              {
                q: "Základy?",
                a: "Věk/hmotnost při kontaktu s dítětem + kauce a podmínky.",
              },
              {
                q: "Hygiena?",
                a: "Sanitizujte high-touch i na Other.",
              },
              {
                q: "Co kryje kauce?",
                a: "Stav zdokumentovaný při předání.",
              },
              {
                q: "Chybí specializované brány?",
                a: "Přeřaďte na správnou polici.",
              },
            ],
          },
        "Commercial Play Equipment": {
            title: "FAQ komerčního herního vybavení",
            summary: "Krátké odpovědi k certifikaci, kapacitě a vzdání.",
            qa: [
              {
                q: "Jaká certifikace?",
                a: "ASTM F1487 / CPSC / EN 1176 (nebo uvedené)—host deklaruje.",
              },
              {
                q: "Kapacita?",
                a: "Nepřekračujte publikovanou.",
              },
              {
                q: "Vzdání?",
                a: "Ano při rezervaci.",
              },
              {
                q: "Sanitizace mezi skupinami?",
                a: "Ano.",
              },
              {
                q: "Co fotit?",
                a: "Setup při předání; přeplnění = sdílené riziko.",
              },
            ],
          },
        "Group Activity Gear": {
            title: "FAQ skupinových aktivit",
            summary: "Krátké odpovědi ke sdílené hygieně a inventáři.",
            qa: [
              {
                q: "Sanitizace mezi skupinami?",
                a: "Ano—plus recall.",
              },
              {
                q: "Věkové pásmo?",
                a: "Dodržte publikované.",
              },
              {
                q: "Inventář kusů?",
                a: "Počítejte při vyzvednutí i vrácení.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kusy.",
              },
              {
                q: "Proč hygiena?",
                a: "Sdílené dětské věci = bacily a ztráty kusů.",
              },
            ],
          },
        "Educational Tools": {
            title: "FAQ vzdělávacích pomůcek",
            summary: "Krátké odpovědi k věku, čištění a nabíječkám.",
            qa: [
              {
                q: "Věkové pásmo?",
                a: "Jen v publikovaném rozsahu.",
              },
              {
                q: "Sanitizace?",
                a: "Ano—touch surfaces mezi nájemci.",
              },
              {
                q: "Elektronika s bateriemi?",
                a: "Recall-check; nabíječky v inventáři.",
              },
              {
                q: "Kontrola při předání?",
                a: "Zapnutí a přítomnost nabíječky.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící nabíječky a poškozené kusy.",
              },
            ],
          },
        "Safety Systems": {
            title: "FAQ bezpečnostních systémů",
            summary: "Krátké odpovědi k branám, monitorům a instalaci.",
            qa: [
              {
                q: "Jak se instaluje?",
                a: "Dle cesty: documented / renter with guide / pro.",
              },
              {
                q: "Tlakové brány na schodech?",
                a: "Ne nahoře na schodech—jen hardware-mount, pokud je potřeba.",
              },
              {
                q: "Hardware v sadě?",
                a: "Počítejte úchyty při předání i vrácení.",
              },
              {
                q: "Co potvrzuje nájemce?",
                a: "Install path před odemčením.",
              },
              {
                q: "Chybějící úchyty?",
                a: "Inventární reklamace proti kauci.",
              },
            ],
          },
        "Childcare Equipment": {
            title: "FAQ childcare vybavení",
            summary: "Krátké odpovědi k jídelním židlím, houpačkám a bouncerům.",
            qa: [
              {
                q: "Věk/hmotnost?",
                a: "Dodržte limity.",
              },
              {
                q: "Co sanitizovat?",
                a: "Tácy, popruhy a high-touch povrchy.",
              },
              {
                q: "Recall?",
                a: "Povinný před pronájmem.",
              },
              {
                q: "Poškozený popruh?",
                a: "Nepůjčujte—zastavte předání.",
              },
              {
                q: "Co potvrzuje nájemce?",
                a: "Hygienu a recall při rezervaci.",
              },
            ],
          },
      },
    "Heavy Equipment": {
        "Generators": {
          title: "Generátory — fáze, start, výdrž, hluk",
          summary: "Přenosné i domácí standby generátory jdou půjčit, když jsou fáze, start, výdrž, převodový přepínač, hluk, výkon/palivo, pojištění a inventář kabelů/oleje zmrazené.",
          qa: [
            {
              q: "Jaké brány platí před půjčením generátoru?",
              a: "Pronájem zmrazí značku, výkon, palivo, fázi, start, výdrž, převodový přepínač, hluk, limity pojištění a krátký inventář (kabely, olej, trychtýř). Jen pro profíky zůstává, dokud host bránu nevypne.",
            },
            {
              q: "Jednofáz, split, nebo třífáz?",
              a: "Fáze říká, co unese. Invertorový přenosný je pro citlivou elektroniku — ne pro třífázovou stavbu.",
            },
            {
              q: "Je převodový přepínač v ceně?",
              a: "Host značí v ceně / není / zajistí nájemce / N/A přenosný. Špatný zásah do rozvaděče není krytý jistotou.",
            },
            {
              q: "Palivo, olej a vrácení?",
              a: "Typ paliva je na inzerátu. Vraťte dle poznámek — obvykle jak převzato. Špatné palivo = riziko kauce.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Osobní Generátory ne. Průmyslové generátory ano — obecný doklad obsluhy před předáním.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad fyzického poškození před PIN/klíči. Držení karty ≈ spoluúčast; pojištění je primární. Chybějící kabely jdou z kauce.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný elektrikář, žádné připojení k síti, žádná promo United Rentals. Evorios neprodává pojištění generátorů.",
            },
          ],
        },
        "Air Compressors": {
          title: "Kompresory — CFM, nádoba, PSI, hadice",
          summary: "Sousedské kompresory potřebují CFM, velikost nádoby, max PSI, pohon, hadice/rychlospojky, výkon/palivo, pojištění a inventář.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí značku, výkon/palivo, CFM, nádobu, max PSI, pohon, hadicovou sadu, pojištění a inventář.",
            },
            {
              q: "Jak spolu fungují CFM a PSI?",
              a: "CFM je průtok pro nářadí; PSI tlak. Malý CFM zastaví hřebíkovačky — držte se pásem.",
            },
            {
              q: "Je hadice a spojky v ceně?",
              a: "Komplet / částečně / jen spojky / zajistí nájemce. Spočítejte při předání.",
            },
            {
              q: "Elektřina vs benzín?",
              a: "Pohon určuje zásuvku vs palivo. Benzínové ven; elektrické dle okruhu.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození před startem; kauce ≈ spoluúčast. Chybějící hadice z kauce.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný olejový předplatný servis, žádná promo půjčovny, žádný upsell pojištění.",
            },
          ],
        },
        "Pressure Washers": {
          title: "Tlakové myčky — PSI, GPM, trysky, povrchy",
          summary: "Myčky jdou půjčit s PSI, GPM, pohonem, sadou trysek, politikou povrchů, pojištěním a inventářem.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Pronájem zmrazí PSI, GPM, pohon, trysky, politiku povrchů, výkon/palivo, pojištění a inventář.",
            },
            {
              q: "Mohu mýt měkkou fasádu nebo auta?",
              a: "Jen pokud to politika povrchů dovolí. Hardscape-only = ne na měkkou fasádu.",
            },
            {
              q: "Jaké trysky a nástavce jsou v sadě?",
              a: "Komplet / částečně / jen tyč / nic — spočítejte tipy při předání.",
            },
            {
              q: "Teplá voda vs studená?",
              a: "Pohon: elektřina, benzín nebo diesel s teplou vodou, pokud je uvedeno.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození + kauce ≈ spoluúčast. Poškození mimo politiku z kauce.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné mýdlo na předplatné, žádná detailing promo, žádné pojištění myčky od Evorios.",
            },
          ],
        },
        "Winches": {
          title: "Navijáky — tah, uchycení, lano, dálkové",
          summary: "Navijáky potřebují tah, uchycení, typ lana, dálkové, kladku, oprávnění obsluhy, pojištění a inventář.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Tah, uchycení, lano, dálkové, kladka, výkon/palivo, pojištění, inventář + obecný doklad obsluhy.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano — navijáky jdou přes obecný heavy credential.",
            },
            {
              q: "Ocel vs syntetika?",
              a: "Typ lana je zmrazený. Nekombinujte. Poškození proti fotkám = baseline nároku.",
            },
            {
              q: "Je kladka nebo dálkové v ceně?",
              a: "Host značí v ceně / není / N/A. Spočítejte při předání.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození; kauce ≈ spoluúčast. Chybějící příslušenství z kauce.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný recovery tým, žádná Warn promo, žádný upsell pojištění.",
            },
          ],
        },
        "Pumps": {
          title: "Čerpadla — typ, průtok, šroubení, pevné látky",
          summary: "Transfer a kalová čerpadla potřebují typ, průtok, velikost přírub, práci s pevnými látkami, hadice, pojištění a inventář.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Typ, GPM, vstup/výstup, pevné látky, hadice, výkon/palivo, pojištění, inventář.",
            },
            {
              q: "Čistá voda vs kal?",
              a: "Pásmo pevných látek říká, co smíte čerpat. Kal do čisté vody zničí oběžné kolo.",
            },
            {
              q: "Jsou sací a výtlačné hadice v ceně?",
              a: "Obě / jen sací / jen výtlačné / částečně / žádné.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Osobní Pumps ne. Heavy Pumps ano.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný instalatér na zavolání, žádná promo protipovodňové firmy.",
            },
          ],
        },
        "Industrial Generators": {
          title: "Průmyslové generátory — režim, uložení, uzemnění",
          summary: "Stavební a standby agregáty přidávají režim, uložení a poznámky k uzemnění navíc k fázi, výdrži a oprávnění obsluhy.",
          qa: [
            {
              q: "Co navíc oproti osobním generátorům?",
              a: "Režim (standby/prime/continuous/fleet), uložení (skid/přívěs/kontejner/pad) a text uzemnění + obecný doklad obsluhy.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano.",
            },
            {
              q: "Co musí pokrýt uzemnění?",
              a: "Host uvede očekávání bondingu/uzemnění a kdo ověří před zapnutím.",
            },
            {
              q: "Přívěs vs skid?",
              a: "Uložení zmrazí dopravu. Tažení může vyžadovat samostatný inzerát tahače.",
            },
            {
              q: "Pojištění a kauce?",
              a: "COI / fyzické poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné povolení k síti, žádná promo národní půjčovny.",
            },
          ],
        },
        "Forklifts": {
          title: "Vysokozdvižné vozíky — třída, nosnost, stožár",
          summary: "Vozíky zmrazí třídu, nosnost, výšku stožáru, pneumatiky, palivo/baterii, manuál, hodiny, pojištění a forklift oprávnění.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Třída, nosnost, stožár, pneu, palivo/baterie, manuál, výkon/hodiny, pojištění + forklift doklad.",
            },
            {
              q: "Potřebuji forklift oprávnění?",
              a: "Ano — před rezervací/startem.",
            },
            {
              q: "Třídy 1–5?",
              a: "Elektrický sedící, úzká ulička, paletový, cushion, pneumatický — podle podlahy a práce.",
            },
            {
              q: "Nosnost a stožár?",
              a: "Držte se publikovaných limitů. Přetížení = zneužití proti kauci.",
            },
            {
              q: "LPG vs baterie?",
              a: "Pásmo říká, kdo dodá palivo nebo nabité baterie a stav při vrácení.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození; kauce ≈ spoluúčast — ne plná náhrada.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný OSHA kurz na prodej, žádná dealer promo, žádné pojištění vozíku od Evorios.",
            },
          ],
        },
        "Industrial Compressors": {
          title: "Průmyslové kompresory — režim, sušička, CFM",
          summary: "Provozní kompresory přidávají režim a sušičku vzduchu navíc k CFM, nádobě, PSI a oprávnění obsluhy.",
          qa: [
            {
              q: "Co navíc oproti osobním kompresorům?",
              a: "Režim (přerušovaný/continuous/plant) a sušička v ceně/ne/N/A + obecný doklad obsluhy.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano.",
            },
            {
              q: "Proč režim?",
              a: "Continuous/plant očekává jiný cyklus než víkendový hřebíkovač.",
            },
            {
              q: "Je sušička v ceně?",
              a: "Ano / ne / N/A. Vlhký vzduch kazí nářadí.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Fyzické poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný servisní výjezd, žádná promo půjčovny.",
            },
          ],
        },
        "Hydraulic Equipment": {
          title: "Hydraulika — funkce, PSI, průtok, spojky",
          summary: "Jednotky, válce, bourací kladiva a rozpínače potřebují funkci, tlak, průtok, typ spojky, hadice, oprávnění a pojištění.",
          qa: [
            {
              q: "Jaké brány platí?",
              a: "Funkce, PSI, GPM, spojky, hadicová sada, výkon/palivo, pojištění, inventář + obecný doklad obsluhy.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano.",
            },
            {
              q: "ISO-A vs flat-face?",
              a: "Typ spojky musí sedět na nářadí. Násilné párování teče olej.",
            },
            {
              q: "Je hadicová sada v ceně?",
              a: "Ano / částečně / ne — spočítejte při předání.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Doklad poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný hydraulický servis, žádná Enerpac promo.",
            },
          ],
        },
        "Heavy Pumps": {
          title: "Těžká čerpadla — typ, průtok, zasání",
          summary: "Profi čerpadla přidávají metodu zasání navíc k typu, průtoku, šroubení, pevným látkám a oprávnění obsluhy.",
          qa: [
            {
              q: "Co navíc oproti osobním čerpadlům?",
              a: "Metoda zasání + obecný doklad obsluhy.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Ano.",
            },
            {
              q: "Kdo zasává?",
              a: "Self-prime / ruční / ponorné N/A. Suchý běh ničí těsnění.",
            },
            {
              q: "Pevné látky a chemikálie?",
              a: "Držte se publikovaného pásma.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Fyzické poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádná městská bypass četa, žádná promo fleet yard.",
            },
          ],
        },
        "Other": {
          title: "Heavy ostatní — druh, kusy, fotky",
          summary: "Záchytná police musí uvést druh, počet kusů, hloubku fotek a podlahové brány kategorie — přeřaďte, když sedí pojmenovaná police.",
          qa: [
            {
              q: "Kdy použít Other?",
              a: "Jen když opravdu nesedí Generátory, kompresory, myčky, navijáky, čerpadla, vozíky ani hydraulika.",
            },
            {
              q: "Jaké brány stále platí?",
              a: "Druh, počet kusů, checklist fotek, výkon/palivo, pojištění. Více kusů = inventář.",
            },
            {
              q: "Potřebuji oprávnění obsluhy?",
              a: "Pokud druh sedí na forklift/winch/hydrauliku/průmyslový agregát — přeřaďte na správnou polici.",
            },
            {
              q: "Checklist fotek?",
              a: "Celkové / celkové + vady / všechny kusy + vady — baseline nároku.",
            },
            {
              q: "Pojištění a kauce?",
              a: "Stejná commercial cesta: doklad poškození; kauce ≈ spoluúčast.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné eseje „jak jsme se domluvili“, žádná promo půjčovny.",
            },
          ],
        },
      },
    "Party & Events": {
        "Tables & Chairs": {
          title: "Stoly a židle — počet, kapacita, stavba",
          summary: "Sady stolů a židlí jdou snadno pronajmout, když jsou na smlouvě počet kusů, kapacita hostů, půdorys a případný poplatek za stavbu.",
          qa: [
            {
              q: "Jaký pás počtu kusů je povinný?",
              a: "Host uvádí, kolik stolů/židlí je v sadě (1–4 až 50+). Počet ověřte při předání i vrácení — chybějící židle jdou z kauce.",
            },
            {
              q: "Co znamená kapacita hostů?",
              a: "Pás sezení, pro které je sada určena (1–4 až 100+). Jde o plánování, ne o certifikát požární bezpečnosti.",
            },
            {
              q: "Je stavba / demontáž v ceně?",
              a: "Volitelný poplatek za stavbu/demontáž se zobrazí, když ho host zveřejní. Jinak předpokládejte, že staví nájemce.",
            },
            {
              q: "Potřebují stoly politiku zrušení kvůli počasí?",
              a: "Jen při venkovním půdorysu (zahrada / velký outdoor). Vnitřní sály obvykle označí not_outdoor.",
            },
            {
              q: "Co kryje kauce?",
              a: "Skvrny, zlomené nohy, chybějící kusy nad běžné opotřebení — ne pojištění akce.",
            },
            {
              q: "Co není v ceně?",
              a: "Pokud není uvedeno: ubrusy, dekorace, dovoz navíc a jakékoli promo pojištění akcí nebo velkoobchodních půjčoven.",
            },
          ],
        },
        "Tents & Canopies": {
          title: "Stany a markýzy — rozměr, počasí, kotvení",
          summary: "Venkovní stany potřebují pás rozměru, okno zrušení kvůli počasí a jasné poznámky ke kolíkům/zátěži.",
          qa: [
            {
              q: "Jaké pásy rozměrů stanu existují?",
              a: "Host volí 10×10, 10×20, 20×20, 20×40, větší nebo jiný pop-up. Slaďte pás s počtem hostů a pravidly místa.",
            },
            {
              q: "Je zrušení kvůli počasí povinné?",
              a: "Ano u venkovních stanů — plná refundace 24 h, 12 h, uvážení hostitele, nebo not_outdoor. Okno se zmrazí ve smlouvě.",
            },
            {
              q: "Kdo kotví a zatěžuje markýzu?",
              a: "Podle půdorysu a případného poplatku za stavbu. Kolíky/zátěž obvykle dodá nájemce, pokud host neoznačí instalaci.",
            },
            {
              q: "Co s elektřinou pod stanem?",
              a: "Osobní stany nevyžadují pás napájení; přidejte poznámku k světlům. Profi světla/zvuk mají vlastní brány napájení.",
            },
            {
              q: "Co kryje kauce?",
              a: "Protržené plachty, ohnuté rámy, chybějící tyče/kolíky — ne pojištění větru od Evorios.",
            },
            {
              q: "Co není v ceně?",
              a: "Povolení, elektrikář a affiliate pojištění stanů od Party City / Sunbelt nejsou součástí rezervace.",
            },
          ],
        },
        "Party Decor": {
          title: "Párty dekorace — kapacita, barva, vrácení",
          summary: "Balónky, pozadí a měkká dekorace zůstávají u souseda + kauce, když jsou jasné kapacita, barva a očekávání čistoty.",
          qa: [
            {
              q: "Která pole jsou nejdůležitější?",
              a: "Kapacita hostů, doporučená barva a půdorys. Měkká dekorace nevyžaduje sanitaci cateringu ani profi napájení.",
            },
            {
              q: "Potřebuji zrušení kvůli počasí?",
              a: "Jen pokud je dekorace jen venku a host zveřejní okno. Vnitřní dekorace to většinou přeskočí.",
            },
            {
              q: "Glitr, dým nebo otevřený oheň?",
              a: "Dodržujte pravidla místa a poznámky hostitele. Škoda z neuvedeného glitru/dýmu může jít z kauce.",
            },
            {
              q: "Co s poplatkem za stavbu?",
              a: "Volitelný — zveřejní se, když host staví oblouky/pozadí. Jinak instaluje nájemce.",
            },
            {
              q: "Co kryje kauce?",
              a: "Protržená látka, chybějící díly pozadí a skvrny nad běžné opotřebení.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádná floristika, žádná záruka hélia, žádné promo pojištění dekorací.",
            },
          ],
        },
        "Games & Activities": {
          title: "Hry a aktivity — kapacita, půdorys, kusy",
          summary: "Zahradní hry potřebují kapacitu, půdorys a checklist kusů, aby se vrátily pytlíky a pálky.",
          qa: [
            {
              q: "Co má host zveřejnit?",
              a: "Kapacitu hostů, půdorys (stolní až velký outdoor) a případný poplatek, pokud host instaluje.",
            },
            {
              q: "Jak předejít chybějícím kusům?",
              a: "Spočítejte pytlíky, pálky a míče při předání. Vyfoťte sadu — kauce kryje chybějící herní díly.",
            },
            {
              q: "Uvnitř vs venku?",
              a: "Půdorys plus zrušení kvůli počasí u venkovních aktivit. Vnitřní herní večery obvykle počasí neřeší.",
            },
            {
              q: "Je potřeba elektřina?",
              a: "Na této osobní polici ne. Elektronické automaty patří spíš na Electronics nebo Sound Systems.",
            },
            {
              q: "Co kryje kauce?",
              a: "Ztracené kusy a poškozené desky nad běžné hraní — ne pojištění zranění.",
            },
            {
              q: "Co není v ceně?",
              a: "Obsluha atrakcí, ceny a affiliate pojištění párty her.",
            },
          ],
        },
        "Serving Equipment": {
          title: "Servírovací vybavení — sanitace, kapacita, vrácení",
          summary: "Chafingy, dávkovače a servírovací sady vyžadují při pronájmu potvrzení sanitace a kapacitu hostů.",
          qa: [
            {
              q: "Proč je sanitace potvrzená?",
              a: "Kusy v kontaktu s jídlem musí host potvrdit jako čisté před inzerátem/předáním. Nájemce potvrdí čisté vrácení při rezervaci.",
            },
            {
              q: "Co znamená pás kapacity?",
              a: "Orientační počet hostů — ne hygienický certifikát od Evorios.",
            },
            {
              q: "Potřebuji zrušení kvůli počasí?",
              a: "Jen u venkovního servírování. Vnitřní bufety obvykle not_outdoor.",
            },
            {
              q: "Palivo / sterno?",
              a: "Podle poznámek hostitele. Gelové palivo obvykle dodá nájemce; zneužití může jít z kauce.",
            },
            {
              q: "Co kryje kauce?",
              a: "Prohnutí, chybějící pokličky/naběračky a nečisté vrácení nad politiku sanitace.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný catering personál, žádná NSF certifikace od Evorios, žádné promo gastro dodavatelů.",
            },
          ],
        },
        "Other": {
          title: "Párty ostatní — přesuňte na pojmenovanou polici",
          summary: "Catch-all stále uvádí kapacitu a půdorys; přesuňte na Stoly, Stany, Dekor, Hry, Servírování, Pódium, Zvuk, Světla, Photobooth nebo Catering, když sedí jejich brány.",
          qa: [
            {
              q: "Kdy použít Other?",
              a: "Jen když nesedí žádná pojmenovaná Party police. Pojmenované police nesou rozměr stanu, počet kusů, napájení nebo sanitaci.",
            },
            {
              q: "Co stále platí?",
              a: "Kapacita hostů, doporučený půdorys/barva, volitelný poplatek za stavbu a zrušení kvůli počasí venku.",
            },
            {
              q: "Profi AV vs měkká dekorace?",
              a: "Pódium, zvuk, světla, photobooth a catering patří na profesionální police kvůli napájení a sanitaci.",
            },
            {
              q: "Co kryje kauce?",
              a: "Škodu a chybějící příslušenství podle fotek a checklistu.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádné vágní „jak domluveno“, žádné Party City / affiliate pojištění.",
            },
          ],
        },
        "Stage & Risers": {
          title: "Pódia a risery — napájení, kapacita, stavba",
          summary: "Profi pódia uvádějí kapacitu, napájení, půdorys a případný poplatek za stavbu/demontáž před předáním.",
          qa: [
            {
              q: "Jaké možnosti napájení existují?",
              a: "Žádné/baterie, standard 120 V, vyhrazených 20 A, 240 V/generátor, nebo dodá host. Špatný okruh zkazí load-in.",
            },
            {
              q: "Je poplatek za stavbu běžný?",
              a: "Ano u profi pódií — když je zveřejněn, zmrazí se ve smlouvě včetně toho, kdo staví.",
            },
            {
              q: "Venkovní pódia a počasí?",
              a: "Venkovní půdorys vyžaduje okno zrušení (24 h / 12 h / uvážení hostitele / not_outdoor).",
            },
            {
              q: "Co s nosností?",
              a: "Kapacita hostů je plánování. Nosnost pro tanec/kapelu řešte v poznámkách — Evorios necertifikuje statiku.",
            },
            {
              q: "Co kryje kauce?",
              a: "Ohnuté rámy, chybějící sukně/nohy a poškození povrchu nad běžné opotřebení.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádní stagehandi, pokud nejsou uvedeni, žádná povolení, žádné promo produkčního pojištění.",
            },
          ],
        },
        "Sound Systems": {
          title: "Zvuk na akci — napájení, kapacita, stavba",
          summary: "PA zvuk na akci potřebuje napájení, kapacitu, půdorys a případný poplatek — ne spotřebitelské boomboxy.",
          qa: [
            {
              q: "Jaká brána napájení platí?",
              a: "Host musí nastavit baterii, 120 V, 20 A, 240 V/generátor, nebo host poskytuje. Ampéry rozhodují u subbasů.",
            },
            {
              q: "Je to stejné jako Music & Audio?",
              a: "Event Sound Systems jsou Party profi AV. Přenosné reproduktory patří na Music & Audio → Portable Speakers.",
            },
            {
              q: "Kabely a stojany?",
              a: "Spočítejte mikrofony, stojany a hadice při předání. Chybějící příslušenství jde z kauce.",
            },
            {
              q: "Hluk / sousedé?",
              a: "Dodržujte místo a noční klid. Soft poznámky mohou nastavit max hlasitost — ne obecní povolení.",
            },
            {
              q: "Co kryje kauce?",
              a: "Spálené reproduktory zneužitím, chybějící amp/kabely a kosmetické poškození.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný DJ talent, pokud není uveden, žádné Sweetwater affiliate, žádné pojištění akce.",
            },
          ],
        },
        "Event Lighting": {
          title: "Světla na akci — napájení, půdorys, stavba",
          summary: "Uplighty a wash světla jdou dobře pronajmout, když jsou na smlouvě napájení, kapacita, půdorys a poplatek za stavbu.",
          qa: [
            {
              q: "Jaké napájení je potřeba?",
              a: "Stejný profi pás jako u ostatního Party AV — 120 V, 20 A, 240 V/generátor, baterie, nebo host poskytuje.",
            },
            {
              q: "Kdo věší a ostří?",
              a: "Volitelný poplatek, když instaluje host. Jinak věší nájemce podle pravidel místa.",
            },
            {
              q: "Počasí u venkovních stožárů?",
              a: "Venkovní půdorys potřebuje politiku zrušení. Vnitřní sály obvykle not_outdoor.",
            },
            {
              q: "Je v sadě DMX / konzole?",
              a: "Jen pokud je uvedeno. Spočítejte ovladače, kabely a svorky při předání.",
            },
            {
              q: "Co kryje kauce?",
              a: "Spálené reflektory ze špatného napětí, chybějící svorky/gely a pádové poškození.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný lighting designer, pokud není uveden, žádné ADJ affiliate, žádné produkční pojištění.",
            },
          ],
        },
        "Photo Booths": {
          title: "Photobooth — napájení, kapacita, rekvizity",
          summary: "Photobooth zmrazí napájení, kapacitu, půdorys a případný poplatek; při předání spočítejte rekvizity a tiskárnu.",
          qa: [
            {
              q: "Jaké napájení booth potřebuje?",
              a: "Host zveřejní profi pás napájení. Většina boothů chce vyhrazený vnitřní okruh — ověřte před akcí.",
            },
            {
              q: "Je stavba v ceně?",
              a: "Když je zveřejněn poplatek za stavbu/demontáž, instalace hostitele se zmrazí ve smlouvě. Jinak skládá nájemce.",
            },
            {
              q: "Rekvizity, album, tisky?",
              a: "Spočítejte pozadí, rekvizity, papír a tiskárnu při předání. Chybějící sada jde z kauce.",
            },
            {
              q: "Venkovní booth?",
              a: "Venkovní půdorys vyžaduje zrušení kvůli počasí. Mnozí hostitelé označí not_outdoor kvůli elektronice.",
            },
            {
              q: "Co kryje kauce?",
              a: "Poškozené tiskárny, chybějící iPady/kamery v sadě a protržené pozadí.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádná obsluha, pokud není uvedena, žádné Smilebooth franchise promo, žádné affiliate pojištění.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Catering vybavení — sanitace, napájení, kapacita",
          summary: "Profi catering vyžaduje potvrzení sanitace, pás napájení a kapacitu hostů před předáním.",
          qa: [
            {
              q: "Proč sanitace + napájení dohromady?",
              a: "Plochy v kontaktu s jídlem potřebují potvrzení sanitace; ohřevy a studené vany správný okruh (120 V / 20 A / 240 V / host).",
            },
            {
              q: "Jak se liší od Serving Equipment?",
              a: "Catering Equipment je profi police — napájení plus sanitace. Osobní Serving se soustředí na sanitaci a kapacitu bez profi napájení.",
            },
            {
              q: "NSF nebo hygienická povolení?",
              a: "Host může soft zmínit NSF. Evorios nepovoluje hygienu — platí místo a místní právo.",
            },
            {
              q: "Počasí u venkovního cateringu?",
              a: "Venkovní půdorys potřebuje okno zrušení kvůli počasí.",
            },
            {
              q: "Co kryje kauce?",
              a: "Nečisté vrácení, chybějící gastronádoby/pokličky a poškození nad běžný provoz.",
            },
            {
              q: "Co není v ceně?",
              a: "Žádný kuchařský personál, žádné affiliate gastro odkazy, žádné pojištění potravin od Evorios.",
            },
          ],
        },
      },
    "Outdoor & Camping": {
          Tents: {
            title: "Stany — kapacita, sezóna, hygiena",
            summary: "Peer půjčky stanů fungují, když jsou zmrazené pásmo spánku, sezóna, balená hmotnost a potvrzení o vyčištění/vyvětrání.",
            qa: [
              {
                q: "Jaké brány platí před půjčkou stanu?",
                a: "Nájem zmrazí kapacitu osob, sezónní rating a hygienický checklist. Hostitel musí potvrdit sanitizaci/vyvětrání; při rezervaci potvrdíte vrácení čisté a suché.",
              },
              {
                q: "Co znamená kapacita a sezóna?",
                a: "Kapacita je počet osob. Sezóna (1–4) nastavuje očekávané počasí — není zárukou proti bouři.",
              },
              {
                q: "Proč balená hmotnost?",
                a: "Pomáhá rozhodnout batoh vs auto-camping. Soft doporučení — ověřte před nošením.",
              },
              {
                q: "Jaká je hygienická pravidla?",
                a: "Sdílené spací přístřešky potřebují potvrzení hostitele. Rezervace je blokovaná, dokud není attested; vy potvrdíte čisté a suché vrácení.",
              },
              {
                q: "Co fotit?",
                a: "Tyče, fly, kolíky a stav látky při předání a vrácení — chybějící tyče a protržený fly často spouští kauci.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící tyče, kolíky, šňůry a škody nad běžné opotřebení — ne pojištění počasí nebo storna výletu.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádné členství REI, žádná montáž stanu ani outdoor pojištění od Evorios.",
              },
            ],
          },
          "Sleeping Bags": {
            title: "Spací pytle — teplota, hygiena",
            summary: "Pytle se půjčují čistě, když je na smlouvě teplotní pásmo a potvrzení sanitizace.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Spací pytle vyžadují teplotní pásmo a Outdoor hygienický checklist. Hostitel potvrdí vyčištění; rezervace je blokovaná do attestation.",
              },
              {
                q: "Jak číst teplotní pásmo?",
                a: "Je to zveřejněná comfort třída (nad 50 °F až pod 0 °F). Zůstaňte v ní — riziko chladu nese nájemce, ne kauce.",
              },
              {
                q: "Platí stále kapacita?",
                a: "Ano — Outdoor kapacita a sezóna dávají kontext velikosti/sezóny pytle.",
              },
              {
                q: "Hygienické pravidlo?",
                a: "Sdílený spací gear: attestation hostitele a váš ack při rezervaci vrátit pytel čistý a suchý.",
              },
              {
                q: "Co fotit?",
                a: "Zipy, baffly a skvrny při vyzvednutí a vrácení. Chybějící vak nebo poškození vložky může jít z kauce.",
              },
              {
                q: "Waiver vs kauce?",
                a: "Hygiena je vrstva důvěry. Kauce kryje chybějící kusy a znečištění nad politikou — ne hypotermii ani pojištění výletu.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádné promo prádelny spacáků ani outdoor zdravotní pojištění od Evorios.",
              },
            ],
          },
          Backpacks: {
            title: "Batohy — kapacita, hmotnost, fit",
            summary: "Batohy se půjčují, když jsou kapacita, sezóna a balená hmotnost upřímné pro fit a nošení.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Outdoor nájem stále vyžaduje kapacitu a sezónu. Balená hmotnost je doporučená u overnight batohů.",
              },
              {
                q: "Jak číst kapacitu u batohu?",
                a: "Pásmo jako třída zátěže (den vs více dní). Fit/torso ověřte v popisu před rezervací.",
              },
              {
                q: "Je hygienický checklist?",
                a: "U Batohů ne ve výchozím stavu. Soft poznámky k čistému vrácení stejně pomáhají.",
              },
              {
                q: "Co fotit?",
                a: "Bederní pás, popruhy, zipy a pláštěnku. Chybějící pláštěnky a protržené pásy jsou časté reklamace.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící víka, pláštěnky a poškození rámu nad běžné opotřebení — ne ztracené osobní věci uvnitř.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádný průvodce, žádné REI členství ani outdoor pojištění od Evorios.",
              },
            ],
          },
          "Camp Cooking": {
            title: "Camp cooking — palivo, díly, oheň",
            summary: "Vařiče potřebují zmrazený typ paliva s kontextem kapacity/sezóny, aby nájemce vezl správné kartuše a vrátil všechny díly.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Camp Cooking vyžaduje typ paliva (isobutan, white gas, propan, alkohol, dřevo, elektřina nebo multi-fuel) plus Outdoor kapacitu/sezónu.",
              },
              {
                q: "Proč typ paliva?",
                a: "Špatné palivo může zničit vařič a jde z kauce. Před odjezdem sladťe kartuše/lahve se zveřejněným typem.",
              },
              {
                q: "Jsou hrnce a palivo v ceně?",
                a: "Jen co uvádí inventář. Při předání spočítejte hořáky, zástěny, pumpy a hrnce.",
              },
              {
                q: "Oheň a leave-no-trace?",
                a: "Dodržujte místní zákazy ohňů a soft poznámky hostitele. Zákazy a požární riziko jsou mimo kauci.",
              },
              {
                q: "Co fotit?",
                a: "Nohy vařiče, adaptér, pumpu a nádobí. Chybějící pumpy a prasklé zástěny spouští reklamace.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící díly vařiče a poškození nádobí — ne spotřebované palivo ani spálené jídlo.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádné předplatné kartuší ani pojištění camp cooking od Evorios.",
              },
            ],
          },
          "Navigation & GPS": {
            title: "Navigace a GPS — napájení, mapy, vrácení",
            summary: "Ruční GPS se půjčí, když je kontext kapacity/sezóny a jasné očekávání napájení a map před vzdálenými výlety.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Stále se zveřejňuje Outdoor kapacita a sezóna. Před off-grid použitím ověřte baterii a mapové poznámky.",
              },
              {
                q: "Jsou mapy a předplatné v ceně?",
                a: "Jen pokud je uvedeno. Offline mapy a satelitní předplatné deklaruje hostitel — není to affiliate Garmin/onX.",
              },
              {
                q: "Napájení a nabití při vrácení?",
                a: "Vraťte dle poznámek (obvykle podobné nabití). Chybějící nabíječky jdou z kauce.",
              },
              {
                q: "Je povinný waiver?",
                a: "U osobní Navigace & GPS ne ve výchozím stavu. Survival / expedition mají samostatné waiver brány.",
              },
              {
                q: "Co fotit?",
                a: "Jednotku, anténu/držák a nabíječku. Prasklé displeje a chybějící kolébky jsou časté reklamace.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádné rescue předplatné, žádné promo map a žádné navigační pojištění od Evorios.",
              },
            ],
          },
          Other: {
            title: "Outdoor ostatní — raději přeraďte",
            summary: "Preferujte pojmenovanou Outdoor polici kvůli hygieně, palivu nebo waiveru. Other stále zmrazí kapacitu a sezónu.",
            qa: [
              {
                q: "Mám zůstat na Other?",
                a: "Přeraďte na Stany, Spací pytle, Batohy, Camp Cooking, Navigaci, Expediční stany, Survival, Group Shelters, Pro navigaci nebo Base Camp, když to sedí.",
              },
              {
                q: "Co platí i na Other?",
                a: "Kapacita osob a sezóna zůstávají povinné. Balená hmotnost je doporučená při nošení.",
              },
              {
                q: "Platí hygiena nebo waiver?",
                a: "Jen když hostitel označí required, nebo jde jasně o stan/spánek či survival/expedition. Pojmenované police to vymáhají automaticky.",
              },
              {
                q: "Co fotit?",
                a: "Celkový stav a každý doplněk. Vague sady bez fotek kusů vedou ke sporům o kauci.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící doplňky a škody nad běžné outdoor opotřebení dle inzerátu.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádné catch-all outdoor pojištění ani promo big-box půjčoven od Evorios.",
              },
            ],
          },
          "Expedition Tents": {
            title: "Expediční stany — sezóna, hygiena, waiver",
            summary: "Alpské/expediční přístřešky zmrazí kapacitu, sezónu, hygienickou attestation a liability waiver před rezervací.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Expediční stany vyžadují kapacitu, sezónu, hygienický checklist se sanitizací a stav liability waiveru.",
              },
              {
                q: "Proč waiver?",
                a: "Vysoké riziko horského přístřešku. Při rezervaci potvrdíte riziko běžného použití, pokud hostitel neoznačí not required — půjčujete od souseda, ne od guide služby.",
              },
              {
                q: "Hygiena vs běžné stany?",
                a: "Stejné pravidlo spacího přístřešku: hostitel potvrdí vyčištění; vy vrátíte přiměřeně čisté a suché.",
              },
              {
                q: "Co fotit?",
                a: "Tyče, fly, sněhové kolíky a guyline sady. Expediční hardware mizí po víkendech.",
              },
              {
                q: "Kauce vs waiver?",
                a: "Waiver kryje běžné riziko zranění mezi peer; kauce kryje chybějící tyče/kolíky a poškození látky.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádná guided expedice, žádné alpine rescue cover ani outdoor pojištění od Evorios.",
              },
            ],
          },
          "Survival Gear": {
            title: "Survival gear — waiver, kapacita, reklamace",
            summary: "Survival sady zmrazí kapacitu/sezónu a liability waiver, aby riziko zůstalo u běžného použití mezi peer.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Survival Gear vyžaduje stav liability waiveru plus Outdoor kapacitu a sezónu.",
              },
              {
                q: "Proč waiver?",
                a: "Survival trénink a vzdálené použití nesou riziko zranění. Potvrďte assumption of risk při rezervaci, pokud hostitel neoznačí not required.",
              },
              {
                q: "Je povinná hygiena?",
                a: "Ne ve výchozím stavu, pokud sada nemá sdílený spací gear — pak může hostitel označit hygienu. Spací věci raději na Spací pytle / Stany.",
              },
              {
                q: "Co inventarizovat?",
                a: "Nože, křesadla, signalizaci a lékárničku. Spočítejte každý kus při předání.",
              },
              {
                q: "Kauce vs waiver?",
                a: "Waiver řeší běžné riziko zranění; kauce kryje chybějící nebo poškozené kusy — ne zdravotní ani záchranné náklady.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádný certifikát kurzu, žádné SAR předplatné ani outdoor zdravotní pojištění od Evorios.",
              },
            ],
          },
          "Group Shelters": {
            title: "Skupinové přístřešky — kapacita, sezóna, díly",
            summary: "Skupinové přístřešky se půjčují, když kapacita (často group_shelter) a sezóna sedí na stopu akce.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Kapacita a sezóna jsou povinné. Použijte group_shelter, když jde o eventovou velikost, ne batohový stan.",
              },
              {
                q: "Je povinná hygiena?",
                a: "Ne ve výchozím stavu, pokud hostitel neoznačí. Soft čisté/suché vrácení stejně snižuje spory o plíseň.",
              },
              {
                q: "Počasí a kolíky?",
                a: "Sezóna není záruka větru. Ověřte sadu kolíků/zátěží a místní počasí před stavbou.",
              },
              {
                q: "Co fotit?",
                a: "Rám, látku, kolíky a zátěže. Chybějící zátěže po větru jsou časté reklamace.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící tyče, kolíky, zátěže a trhliny nad běžné opotřebení — ne pojištění storna kvůli počasí.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádný personál akce, žádné weather-cancel pojištění ani promo party půjčoven od Evorios.",
              },
            ],
          },
          "Professional Navigation": {
            title: "Pro navigace — inventář, napájení, mapy",
            summary: "Pro GPS / survey navigace potřebují kontext kapacity/sezóny a jasné napájení, držáky a mapy před terénem.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Stále se zveřejňuje Outdoor kapacita a sezóna. Před vzdálenou prací ověřte baterii, držák a anténu v inzerátu.",
              },
              {
                q: "Mapy a software?",
                a: "Jen hostitelem deklarované balíčky nebo licence. Evorios neprodává Garmin, Trimble ani onX.",
              },
              {
                q: "Je povinný waiver?",
                a: "Na této polici ne ve výchozím stavu. Survival a Expediční stany mají tvrdé waiver brány.",
              },
              {
                q: "Co fotit?",
                a: "Přijímač, anténu, tyče/držáky a nabíječky. Chybějící tyče a kolébky jdou z kauce.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící doplňky a poškození hardware — ne ztracená data ani obnovu předplatného.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádná survey posádka, žádné promo softwarových seatů ani navigační pojištění od Evorios.",
              },
            ],
          },
          "Base Camp Equipment": {
            title: "Base camp — kapacita, sezóna, inventář",
            summary: "Stoly, kuchyně a basecamp sady se půjčí, když kapacita/sezóna sedí a každý kus je v inventáři.",
            qa: [
              {
                q: "Jaké brány platí?",
                a: "Kapacita a sezóna jsou povinné. Balená hmotnost pomáhá, když se gear nosí do tábora.",
              },
              {
                q: "Hygiena nebo waiver?",
                a: "Ne ve výchozím stavu. Pokud sada obsahuje stany nebo spací gear, přeraďte tyto kusy, aby platily hygiena/waiver.",
              },
              {
                q: "Proč inventář?",
                a: "Basecamp sady ztrácejí židle, lucerny a stoly. Zveřejněte seznam a spočítejte při předání/vrácení.",
              },
              {
                q: "Co fotit?",
                a: "Celou sadu při vyzvednutí a vrácení. Chybějící stoličky a lucerny jsou typické reklamace.",
              },
              {
                q: "Co kryje kauce?",
                a: "Chybějící kusy a škody nad běžné opotřebení — ne jídlo, palivo ani pojištění výletu.",
              },
              {
                q: "Co není v ceně?",
                a: "Žádný táborový personál, žádné outfitter pojištění ani REI / fleet promo od Evorios.",
              },
            ],
          },
        },
  },
};
