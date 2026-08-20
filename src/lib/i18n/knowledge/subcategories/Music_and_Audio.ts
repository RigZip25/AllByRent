import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Music & Audio */
export const subs_Music_and_Audio: Record<string, CategoryFactBlock> = {
        "Guitars & Bass": {
          title: "Guitars & bass \u2014 form, case, strings, cable",
          summary: "Peer guitars and basses rent cleanly when instrument form, case, string condition, cable include, and a short kit list are frozen with serial and deposit.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, instrument form (acoustic/electric/bass), case include, string condition, cable include, and a recommended kit checklist (strap, picks, capo).",
            },
            {
              q: "Hard case or gig bag?",
              a: "Hosts mark hard case, soft gig bag, flight case, no case, or optional add-on. Assume nothing ships protected unless the field says so.",
            },
            {
              q: "Who brings the cable?",
              a: "Cable included, not included, wireless-only, or ask at handoff. Electric and bass players should confirm before pickup.",
            },
            {
              q: "What about string condition?",
              a: "Fresh, good/playable, worn-replace-soon, or ask host. Worn strings are disclosure \u2014 not a free restring service.",
            },
            {
              q: "Deposit and claims?",
              a: "Deposit covers body damage, missing case/cable against the list, and broken hardware. Evorios does not sell guitar insurance.",
            },
            {
              q: "What is not included?",
              a: "Unless listed: amp, pedals, restring, lessons, and Guitar Center / Sweetwater affiliate kits.",
            },
          ],
        },
        "Keyboards": {
          title: "Keyboards \u2014 type, keys, stand, power",
          summary: "Digital pianos and synths need type, key count, stand/pedal include, power class, case, and kit list before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, keyboard type, key-count band, stand/pedal include, power class, case include, and kit checklist.",
            },
            {
              q: "88-key vs compact?",
              a: "Key-count band (25\u201388 or other) sets repertoire fit. Controllers are not weighted digital pianos \u2014 read the type field.",
            },
            {
              q: "Are stand and pedals included?",
              a: "Stand+pedals, stand only, pedals only, neither (renter provides), or built-in console. Do not assume a stand ships.",
            },
            {
              q: "Power class?",
              a: "Under 50W through 1000W+ or passive. Confirm outlet access before events.",
            },
            {
              q: "Deposit and claims?",
              a: "Missing pedals, stands, and power supplies against the checklist use deposit. No keyboard insurance product.",
            },
            {
              q: "What is not included?",
              a: "No bench unless listed, no DAW license, no retail synth affiliate.",
            },
          ],
        },
        "Drums": {
          title: "Drums \u2014 kit form, pieces, hardware",
          summary: "Acoustic and e-kits need form, piece count, hardware include, and a full inventory so snares, cymbals, and pedals return counted.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, kit form, piece-count band, hardware include, and a kit checklist naming every drum, cymbal, and stand.",
            },
            {
              q: "Full kit or single piece?",
              a: "Form splits acoustic kit, e-kit, snare-only, cymbal pack, hardware-only, hand percussion, or other \u2014 so renters know what arrives.",
            },
            {
              q: "Is hardware included?",
              a: "Full hardware+throne+pedals, stands only, pedals only, none, or e-kit module/rack. Missing throne/pedals are top disputes.",
            },
            {
              q: "Why the piece checklist?",
              a: "Cymbals and clamps vanish after gigs. Confirm the list at booking; count at handoff and return.",
            },
            {
              q: "Deposit and claims?",
              a: "Deposit covers cracked shells, missing cymbals, and bent stands against inventory \u2014 not drum insurance.",
            },
            {
              q: "What is not included?",
              a: "No cartage crew, no practice-pad affiliate, no mesh-head subscription.",
            },
          ],
        },
        "Portable Speakers": {
          title: "Portable speakers \u2014 form, power, splash, charge",
          summary: "Consumer/portable Bluetooth and party speakers need form, power source, outdoor/splash band, return-charge rule, and cable notes \u2014 not stage PA.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, speaker form, power class, battery vs AC, outdoor/splash band, return-charge band, and kit checklist.",
            },
            {
              q: "Is this PA Systems?",
              a: "No. Portable Speakers is consumer/party gear. Stage stacks with stands and XLRs belong on PA Systems.",
            },
            {
              q: "Battery or AC?",
              a: "Battery-only, AC-only, dual, or passive. Return-charge rules (full / as-received / \u226550%) apply to battery units.",
            },
            {
              q: "Outdoor / splash?",
              a: "Indoor-only, covered patio OK, splash-resistant, or keep dry. Poolside misuse against indoor-only can use deposit.",
            },
            {
              q: "Neighbor volume?",
              a: "Hosts may note soft quiet-hour guidance. Evorios does not certify HOA compliance.",
            },
            {
              q: "What is not included?",
              a: "No Best Buy Geek Squad, no Fat Llama PA upsell, no stage wattage gates from the PA shelf.",
            },
          ],
        },
        "Microphones": {
          title: "Microphones \u2014 type, phantom, cable, hygiene",
          summary: "Mics rent cleanly when type, 48V need, clip/cable kit, case, hygiene wipe, and serial are on the agreement.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, mic type, phantom need, clip/cable include, case, hygiene wipe policy, and kit checklist.",
            },
            {
              q: "Do I need 48V phantom?",
              a: "Needs 48V, no phantom, optional, battery mic, or ask host. Condensers without phantom will not pass audio.",
            },
            {
              q: "Cable and clip?",
              a: "XLR+clip, cable only, clip only, wireless receiver kit, or renter provides. Count pieces at handoff.",
            },
            {
              q: "Hygiene on shared grilles?",
              a: "Wipe grille before return, host sanitizes, disposable cover required, or not mouth-contact. Follow the rule for the next singer.",
            },
            {
              q: "Deposit and claims?",
              a: "Bent grilles, missing clips/cables, and moisture damage beyond wipe policy use deposit \u2014 not mic insurance.",
            },
            {
              q: "What is not included?",
              a: "No Sweetwater mic bundle affiliate, no vocal coach, no wireless frequency coordination service.",
            },
          ],
        },
        "Amplifiers": {
          title: "Amplifiers \u2014 form, tube/SS, cab, power",
          summary: "Combos and heads need amp form, tube vs solid-state, cab include, power class, and cable kit before the gig.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, amp form, tube/SS/modeling, cab include, power class, and kit checklist.",
            },
            {
              q: "Combo vs head/cab?",
              a: "Form and cab-include fields say whether a speaker cabinet ships. Heads without cabs need your own cab.",
            },
            {
              q: "Tube vs solid-state?",
              a: "Tube amps need warm-up and careful move; modeling is digital. Disclosure is not a tech setup service.",
            },
            {
              q: "Power class?",
              a: "Match venue power and neighbor limits. Passive/unpowered means it needs an external speaker path.",
            },
            {
              q: "Deposit and claims?",
              a: "Dropped combos, missing footswitches, and burned tubes against misuse notes use deposit.",
            },
            {
              q: "What is not included?",
              a: "No amp tech bias adjust, no tube replacement subscription, no Guitar Center demo affiliate.",
            },
          ],
        },
        "Mixing Consoles": {
          title: "Mixing consoles \u2014 channels, powered, phantom",
          summary: "Live and install mixers need channel band, powered vs unpowered, phantom disclosure, power class, and a cable loom checklist.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, channel band, powered/unpowered, phantom need, power class, and kit checklist for snakes/XLRs.",
            },
            {
              q: "How many channels?",
              a: "Under 8 through 32+ or digital scene mixer. Match input count to your band or panel.",
            },
            {
              q: "Powered mixer or not?",
              a: "Powered mixers drive speakers; unpowered needs powered speakers or amps. Digital/stagebox is its own band.",
            },
            {
              q: "Phantom on how many channels?",
              a: "Phantom field covers 48V expectations for condensers \u2014 confirm before mics go live.",
            },
            {
              q: "Deposit and claims?",
              a: "Missing snakes and power cables against the checklist use deposit. No console insurance product.",
            },
            {
              q: "What is not included?",
              a: "No FOH engineer, no Dante network design, no Sweetwater install affiliate.",
            },
          ],
        },
        "Studio Monitors": {
          title: "Studio monitors \u2014 pair, stands, power",
          summary: "Nearfields need pair status, stands/pads, power class, and cable checklist so left/right and stands return together.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, pair band, stands/pads include, power class, and kit checklist.",
            },
            {
              q: "Single or matched pair?",
              a: "Single, matched pair, 2.1+sub, surround, or ask host. Pair mismatches drive most monitor disputes.",
            },
            {
              q: "Stands included?",
              a: "Stands, isolation pads only, not included, or desktop nearfield N/A. Do not assume stands ship.",
            },
            {
              q: "Power class?",
              a: "Active monitors need outlets; passive needs amplification. Confirm before studio day.",
            },
            {
              q: "Deposit and claims?",
              a: "Missing mate of a pair, stands, or power supplies use deposit \u2014 not monitor insurance.",
            },
            {
              q: "What is not included?",
              a: "No room treatment, no calibration mic service, no retail monitor affiliate.",
            },
          ],
        },
        "PA Systems": {
          title: "PA Systems \u2014 speakers, mixer, cables, outdoor",
          summary: "Stage PA needs speaker count, mixer include, outdoor-use policy, power class, and a frozen cable/stand inventory counted at handoff.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, power class, speaker-count band, mixer include, outdoor-use policy, and required cable/stand inventory.",
            },
            {
              q: "Why cable/stand inventory?",
              a: "XLRs, Speakon, stands, and power distro go missing after events. Inventory freezes at booking and is counted at handoff/return.",
            },
            {
              q: "Is a mixer included?",
              a: "Mixer included, not included, powered speakers only, or ask at handoff. Bring your own desk if not included.",
            },
            {
              q: "Outdoor use?",
              a: "Indoor-only, covered outdoor OK, full outdoor (weather risk), or host sets at handoff. Rain on indoor-only can use deposit.",
            },
            {
              q: "Portable Speakers vs PA?",
              a: "Party Bluetooth stays on Portable Speakers. Cable-heavy stage stacks stay here.",
            },
            {
              q: "What is not included?",
              a: "No FOH labor, no noise-permit service, no United Rentals / Fat Llama PA franchise promo.",
            },
          ],
        },
        "Recording Gear": {
          title: "Recording gear \u2014 type, I/O, phantom, case",
          summary: "Interfaces and recorders need gear type, I/O band, phantom support, case, power class, and cable loom \u2014 Music shelf, not Electronics Pro Audio rename.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, model, serial, gear type, I/O band, phantom support, case, power class, and kit checklist.",
            },
            {
              q: "Interface vs recorder?",
              a: "Type splits interface, preamp, field recorder, MIDI/DAW controller, mic+pre bundle, outboard FX, or other.",
            },
            {
              q: "How many inputs?",
              a: "I/O band (2\u00d72 through 8+) sets session fit. Not-an-interface covers controllers and FX.",
            },
            {
              q: "Phantom and cables?",
              a: "Phantom field plus checklist for USB/Thunderbolt/XLR. Missing loom pieces are deposit claims.",
            },
            {
              q: "Electronics Pro Audio?",
              a: "Studio capture also exists under Electronics. Keep Music Recording Gear for music-shelf listings; do not merge PA wattage gates.",
            },
            {
              q: "What is not included?",
              a: "No DAW license, no Sweetwater interface affiliate, no engineer session.",
            },
          ],
        },
        "Other": {
          title: "Other \u2014 pick a named Music shelf first",
          summary: "Prefer Guitars, Keyboards, Drums, Speakers, Mics, Amps, Mixers, Monitors, PA, or Recording. Other still needs kind, serial, and kit when multi-piece.",
          qa: [
            {
              q: "Should I use Other?",
              a: "Re-shelf whenever a named Music shelf fits so the right power, phantom, PA inventory, or case gates apply.",
            },
            {
              q: "What does kind mean?",
              a: "Instrument, live sound, studio, cable/stand accessory, mixed kit, or prefer-named-shelf \u2014 be honest so renters know what arrives.",
            },
            {
              q: "Serial and kit?",
              a: "Serial is required category-wide. Multi-piece kits need a checklist of every cable, stand, and accessory.",
            },
            {
              q: "Power class?",
              a: "If the item is powered, prefer a named powered shelf so powerBand is required \u2014 or disclose power in the description.",
            },
            {
              q: "Deposit and claims?",
              a: "Photos + inventory + serial support claims. Prefer a named shelf next time for specialist gates.",
            },
            {
              q: "What is not included?",
              a: "No retail affiliate, no backline insurance product, no stage-tech labor.",
            },
          ],
        },
      };

export const parentCategoryKey = "Music & Audio" as const;
