import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Party & Events */
export const subs_Party_and_Events: Record<string, CategoryFactBlock> = {
        "Tables & Chairs": {
          title: "Tables & chairs — count, capacity, setup",
          summary: "Folding sets rent cleanly when piece count, guest capacity, footprint, and optional setup fee are frozen on the agreement.",
          qa: [
            {
              q: "What piece-count band is required?",
              a: "Hosts publish how many tables/chairs are in the set (1–4 up through 50+). Confirm the count at handoff and return — missing chairs drive deposit claims.",
            },
            {
              q: "What does guest capacity mean?",
              a: "The seating band the set is meant to support (1–4 through 100+). It is planning guidance, not a venue fire-code certificate.",
            },
            {
              q: "Is setup / teardown included?",
              a: "Optional setup/teardown fee appears when the host publishes one. If blank, assume renter sets up unless messages say otherwise.",
            },
            {
              q: "Do tables need a weather cancel policy?",
              a: "Only when the footprint is outdoor (backyard / outdoor large). Indoor hall sets usually mark not_outdoor or leave soft décor rules.",
            },
            {
              q: "What does the deposit cover?",
              a: "Stains, broken legs, missing chairs/tables beyond normal event wear — not a party-insurance product.",
            },
            {
              q: "What is not included?",
              a: "Unless listed: linens, centerpieces, delivery beyond the listing, and any third-party event-insurance or big-box party-rental promo.",
            },
          ],
        },
        "Tents & Canopies": {
          title: "Tents & canopies — size, weather, stakes",
          summary: "Outdoor footprint tents need size band, weather-cancel window, and clear stake/weight notes before booking.",
          qa: [
            {
              q: "What tent size bands exist?",
              a: "Hosts pick 10×10, 10×20, 20×20, 20×40, larger, or pop-up other. Match the band to your guest count and venue rules.",
            },
            {
              q: "Is weather cancel required?",
              a: "Yes for outdoor tents/canopies — full refund 24h, 12h, host discretion, or not_outdoor if truly indoor-only. The window freezes on the agreement.",
            },
            {
              q: "Who stakes and weights the canopy?",
              a: "Follow the listing footprint and any setup fee. Renter usually supplies stakes/weights unless the host marks install included.",
            },
            {
              q: "What about power under the tent?",
              a: "Personal tent shelves do not force a power band; add soft notes if you need lights or heaters. Pro lighting/sound shelves carry power gates.",
            },
            {
              q: "What does the deposit cover?",
              a: "Torn panels, bent frames, missing poles/stakes listed in the kit — not wind-damage insurance from Evorios.",
            },
            {
              q: "What is not included?",
              a: "Permit pulls, electrician hookups, and Party City / Sunbelt-style tent-insurance affiliates are not part of booking.",
            },
          ],
        },
        "Party Decor": {
          title: "Party décor — capacity, color, return care",
          summary: "Balloons, backdrops, and soft décor stay neighbor + deposit when guest capacity, color, and return-clean expectations are clear.",
          qa: [
            {
              q: "What fields matter most?",
              a: "Guest capacity band, recommended color, and setup footprint. Soft décor does not require catering sanitize or pro power gates.",
            },
            {
              q: "Do I need weather cancel?",
              a: "Only if the décor is outdoor-only and the host publishes a weather window. Most indoor décor skips it.",
            },
            {
              q: "Glitter, fog, or open flame?",
              a: "Follow venue rules and any host notes. Damage from undisclosed glitter/smoke can use deposit.",
            },
            {
              q: "What about setup fee?",
              a: "Optional — published when the host installs arches/backdrops. Otherwise renter installs.",
            },
            {
              q: "What does the deposit cover?",
              a: "Torn fabric, missing backdrop pieces, and stain beyond normal wear.",
            },
            {
              q: "What is not included?",
              a: "No florist labor, no helium tank guarantee, no third-party décor-insurance promo.",
            },
          ],
        },
        "Games & Activities": {
          title: "Games & activities — capacity, footprint, pieces",
          summary: "Yard games and activity kits need guest capacity, footprint, and a clear piece checklist so cornhole bags and paddles come back.",
          qa: [
            {
              q: "What should the host publish?",
              a: "Guest capacity band, setup footprint (tabletop through outdoor large), and optional setup fee if host installs.",
            },
            {
              q: "How do I avoid missing pieces?",
              a: "Count bags, paddles, balls, and scoreboards at handoff. Photo the full kit — deposit covers missing game pieces.",
            },
            {
              q: "Indoor vs outdoor?",
              a: "Footprint plus weather cancel when the activity is outdoor-only. Indoor game nights usually skip weather cancel.",
            },
            {
              q: "Is power required?",
              a: "Not on this personal shelf. Electronic arcade-style items may belong on Electronics or Sound Systems if they need dedicated circuits.",
            },
            {
              q: "What does the deposit cover?",
              a: "Lost pieces and broken boards beyond normal play wear — not injury insurance.",
            },
            {
              q: "What is not included?",
              a: "Staffed carnival operators, prize inventory, and big-box party-game insurance affiliates.",
            },
          ],
        },
        "Serving Equipment": {
          title: "Serving equipment — sanitize, capacity, return",
          summary: "Chafers, drink dispensers, and serving kits require a sanitization attestation on rent plus guest capacity.",
          qa: [
            {
              q: "Why is sanitization attested?",
              a: "Food-contact pieces must be host-attested clean before list/handoff. Renters acknowledge return-clean expectations at booking.",
            },
            {
              q: "What capacity band means?",
              a: "Guest capacity guides how many the set is sized for — not a health-department certificate from Evorios.",
            },
            {
              q: "Do I need weather cancel?",
              a: "Only for outdoor serving footprints. Indoor buffet kits usually mark not_outdoor.",
            },
            {
              q: "Fuel cans / sterno?",
              a: "Follow host notes. Open-flame gel fuel is renter-supplied unless listed; misuse can use deposit.",
            },
            {
              q: "What does the deposit cover?",
              a: "Dents, missing lids/ladles, and unclean return beyond the sanitize policy.",
            },
            {
              q: "What is not included?",
              a: "No caterer staffing, no NSF certification by Evorios, no restaurant-supply affiliate promo.",
            },
          ],
        },
        "Other": {
          title: "Party other — re-shelf when a named shelf fits",
          summary: "Catch-all party gear still publishes guest capacity and footprint; move to Tables, Tents, Decor, Games, Serving, Stage, Sound, Lighting, Photo Booths, or Catering when those gates fit.",
          qa: [
            {
              q: "When should I use Other?",
              a: "Only when no named Party shelf fits. Named shelves carry tent size, piece count, power, or sanitize gates renters expect.",
            },
            {
              q: "What still applies?",
              a: "Guest capacity band, recommended footprint/color, optional setup fee, and weather cancel when outdoor.",
            },
            {
              q: "Pro AV vs soft décor?",
              a: "Stage, sound, lighting, photo booths, and catering belong on professional shelves so power and sanitize gates apply.",
            },
            {
              q: "What does the deposit cover?",
              a: "Damage and missing accessories against photos and the listing checklist.",
            },
            {
              q: "What is not included?",
              a: "No vague “as discussed” essays, no Party City / peer-insurance affiliate promo.",
            },
          ],
        },
        "Stage & Risers": {
          title: "Stage & risers — power, capacity, setup fee",
          summary: "Pro stages publish guest/performer capacity, power needs, footprint, and optional setup/teardown fee before handoff.",
          qa: [
            {
              q: "What power options exist?",
              a: "None/battery, standard 120V, dedicated 20A, 240V/generator, or host provides. Wrong circuit fails load-in — check before you book.",
            },
            {
              q: "Is setup fee common?",
              a: "Yes for pro stages — when published, the fee freezes on the agreement with who installs risers.",
            },
            {
              q: "Outdoor stages and weather?",
              a: "Outdoor footprints require a weather-cancel window (24h / 12h / host discretion / not_outdoor).",
            },
            {
              q: "What about load ratings?",
              a: "Guest capacity band is planning guidance. Follow host notes for dancer/band load; Evorios does not certify structural engineering.",
            },
            {
              q: "What does the deposit cover?",
              a: "Bent frames, missing skirting/legs, and surface damage beyond ordinary event wear.",
            },
            {
              q: "What is not included?",
              a: "No stagehand crew unless listed, no venue permit service, no third-party event-production insurance promo.",
            },
          ],
        },
        "Sound Systems": {
          title: "Event sound — power, capacity, setup",
          summary: "PA-style event sound needs published power, guest capacity, footprint, and optional setup fee — not consumer boombox shelves.",
          qa: [
            {
              q: "What power gate applies?",
              a: "Hosts must set none/battery, 120V, dedicated 20A, 240V/generator, or host provides. Amps and circuits matter for sub stacks.",
            },
            {
              q: "Is this the same as Music & Audio?",
              a: "Event Sound Systems are Party pro AV for venues. Everyday portable speakers belong on Music & Audio → Portable Speakers.",
            },
            {
              q: "Cables and stands?",
              a: "Count mics, stands, and snakes at handoff. Missing accessories claim against deposit.",
            },
            {
              q: "Noise / neighbor rules?",
              a: "Follow venue and local quiet hours. Host soft notes may set max volume — not a municipal permit.",
            },
            {
              q: "What does the deposit cover?",
              a: "Blown speakers from misuse, missing amps/cables, and cosmetic damage beyond normal load-in wear.",
            },
            {
              q: "What is not included?",
              a: "No DJ talent unless listed, no Sweetwater / Guitar Center affiliate promo, no event-insurance upsell.",
            },
          ],
        },
        "Event Lighting": {
          title: "Event lighting — power, footprint, setup",
          summary: "Uplights, wash, and intelligent lights rent cleanly when power, capacity, footprint, and setup fee are on the agreement.",
          qa: [
            {
              q: "What power is required?",
              a: "Same pro power band as other Party AV — 120V, dedicated 20A, 240V/generator, battery, or host provides.",
            },
            {
              q: "Who hangs and focuses?",
              a: "Optional setup/teardown fee when the host installs. Otherwise renter hangs per venue rules and soft listing notes.",
            },
            {
              q: "Weather for outdoor light trees?",
              a: "Outdoor footprints need a weather-cancel policy. Indoor ballroom kits usually mark not_outdoor.",
            },
            {
              q: "DMX / console included?",
              a: "Only if listed. Count controllers, cables, and clamps at handoff.",
            },
            {
              q: "What does the deposit cover?",
              a: "Burned fixtures from wrong voltage, missing clamps/gels, and drop damage.",
            },
            {
              q: "What is not included?",
              a: "No lighting designer labor unless listed, no ADJ/Chauvet retail affiliate, no production-insurance promo.",
            },
          ],
        },
        "Photo Booths": {
          title: "Photo booths — power, capacity, props",
          summary: "Booth rentals freeze power needs, guest capacity, footprint, and optional setup fee; count props and printers at handoff.",
          qa: [
            {
              q: "What power does a booth need?",
              a: "Hosts publish the pro power band. Most booths want a dedicated indoor circuit — confirm before the event.",
            },
            {
              q: "Is setup included?",
              a: "When a setup/teardown fee is published, host install freezes on the agreement. Otherwise renter assembles per instructions.",
            },
            {
              q: "Props, album, prints?",
              a: "Count backdrop, props, paper, and printer at handoff. Missing prop kits use deposit.",
            },
            {
              q: "Outdoor booths?",
              a: "Outdoor footprints require weather cancel. Many hosts mark not_outdoor for electronics.",
            },
            {
              q: "What does the deposit cover?",
              a: "Damaged printers, missing iPads/cameras listed in the kit, and backdrop tears.",
            },
            {
              q: "What is not included?",
              a: "No attendant talent unless listed, no Smilebooth franchise promo, no event-insurance affiliate.",
            },
          ],
        },
        "Catering Equipment": {
          title: "Catering equipment — sanitize, power, capacity",
          summary: "Pro catering gear requires sanitization attestation, power band, and guest capacity before rent handoff.",
          qa: [
            {
              q: "Why sanitize + power together?",
              a: "Food-contact surfaces need host sanitize attest; warmers and cold wells need the correct circuit (120V / 20A / 240V / host provides).",
            },
            {
              q: "How is this different from Serving Equipment?",
              a: "Catering Equipment is the pro shelf — power gates plus sanitize. Personal Serving Equipment focuses on sanitize and capacity without pro power.",
            },
            {
              q: "NSF or health permits?",
              a: "Hosts may note NSF status softly. Evorios does not certify health permits — venues and local law still apply.",
            },
            {
              q: "Weather for outdoor catering?",
              a: "Outdoor footprints need a weather-cancel window.",
            },
            {
              q: "What does the deposit cover?",
              a: "Unclean return, missing pans/lids, and damage beyond ordinary service wear.",
            },
            {
              q: "What is not included?",
              a: "No chef staffing, no restaurant-supply affiliate links, no food-liability insurance product from Evorios.",
            },
          ],
        },
      };

export const parentCategoryKey = "Party & Events" as const;
