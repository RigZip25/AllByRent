import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Heavy Equipment */
export const subs_Heavy_Equipment: Record<string, CategoryFactBlock> = {
        "Generators": {
          title: "Generators — phase, start, runtime, noise",
          summary: "Portable and home standby generators rent cleanly when phase, start method, runtime, transfer-switch status, noise, power/fuel, insurance, and cord/oil kit inventory are frozen.",
          qa: [
            {
              q: "What gates apply before I can rent a generator?",
              a: "Rent listings freeze brand, power class, fuel, phase, start method, runtime band, transfer-switch inclusion, noise band, liability/deductible insurance bands, and a short kit checklist (cords, oil, funnel). Pros-only stays on unless the host turns it off.",
            },
            {
              q: "Single-phase, split-phase, or three-phase?",
              a: "Phase tells you what loads you can feed. Inverter portable is for sensitive electronics at lower continuous watts — not a jobsite three-phase plant.",
            },
            {
              q: "Is a transfer switch included?",
              a: "Hosts mark included, not included, renter provides, or N/A portable. Wrong switch or DIY panel work can damage gear and is outside the deposit.",
            },
            {
              q: "What about fuel, oil, and return?",
              a: "Fuel type is on the listing. Return fuel/oil per the kit notes — usually as-received or full-to-full when the host says so. Spill and wrong-fuel damage can use the deposit.",
            },
            {
              q: "Who needs an operator credential?",
              a: "Personal Generators do not require a heavy-equipment operator card. Industrial Generators do require general operator proof before handoff.",
            },
            {
              q: "What does insurance and the deposit cover?",
              a: "Physical-damage proof is required before PIN/keys. The card hold is deductible-sized — insurance is primary for damage. Missing cords/oil against the checklist are deposit claims.",
            },
            {
              q: "What is not included?",
              a: "No electrician install, no utility interconnect approval, and no United Rentals / Sunbelt fleet promo. Evorios does not sell generator insurance products.",
            },
          ],
        },
        "Air Compressors": {
          title: "Air compressors — CFM, tank, PSI, hose kit",
          summary: "Neighbor compressors need CFM, tank size, max PSI, drive type, hose/coupler kit status, power/fuel, insurance, and inventory before rent.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes brand, power/fuel, CFM band, tank size, max PSI, drive type, hose/coupler kit inclusion, insurance bands, and kit checklist.",
            },
            {
              q: "How do CFM and PSI work together?",
              a: "CFM is airflow for tools; PSI is pressure. Undersized CFM stalls nailers and impact tools — stay within published bands.",
            },
            {
              q: "Is the hose and coupler kit included?",
              a: "Full hose kit, partial, couplers only, or renter provides. Count fittings at handoff against the checklist.",
            },
            {
              q: "Electric vs gas drive?",
              a: "Drive type sets outlet vs fuel expectations. Gas wheelbarrow units need outdoor ventilation; indoor electric units need the published circuit.",
            },
            {
              q: "Insurance and deposit?",
              a: "Commercial equipment path: physical damage proof before start; deposit ≈ deductible. Missing hoses/fittings claim against deposit.",
            },
            {
              q: "What is not included?",
              a: "No tool compressor oil subscription, no fleet-yard affiliate, no third-party compressor insurance upsell.",
            },
          ],
        },
        "Pressure Washers": {
          title: "Pressure washers — PSI, GPM, wand kit, surfaces",
          summary: "Washers rent cleanly when PSI, GPM, power source, wand/nozzle kit, surface-use policy, fuel/power, insurance, and kit inventory are on the agreement.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes PSI, GPM, power source, wand/nozzle kit, surface-use policy, power/fuel class, insurance bands, and kit checklist.",
            },
            {
              q: "Can I wash soft siding or vehicles?",
              a: "Only if the host’s surface-use policy allows it. Hardscape-only or no-delicate-surfaces means stay off soft siding and paint.",
            },
            {
              q: "What nozzles and wands ship?",
              a: "Full kit, partial, wand only, or none — count tips and lances at handoff. Lost tips are deposit claims.",
            },
            {
              q: "Hot-water vs cold gas/electric?",
              a: "Power source is electric, gas, or hot-water diesel when listed. Hot water is not a detailing franchise offer.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage proof + deductible-sized hold. Etched glass or damaged soft surfaces beyond policy can use deposit.",
            },
            {
              q: "What is not included?",
              a: "No soap subscription, no mobile-detail partner promo, no pressure-washer insurance product from Evorios.",
            },
          ],
        },
        "Winches": {
          title: "Winches — capacity, mount, line, remote",
          summary: "Recovery winches need capacity, mount type, line type, remote, snatch-block status, operator credential, insurance, and kit inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes capacity band, mount, line type, remote, snatch-block inclusion, power/fuel, insurance, kit checklist, plus general heavy operator proof.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes — Winches sit on the general heavy-equipment credential path. Upload before handoff.",
            },
            {
              q: "Steel cable vs synthetic rope?",
              a: "Line type is frozen on the listing. Do not substitute. Kinks, bird-nesting, or cut strands against photos are claim baselines.",
            },
            {
              q: "Is a snatch block or remote included?",
              a: "Hosts mark included / not / N/A. Count blocks, hooks, and remotes on the checklist at handoff.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage proof required; deposit ≈ deductible. Missing recovery accessories claim against deposit.",
            },
            {
              q: "What is not included?",
              a: "No recovery-team dispatch, no Warn / Come-Up affiliate kit, no off-road insurance upsell from Evorios.",
            },
          ],
        },
        "Pumps": {
          title: "Pumps — type, flow, fittings, solids",
          summary: "Transfer and trash pumps need type, flow, inlet/outlet size, solids handling, hose kit, power/fuel, insurance, and inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes pump type, GPM band, inlet/outlet size, solids handling, hose kit, power/fuel, insurance, and checklist.",
            },
            {
              q: "Clean water vs trash solids?",
              a: "Solids handling says what you may pass. Forcing trash through a clean-water pump can destroy the impeller — deposit risk.",
            },
            {
              q: "Are suction and discharge hoses included?",
              a: "Suction+discharge, suction only, discharge only, partial, or none. Measure lengths against the checklist.",
            },
            {
              q: "Who needs an operator credential?",
              a: "Personal Pumps do not require a heavy operator card. Heavy Pumps (pro shelf) do.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage proof + deductible hold. Clogged/burned pumps from wrong solids class use deposit.",
            },
            {
              q: "What is not included?",
              a: "No plumber dispatch, no flood-remediation franchise promo, no pump insurance product.",
            },
          ],
        },
        "Industrial Generators": {
          title: "Industrial generators — duty, mount, grounding",
          summary: "Jobsite and standby plants add duty class, mount form, and grounding/bonding notes on top of phase, runtime, transfer switch, noise, and operator credential.",
          qa: [
            {
              q: "What extra gates vs personal Generators?",
              a: "Duty class (standby/prime/continuous/fleet), mount form (skid/trailer/container/pad/portable), and written grounding/bonding notes — plus general heavy operator proof.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes for Industrial Generators. Upload before handoff.",
            },
            {
              q: "What must grounding notes cover?",
              a: "Host states bonding/grounding expectation and who verifies before energizing. DIY panel interconnect is not included.",
            },
            {
              q: "Trailer vs skid mount?",
              a: "Mount form freezes transport and set-down expectations. Towing a trailer-mounted set may need a separate tow vehicle listing.",
            },
            {
              q: "Insurance and deposit?",
              a: "Structured COI / physical damage path; deposit ≈ deductible. Missing cables against checklist are deposit claims.",
            },
            {
              q: "What is not included?",
              a: "No utility interconnection permit, no national fleet yard promo, no generator insurance upsell.",
            },
          ],
        },
        "Forklifts": {
          title: "Forklifts — class, capacity, mast, tires",
          summary: "Forklift rentals freeze class, lift capacity, mast height, tires, fuel/battery, operator manual status, hours, insurance, and forklift operator credential.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes forklift class, capacity, mast height, tire type, fuel/battery, operator manual inclusion, power/fuel/hours, insurance bands, and forklift credential upload.",
            },
            {
              q: "Do I need a forklift credential?",
              a: "Yes — Forklifts require forklift operator proof before booking/start.",
            },
            {
              q: "Class 1–5 — what does it mean?",
              a: "Class sets electric sit-down, narrow aisle, pallet jack, cushion, or pneumatic counterbalance. Match the job and floor to the published class.",
            },
            {
              q: "Capacity and mast height?",
              a: "Stay within published lift capacity and mast height. Overloading or hitting ceiling height is misuse against deposit.",
            },
            {
              q: "LPG vs electric battery?",
              a: "Fuel/battery band freezes who supplies fuel or charged batteries and return state.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage proof required; deposit ≈ deductible — not full replacement.",
            },
            {
              q: "What is not included?",
              a: "No OSHA trainer course sale, no Toyota / Crown dealer promo, no forklift insurance product from Evorios.",
            },
          ],
        },
        "Industrial Compressors": {
          title: "Industrial compressors — duty, dryer, CFM",
          summary: "Plant-scale compressors add duty class and air-dryer inclusion on top of CFM, tank, PSI, drive, hose kit, operator credential, and insurance.",
          qa: [
            {
              q: "What extra gates vs personal Air Compressors?",
              a: "Duty class (intermittent/continuous/plant) and air-dryer included/not/N/A — plus general heavy operator proof.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes for Industrial Compressors.",
            },
            {
              q: "Why duty class?",
              a: "Continuous and plant duty expect different duty cycles than a weekend nailer compressor — mismatch can overheat units.",
            },
            {
              q: "Is an air dryer included?",
              a: "Included, not included, or N/A. Wet air can ruin tools — know before handoff.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage path; deposit ≈ deductible. Missing hoses/filters against checklist claim deposit.",
            },
            {
              q: "What is not included?",
              a: "No compressed-air contractor dispatch, no fleet-yard affiliate, no compressor insurance upsell.",
            },
          ],
        },
        "Hydraulic Equipment": {
          title: "Hydraulic gear — function, PSI, flow, couplers",
          summary: "Power units, cylinders, breakers, and spreaders need function, pressure, flow, coupler type, hose-whip kit, operator credential, insurance, and inventory.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes hydraulic function, PSI, flow GPM, coupler type, hose-whip kit, power/fuel, insurance, checklist, plus general heavy operator proof.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes — Hydraulic Equipment is on the general heavy credential path.",
            },
            {
              q: "ISO-A vs flat-face couplers?",
              a: "Coupler type must match your tools. Forcing mismatched couplers leaks oil and can void ordinary-use assumptions.",
            },
            {
              q: "Is a hose whip kit included?",
              a: "Included, partial, or none — count whips and couplers at handoff.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage proof; deposit ≈ deductible. Oil contamination or blown hoses from over-pressure misuse can use deposit.",
            },
            {
              q: "What is not included?",
              a: "No hydraulic shop rebuild service, no Enerpac affiliate promo, no specialty insurance upsell.",
            },
          ],
        },
        "Heavy Pumps": {
          title: "Heavy pumps — type, flow, priming, solids",
          summary: "Pro-scale pumps add priming method on top of type, flow, fittings, solids handling, hose kit, operator credential, and insurance.",
          qa: [
            {
              q: "What extra gates vs personal Pumps?",
              a: "Priming method (self/manual/submersible N/A) plus general heavy operator credential.",
            },
            {
              q: "Do I need an operator credential?",
              a: "Yes for Heavy Pumps.",
            },
            {
              q: "Priming — who does it?",
              a: "Self-prime, manual prime, or submersible N/A. Dry-running a non-submersible can destroy seals — deposit risk.",
            },
            {
              q: "Solids and chemicals?",
              a: "Stay within published solids/chemicals band. Undisclosed corrosives are misuse.",
            },
            {
              q: "Insurance and deposit?",
              a: "Physical damage path; deposit ≈ deductible.",
            },
            {
              q: "What is not included?",
              a: "No municipal bypass crew, no Godwin / Thompson fleet promo, no pump insurance product.",
            },
          ],
        },
        "Other": {
          title: "Heavy other — kind, pieces, photos",
          summary: "Catch-all heavy gear must declare kind, piece count, photo condition depth, category power/fuel/insurance floors — re-shelf when a named shelf fits.",
          qa: [
            {
              q: "When should I use Other?",
              a: "Only when Generators, compressors, washers, winches, pumps, forklifts, or hydraulic shelves truly do not fit. Named shelves carry the right capacity and credential gates.",
            },
            {
              q: "What gates still apply?",
              a: "Kind, piece band, photo condition checklist, power/fuel, insurance bands. Multi-piece needs a kit inventory list.",
            },
            {
              q: "Do I need an operator credential?",
              a: "If kind is forklift, winch, hydraulic, industrial generator/compressor, or heavy pump — re-shelf so the credential gate applies. Other does not skip pro/insurance floors.",
            },
            {
              q: "Photo condition checklist?",
              a: "Overall photos, overall plus flaws, or all pieces and flaws — freezes claim baseline before handoff.",
            },
            {
              q: "Insurance and deposit?",
              a: "Same commercial equipment path: physical damage proof; deposit ≈ deductible.",
            },
            {
              q: "What is not included?",
              a: "No vague “as discussed” essays, no fleet-yard partner promo, no insurance product sale.",
            },
          ],
        },
      };

export const parentCategoryKey = "Heavy Equipment" as const;
