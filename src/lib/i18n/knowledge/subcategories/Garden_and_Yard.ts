import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Garden & Yard */
export const subs_Garden_and_Yard: Record<string, CategoryFactBlock> = {
        "Garden Tools": {
          title: "Garden tools — set, surface, wear, return clean",
          summary: "Tool counters and neighbor sets win when single vs set, surface fit, wear grade, and mud return rules are clear. Baseline already requires brand and power (manual is common).",
          qa: [
            {
              q: "What does single tool vs tool set mean?",
              a: "Single tool is one listed item (one shovel or one wheelbarrow). Tool set is a multi-piece kit — every piece must appear in the inventory checklist and be counted at handoff.",
            },
            {
              q: "Why list every piece when it is a set?",
              a: "Missing rakes, forks, or wheelbarrow parts drive most garden-tool deposit claims. A numbered checklist at listing and return beats arguing from memory after a weekend job.",
            },
            {
              q: "What is intended surface?",
              a: "Soil is for digging and beds; lawn is for turf-friendly rakes and edgers; hardscape is for patio, stone, and gravel work; mixed covers general yard weekends. Pick what matches your job so the host’s tools fit the task.",
            },
            {
              q: "Why power source on hand tools?",
              a: "Most garden hand tools are manual. Cordless appears on battery cultivators, shears, or small powered hand tools — declare it so the renter knows about charging and safe use.",
            },
            {
              q: "What does the condition grade cover?",
              a: "Honest wear on handles, heads, tines, and wheelbarrow trays or tires — including light rust that still works. It freezes the baseline so normal soil wear is not confused with new damage after return.",
            },
            {
              q: "How clean should tools be at return?",
              a: "Hosts pick a soft return-clean rule: rinse and brush dry, light dried mud OK, fair as-used wear, or an optional cleaning fee if heavy soil stays on the set. Follow the listed policy — it is not a third-party cleaning service promo.",
            },
            {
              q: "What is not included?",
              a: "No professional landscaping crew, soil delivery, or disposal haul-away unless the host states it in the listing. Evorios does not sell yard-insurance or Home Depot / Sunbelt / United Rentals affiliate coverage — deposit and rental terms handle damage and missing pieces.",
            },
          ],
        },
        "Houseplants & Seedlings": {
          title: "Houseplants — indoor care, pet safety",
          summary: "Indoor rentals fail on light, water, and pet surprises. Required cultivar, health, return-in-pot policy, plus recommended indoor care notes and pet toxicity match nursery bench honesty without affiliate promo.",
          qa: [
            {
              q: "Why list indoor care notes?",
              a: "Humidity trays, mist schedules, 'do not repot during rental', and acclimation from a greenhouse prevent the top indoor failures — leaf drop and root rot — during short-term peer share.",
            },
            {
              q: "What does pet toxicity disclosure mean?",
              a: "Soft-required select: non_toxic, mildly_toxic, toxic_to_pets, or unknown_check_before_rent. Renters with cats, dogs, or venue rules ack before booking when toxicity is not non_toxic.",
            },
            {
              q: "How does return-in-pot work for event decor?",
              a: "Event_rental_return_pot means the fiddle-leaf, orchid, or seedling flat returns in the original nursery pot after the party or pop-up — same rule as professional plant rental shops.",
            },
            {
              q: "Are seedlings different from mature houseplants?",
              a: "Same shelf — note heat mat, dome, or grow-light needs in indoorCareNotes. Seedlings stress faster; use plantHealthGrade honestly and keep_planted_no_return if selling starter trays.",
            },
            {
              q: "What pest notes matter indoors?",
              a: "Spider mites, fungus gnats, and mealybug — common on shared indoor plants. 'Treated and clear' or disclose active issues; pests spread to renter collections quickly.",
            },
            {
              q: "Why hardiness zone on indoor plants?",
              a: "Recommended, not required — use indoor_only for true houseplants. Patio tropicals moved indoors for winter need a real zone band so renters know frost limits.",
            },
            {
              q: "What is NOT included?",
              a: "Evorios does not sell plant insurance, delivery, or weekly watering visits. Grow lights and humidifiers are host-provided unless your listing says otherwise.",
            },
            {
              q: "How do deposits work?",
              a: "Health grade and container set baseline. Cracked ceramic, missing saucers, or pest outbreak beyond disclosed notes may use deposit per rental terms — photos at handoff help.",
            },
          ],
        },
        "Irrigation Systems": {
          title: "Irrigation — type, coverage, install",
          summary: "Professional irrigation rentals should state system type, coverage band, controller inclusion, install tier, full kit inventory, and soft winterize notes before handoff.",
          qa: [
            {
              q: "What does irrigation system type mean?",
              a: "Pick drip for emitter/tubing kits, sprinkler_zones for pop-up or rotor zone manifolds, smart_controller when a Wi‑Fi/timer hub is the main rental, or pump when the kit centers on a booster or transfer pump. Combo kits should pick the closest type and list everything else in the inventory checklist.",
            },
            {
              q: "How should I use the coverage area band?",
              a: "Choose the approximate square footage the kit is sized to water — not your whole property unless the listing says so. Variable/custom layout means beds or rows do not map to a simple rectangle; read the checklist for head count and tubing length.",
            },
            {
              q: "What does controller included cover?",
              a: "Basic timer included means a hose-end or zone timer ships with the kit. Smart controller included means a Wi‑Fi or app timer is part of the rental.",
            },
            {
              q: "What do the install complexity options mean?",
              a: "Renter DIY expects you to lay tubing, connect heads, and tie to an existing hose bib or stub — no trenching guarantee. Host installs means the host sets up before or at handoff within the listed area.",
            },
            {
              q: "What belongs in the kit inventory checklist?",
              a: "List every head, emitter, valve, backflow or regulator, tubing roll length, stakes, fittings, tools, controller, pump, and storage reels. Renter and host confirm counts at booking and return — missing pieces follow inventory and photos, not a retail warranty.",
            },
            {
              q: "What are winterize notes for?",
              a: "Soft seasonal guidance only: drain lines, blow out if offered, store indoors before frost. They are not freeze-damage insurance and do not promise the host will winterize unless explicitly stated in the listing notes.",
            },
            {
              q: "How do deposit and claims usually work?",
              a: "Cut tubing, lost heads, cracked manifolds, or a missing smart controller typically come out of the deposit when inventory and handoff photos support the claim. Normal wear on stakes and fittings may be acceptable if the listing says so — disputes follow the published checklist and rental terms.",
            },
            {
              q: "What is not included?",
              a: "Water bill, permanent plumbing permits, guaranteed main-line tap access, backflow testing certification, and pro install labor unless install complexity says host installs. Evorios does not sell yard insurance or tool-rental partner services — arrange those separately if you need them.",
            },
          ],
        },
        "Landscape Equipment": {
          title: "Landscape equipment — subtype, kit, transport",
          summary: "Pro yards label aerators, dethatchers, sod cutters, spreaders, and carts with brand, model, power, gas fuel when applicable, a full kit checklist, and load/transport notes — frozen on the agreement.",
          qa: [
            {
              q: "What belongs on Landscape Equipment vs other Garden shelves?",
              a: "Use this shelf for walk-behind aerators, power dethatchers, sod cutters, spreaders, heavy carts, rollers, and landscape edgers — not lawn mowers, tillers, stump grinders, or hand rakes. Pick the closest subtype so renters know what they are booking.",
            },
            {
              q: "Why do brand, model, and subtype matter?",
              a: "Subtype tells the job (aerate vs dethatch vs cut sod vs spread). Brand and model freeze the exact machine — Ryan, BlueBird, and Husqvarna-class units differ in weight, tines, and hopper size.",
            },
            {
              q: "What goes in the kit inventory checklist?",
              a: "List every included piece: tine drums or cassettes, hopper, oil bottle, ramp, wrench, spare parts, and cords or batteries. Seed, fertilizer, and ice melt are renter-supplied unless you explicitly include them.",
            },
            {
              q: "What should transport notes cover?",
              a: "State pickup vs delivery, approximate weight, whether a trailer or ramp is needed, tie-down points, and if two people must lift it. Sod cutters and core aerators are heavy — unclear load notes cause the most pickup-day disputes.",
            },
            {
              q: "Gas fuel type and return fuel — what is expected?",
              a: "When power is gas, declare fuel type (gasoline, diesel, propane). Say whether the renter returns a full tank, same level, or refills — host policy is frozen on the listing.",
            },
            {
              q: "PPE for powered units?",
              a: "For gas, corded, or cordless machines, wear eye and hearing protection and sturdy gloves; steel-toe shoes help on heavy walk-behinds. Host may note included PPE in the listing; if not stated, plan to bring your own — this is guidance, not a medical or OSHA certification.",
            },
            {
              q: "What is not included?",
              a: "Material (seed, sod, fertilizer), site prep, disposal, operator training beyond the listing, and third-party rental-desk or yard-insurance products are not included. Deposit covers damage or missing kit items per the frozen checklist and photos.",
            },
          ],
        },
        "Lawn Mowers": {
          title: "Lawn mowers — deck, blade, return",
          summary: "Tool-rental counters freeze deck width, fuel, and clean-return rules. Peer listings win when model, cutting width, deck mode, bagger/mulch kit, blade condition, voltage or fuel type, and return policies are on the agreement — with a soft PPE tip only.",
          qa: [
            {
              q: "Why are cutting width, model, and power source required?",
              a: "Deck width (under 16 in through 30 in+) tells you if the mower fits your yard and gates. Model plus brand separates push vs self-propelled and year class — brand and \"gas\" alone are not enough to book confidently.",
            },
            {
              q: "What do deck discharge mode and bagger/mulch kit mean?",
              a: "Side discharge, rear bag, mulching, or 3-in-1 convertible sets how clippings leave the deck. The bagger/mulch field states whether the grass bag, frame, or mulch plug is included — missing parts are the top handoff dispute on peer mower shares.",
            },
            {
              q: "How is blade condition handled?",
              a: "Hosts pick sharp-ready, recently sharpened, dull (disclosed), or unknown. Renters should expect the listed cut quality; damage from hitting rocks or curbs is outside normal wear and may use deposit per rental terms.",
            },
            {
              q: "What are the gas fuel and return-clean rules?",
              a: "Gas listings require fuel type (gasoline, propane, other) and a return rule: full-to-full, host provides starting fuel, or renter buys own. Return-clean policy states whether you must scrape/rinse the deck, pay a host flat clean fee, or may return with light grass — ack both at booking.",
            },
            {
              q: "What about cordless battery voltage?",
              a: "Cordless mowers require a voltage band (18V–20V, 40V, 60V+) so renters know runtime and charger compatibility. Confirm how many batteries and whether a charger is included in photos or messages — structured battery inventory is a future upgrade.",
            },
            {
              q: "Is PPE or insurance required like stump grinders?",
              a: "No. Lawn mowers use a soft PPE tip only — eye protection, hearing protection, and sturdy closed-toe shoes.",
            },
            {
              q: "If something goes wrong after the rental?",
              a: "Published return-clean and fuel policies plus blade/discharge specs are frozen on the agreement. Grass-caked decks beyond policy, empty gas tanks against full-to-full, or blade damage from misuse are handled via deposit and messages — Evorios does not sell mower insurance or tool-rental partner services.",
            },
          ],
        },
        "Leaf Blowers": {
          title: "Leaf blowers — form, airflow, return clean",
          summary: "Tool-rental counters quote form factor, CFM class, and vac kit on the card. We add those fields plus model, gas fuel type or cordless voltage, soft noise hours, and return-clean notes — frozen on the agreement. Neighbor trust + deposit; not a landscaping insurer.",
          qa: [
            {
              q: "Why do form factor and airflow band matter?",
              a: "Handheld units suit small yards and tight paths; backpack and walk-behind units move more volume for large lawns. The CFM band is a soft power class so renters do not book a light cordless unit for a half-acre oak drop.",
            },
            {
              q: "What does the mulch/vac kit field mean?",
              a: "Many blowers are blower-only; others ship a vac bag, tubes, or a full mulch kit. The listing states what is included so renters do not assume vacuum mode or a collection bag that stays in the host's garage.",
            },
            {
              q: "Gas fuel type — what should I know?",
              a: "When power source is gas, the host declares 4-stroke gasoline, 2-stroke premix, or other. Match the host's mix ratio and tank rule at handoff; return with the tank policy you agree to (often same level or full).",
            },
            {
              q: "Cordless — why battery voltage band?",
              a: "18–20V, 40V, and 60V+ platforms are not interchangeable. The band helps renters match spare batteries they own and sets runtime expectations.",
            },
            {
              q: "Noise and neighbor hours?",
              a: "Hosts may note HOA quiet hours, weekend cutoffs, or a suggestion to wear ear protection. These are courtesy notes, not legal advice — check your local rules before early-morning or Sunday use.",
            },
            {
              q: "How should the blower come back?",
              a: "Follow the host's return-clean notes: typical asks are shake out wet leaves, empty the vac bag, wipe the housing, and do not return a clogged filter. Heavy caking beyond normal use can affect deposit claims.",
            },
            {
              q: "Eye and ear protection?",
              a: "Leaf blowers throw debris and run loud. Safety glasses and hearing protection are recommended for the operator and anyone nearby.",
            },
            {
              q: "What is not included?",
              a: "Fuel, premix oil, extension cords, extra batteries, and yard-waste bags are usually renter-supplied unless the kit checklist says otherwise. Deposit covers damage and missing listed accessories — not third-party equipment insurance.",
            },
          ],
        },
        "Nursery Stock": {
          title: "Nursery stock — spec sheet, B&B handoff",
          summary: "Wholesale nursery tags drive pro jobs. Required cultivar, ANSI container class, zone, health grade, and transplant/return policy freeze crew expectations for B&B, field-grown, and bulk pot stock without equipment-rental affiliate promo.",
          qa: [
            {
              q: "Who is the professional nursery stock shelf for?",
              a: "Landscape crews, designers, and wholesale-adjacent hosts renting liners, B&B trees, or temp job-site plant material peer-to-peer — not consumer houseplant trial.",
            },
            {
              q: "Why require cultivar on pro stock?",
              a: "Specs call for exact cultivars — 'red maple' is not enough when the plan says October Glory vs Brandywine. Crews match tags to landscape documents before load-out.",
            },
            {
              q: "How does container class work for B&B and field-grown?",
              a: "ANSI formats — ball_burlap and field_grown set weight, spade size, and irrigator needs. Mislabeled pot size causes crane and trailer disputes on pro handoff.",
            },
            {
              q: "What transplant / return policy fits job-site rental?",
              a: "Keep_planted_no_return for install-and-leave jobs. Return_in_container when temp staging must go back to the yard.",
            },
            {
              q: "What pest and disease notes should pros disclose?",
              a: "Recent treatment, quarantine hold, or 'clean stock'. Mention phyto concerns in notes when interstate regs apply — Evorios does not file certificates for you.",
            },
            {
              q: "Why hardiness zone on wholesale stock?",
              a: "Required — pros plant at scale; one zone mismatch kills margins. Match the nursery tag zone band to the job ZIP before booking.",
            },
            {
              q: "What is NOT included?",
              a: "No Sunbelt/United Rentals yard equipment, planting machines, or nursery insurance from Evorios. Spade trucks, irrigators, and phyto paperwork stay between host and renter.",
            },
            {
              q: "How do deposits and claims work?",
              a: "Health grade and container integrity (wrap, root ball firmness) set baseline. Torn B&B, dry root balls, or cultivar swap vs listing use handoff photos vs deposit per terms.",
            },
          ],
        },
        "Other": {
          title: "Other — pick the right shelf first",
          summary: "Prefer a named Garden & Yard shelf so the right gates apply. If you stay on Other, say equipment vs plant vs mixed, declare power on motorized gear, attest condition photos, and list every piece when the set is multi-piece.",
          qa: [
            {
              q: "Should I use Other or a named shelf?",
              a: "Re-shelf whenever a specific shelf fits — Lawn Mowers, Trimmers, Leaf Blowers, Garden Tools, Sprinklers, Ride-On Mowers, Tillers & Cultivators, Stump Grinders, Irrigation Systems, Landscape Equipment, Trees, Shrubs & Bushes, Perennials, Seasonal Flowers, Houseplants & Seedlings, or Nursery Stock. Named shelves carry the right power, plant, or safety gates; Other is only for items that truly do not fit.",
            },
            {
              q: "What does equipment vs plant vs mixed mean?",
              a: "Equipment is tools and motorized yard gear (mowers, blowers, carts, hoses with pumps). Plant is live stock or potted material.",
            },
            {
              q: "When is power source required?",
              a: "For equipment or mixed listings, set power source (cordless, corded, gas, manual, ride-on) and brand when applicable. Plant-only listings skip power — if your item needs fuel or a battery, it probably belongs on a named equipment shelf instead.",
            },
            {
              q: "What about plants listed on Other?",
              a: "Prefer a named plant shelf for height, sun, container, and water gates. If you stay plant-only on Other, add sun, pot size, and water needs when you can — renters need care basics before booking.",
            },
            {
              q: "Do I need a piece inventory?",
              a: "Single-item listings need only the structured fields. Multi-piece sets — tool kits, patio groupings, multi-pot lots — require a short free-text inventory listing every included piece for handoff and return.",
            },
            {
              q: "What condition photos should I attest?",
              a: "Confirm listing photos show the item overall, cords/blades/pots as relevant, visible wear or damage, and all pieces when multi-piece. This is a soft attest — we do not upload-verify — but photos are the first layer in missing-part and damage disputes.",
            },
            {
              q: "What is not included or promised?",
              a: "Evorios does not sell third-party yard insurance, Home Depot-style rental plans, or nursery delivery guarantees. Fuel, soil, stakes, and PPE are yours to state in the listing; stump-grinder waiver and insurance proof apply only on the Stump Grinders shelf.",
            },
            {
              q: "How do claims work on Other?",
              a: "Use condition photos, inventory, power source, and deposit hold for missing batteries, broken blades, or damaged pots. Prefer a named shelf next time so specialist gates are frozen on the agreement from the start.",
            },
          ],
        },
        "Perennials": {
          title: "Perennials — bloom, water, zone",
          summary: "Nursery tags list cultivar, bloom window, and water band. Peer perennial rentals win when those fields plus health, hardiness, transplant/return rules, and pest/soil notes are required and frozen on the agreement.",
          qa: [
            {
              q: "Why are bloom season and water needs required?",
              a: "Perennials live for years — wrong bloom timing ruins event borders and wrong water band kills drought-tolerant vs moisture-loving plants. These are nursery-tag basics, now required on every listing.",
            },
            {
              q: "What cultivar detail should I include?",
              a: "Name the plant and variety — e.g. Salvia 'May Night' or Hosta 'Patriot'.",
            },
            {
              q: "How does event rental return work?",
              a: "Event_rental_return_pot means border plants come back in their nursery pots after the wedding or market booth. Keep_planted_no_return is a sale-style install — the renter keeps them in the ground.",
            },
            {
              q: "Why hardiness zone for perennials?",
              a: "Unlike annuals, perennials must survive winter. USDA zone band lets renters self-screen before planting your division or pot in their yard.",
            },
            {
              q: "What goes in pest and disease notes?",
              a: "Slug damage, powdery mildew, or 'treated and clear' — even minor issues. Repeat_bloom perennials may carry spent flowers; say if deadheading is expected at return.",
            },
            {
              q: "What is NOT included?",
              a: "Evorios does not provide mulch delivery, fertilizer programs, or landscape design. Ongoing bed care stays between host and renter.",
            },
            {
              q: "How do deposits work?",
              a: "Container class and health grade set baseline. Crushed crowns, dry plugs, or missing pots from multi-plant event sets use handoff photos vs deposit per rental terms.",
            },
          ],
        },
        "Ride-On Mowers": {
          title: "Ride-on mowers — deck, fuel, transport",
          summary: "Large-lot mowers need deck width, fuel, hours, blade/deck setup, and transport frozen before book — plus a light operator briefing, not a CDL path.",
          qa: [
            {
              q: "What must hosts list before rent goes live?",
              a: "Brand, model, cutting-width band, fuel type, hour-meter band, blade condition, deck/discharge setup, and transport notes (trailer, pickup, or delivery). Mark whether a handoff briefing is required.",
            },
            {
              q: "Why deck width and hour meter?",
              a: "Equipment yards quote both so renters match lawn size and wear. A frozen width band and hour band on the listing beats surprise under-sized decks or tired engines mid-job.",
            },
            {
              q: "How does transport work?",
              a: "Most ride-ons need a trailer or truck — say so in transport notes. Note if you deliver, if the renter must bring ramps, and approximate weight/width so they plan pickup.",
            },
            {
              q: "What about fuel?",
              a: "Treat fuel like job-site gear: full-to-full when gasoline or diesel applies. Note in briefing notes where the cap is and whether you include a fuel can.",
            },
            {
              q: "Is this a vehicle rental with CDL?",
              a: "No. This is garden equipment — a soft operator age band and optional handoff briefing, not a driver's-license or CDL gate.",
            },
            {
              q: "Safety tip before first cut?",
              a: "Clear rocks and debris, keep kids and pets away, wear eye and ear protection, and avoid steep slopes or wet grass. Stop the blades before dismounting — briefing covers your unit's controls.",
            },
            {
              q: "What is not included?",
              a: "Evorios does not sell yard insurance or partner with big-box rental counters. Deposit covers blade damage, deck dents, and missing chute/bagger parts — not a replacement policy.",
            },
            {
              q: "If something goes wrong?",
              a: "Handoff photos of deck, blades, and hour meter support claims. Dull or damaged blades beyond the published band, deck impact, or missing bagger parts may come from deposit per rental terms.",
            },
          ],
        },
        "Seasonal Flowers": {
          title: "Seasonal flowers — color window, return pots",
          summary: "Event plant rentals live on peak color and return-in-pot rules. Required cultivar, bloom season, water needs, health, hardiness, and transplant policy freeze nursery-bench expectations on the agreement.",
          qa: [
            {
              q: "Why require bloom season and water for seasonal flowers?",
              a: "These are short-window plants — mums for fall, pansies for spring, poinsettias for winter. Bloom season and water band tell renters exactly when color peaks and how often to irrigate during the rental.",
            },
            {
              q: "What is event_rental_return_pot?",
              a: "The standard for wedding aisles, market booths, and porch displays: renter returns each bowl or pot after the event in the same nursery container. Missing or crushed pots are the top seasonal-flower claim.",
            },
            {
              q: "How should I name seasonal listings?",
              a: "Use cultivar and color — e.g. 'Pansy Matrix Mix yellow/purple' or 'Garden mum Cherries Jubilee'.",
            },
            {
              q: "Why hardiness zone on annuals and seasonal bowls?",
              a: "Cool-season flowers tolerate frost; tropical bowls do not. Zone band (or indoor_only) prevents renters from leaving tender color out on a freezing night.",
            },
            {
              q: "What pest notes matter on flats and bowls?",
              a: "Aphids, botrytis on dense mums, and fungus gnats in overwatered bowls — disclose treatment or 'clean at handoff'. Packed event flats spread pests fast.",
            },
            {
              q: "What is NOT included?",
              a: "No delivery crew, daily watering service, or frost cloth from Evorios unless your listing adds it. We do not sell nursery or florist affiliate products.",
            },
            {
              q: "How do deposits work?",
              a: "Health grade and container count set baseline. Wilted but recoverable vs dead flats, and missing return pots, use handoff photos vs deposit per terms.",
            },
            {
              q: "Can renters keep planted flowers?",
              a: "Only when transplantOrReturnPolicy is keep_planted_no_return — treat it as a sale-style handoff. Otherwise expect pots back on the agreed date.",
            },
          ],
        },
        "Shrubs & Bushes": {
          title: "Shrubs — cultivar, bloom, return policy",
          summary: "Nurseries and event rentals tag cultivar, bloom window, and pot size. Peer listings win when name, height, sun, evergreen/deciduous, bloom season, health, hardiness, transplant/return rules, and pest/soil notes are on the agreement.",
          qa: [
            {
              q: "Why name the shrub cultivar?",
              a: "Hydrangea, boxwood, and rose-of-sharon have different sizes, bloom times, and pruning needs. A cultivar name lets event and landscape renters match color and height before booking.",
            },
            {
              q: "How important is bloom season for shrubs?",
              a: "Recommended on every listing and soft-required for rentals — peak bloom drives wedding and patio timing. Foliage_only is valid for evergreens used as backdrop greenery.",
            },
            {
              q: "What does transplant / return policy mean for hedges?",
              a: "Keep_planted_no_return suits sale-style hedge installs. Event_rental_return_pot means each shrub returns in its nursery pot — critical when renting multiples for aisle or stage decor.",
            },
            {
              q: "What should pest and disease notes include?",
              a: "Note aphids, leaf spot, deer browse, or recent neem/oil treatment. Evergreen shrubs often show winter burn — disclose it in health grade and notes.",
            },
            {
              q: "Why hardiness zone and soil notes?",
              a: "Shrubs planted out of zone or in standing water decline fast. Zone band plus a drainage line (e.g.",
            },
            {
              q: "What is NOT included?",
              a: "No nursery insurance, professional pruning service, or herbicide programs from Evorios. Ongoing care after handoff is between host and renter.",
            },
            {
              q: "How do claims work?",
              a: "Health grade and container class set baseline. Broken branches, dry root balls, or missing plants from multi-shrub event sets use photos + inventory vs deposit per terms.",
            },
          ],
        },
        "Sprinklers": {
          title: "Sprinklers — coverage, connection, pieces",
          summary: "Peer lawn bursts beat retail when coverage band, hose connection type, timer inclusion, multi-head inventory, and drain return notes are frozen on the agreement.",
          qa: [
            {
              q: "What does coverage area band mean?",
              a: "It tells the renter how much lawn or bed the setup is meant to water — a small patch, medium lawn, large lawn, or multi-zone kit. Pick the band that matches the heads or drip layout in the photos, not the whole yard size alone.",
            },
            {
              q: "What is connection type and why does it matter?",
              a: "It states how the gear hooks to water: standard hose thread, through a hose timer, drip tubing, or quick-connect fittings. Wrong type means the renter arrives without the right adapter or timer body.",
            },
            {
              q: "How do timer included and power source work together?",
              a: "Timer included says whether a hose timer ships with the heads or the listing is timer-only. Power source is manual for passive sprinklers and usually cordless for battery timers — both are frozen on the agreement so the renter knows what batteries or hose setup to bring.",
            },
            {
              q: "When is a piece inventory required?",
              a: "Multi-head sets (two or more heads), four-plus head manifolds, and drip line kits must list every stake, head, splitter, quick-connect, and timer adapter. The renter confirms that list at booking and counts pieces at handoff and return.",
            },
            {
              q: "What are winterize and drain return notes?",
              a: "Soft care notes — not a shop service — on how to empty the timer, drain hoses, and coil drip lines before return. They cut cracked manifold and standing-water disputes in late-season rentals.",
            },
            {
              q: "What is not included in a sprinkler rental?",
              a: "Unless the host says otherwise in the listing: the garden hose, outdoor faucet, water bill, backflow hardware, in-ground irrigation, and any third-party yard insurance. Evorios does not sell landscaping insurance or partner with big-box rental desks.",
            },
            {
              q: "How do deposit and claims work?",
              a: "Missing heads, stakes, timer bodies, or cracked quick-connect manifolds are checked against the frozen inventory and handoff photos. Ordinary wear on spray patterns is expected; damage beyond the published return notes may use the deposit per rental terms.",
            },
            {
              q: "What gets locked when I book?",
              a: "Coverage band, connection type, timer flag, power source, head-count band, piece checklist when required, and any drain notes — plus your inventory acknowledgment on multi-head kits. Those fields stay on the rental agreement through return.",
            },
          ],
        },
        "Stump Grinders": {
          title: "Stump grinders — capacity, PPE, briefing",
          summary: "Construction-adjacent yard gear: diameter capacity, PPE, waiver, insurance proof, form factor, fuel, chip cleanup, and operator briefing before handoff.",
          qa: [
            {
              q: "Why are stump grinders gated?",
              a: "Flying debris and high torque put them closer to light construction risk than a leaf blower. Capacity, PPE, waiver, insurance proof, and a safety briefing lock the rent path until cleared.",
            },
            {
              q: "What does the stump capacity band mean?",
              a: "It is the maximum stump diameter this grinder is rated for — under 8 in, 8–16 in, 16–24 in, or 24 in+. Do not exceed the band; deeper grind or hard species may need a larger machine.",
            },
            {
              q: "What PPE is expected?",
              a: "Hosts declare whether eye / ear / glove guidance is included, partial PPE is included, or the renter supplies all PPE. Renters must acknowledge PPE at booking and wear it during use.",
            },
            {
              q: "What insurance proof is required?",
              a: "Hosts set minimum liability and maximum deductible bands on the listing. Renters upload proof that meets those bands before pickup unlocks.",
            },
            {
              q: "What is the safety briefing?",
              a: "When required, the host marks the briefing ready and covers safe start, chip throw, utilities, and transport. Renters confirm they will complete the briefing at handoff before operating.",
            },
            {
              q: "What do form factor, transport, and chip notes cover?",
              a: "Form factor is walk-behind, towable, or self-propelled. Transport notes cover trailer, weight, and gate access.",
            },
            {
              q: "How does fuel work?",
              a: "List gasoline, diesel, electric, propane, or other as applicable. For gas or diesel units, expect full-to-full unless the host says otherwise in handoff notes.",
            },
            {
              q: "What is not included?",
              a: "Evorios does not underwrite yard work, sell insurance, or partner with Home Depot, Sunbelt, United Rentals, or Progressive-style yard-insurance promos. Deposit hold and renter proof are the primary layers.",
            },
          ],
        },
        "Tillers & Cultivators": {
          title: "Tillers & cultivators — width, depth, tines, move it",
          summary: "Professional tillers need working width, depth band, tine condition, model, gas fuel type or cordless battery pack, and transport notes frozen before handoff.",
          qa: [
            {
              q: "What do tilling width and depth bands mean?",
              a: "Width is the working swath per pass — mini cultivators are often under 12 in; rear-tine beds may be 18–24 in+. Depth is how deep tines realistically cut; breaking new ground needs 8–10 in+ bands, while light prep may be under 6 in.",
            },
            {
              q: "Why list tine condition?",
              a: "Dull or bent tines stall in clay and spark deposit disputes. Mark new/sharp, good wear, worn, or damaged — and photograph damage before handoff so return claims are clear.",
            },
            {
              q: "What about gas fuel type?",
              a: "When power is gas, state 4-stroke gasoline vs 2-stroke oil mix — wrong fuel can seize an engine. Return fuel level is usually full-to-full at handoff when fuel type is set; short fuel may follow the standard missing-fuel fee on the agreement.",
            },
            {
              q: "What if the tiller is cordless?",
              a: "Say how many batteries ship, whether a charger is included, and if the renter must bring a compatible pack. Count batteries and charger at pickup and return — missing packs are the most common kit dispute.",
            },
            {
              q: "What goes in transport notes?",
              a: "Rear-tine units can exceed 200 lb — note if a trailer, ramp, or second person is needed, whether handles fold, and if a pickup truck is required. Surprises at pickup waste a planting window.",
            },
            {
              q: "Do I need special PPE?",
              a: "Soft tip only: wear eye protection, sturdy boots, and gloves — tines throw rocks and clods. Evorios does not supply PPE or yard-work insurance; the host may note extras in the listing.",
            },
            {
              q: "What is not included?",
              a: "No operator service, no soil testing, no third-party yard-insurance product, and no guaranteed till quality — renter runs the machine per manual and local utility rules (call before you dig).",
            },
            {
              q: "How do deposits and claims work?",
              a: "Size deposit to engine, tines, and batteries. Bent tines, cracked gearboxes, or missing battery packs follow the rental terms and handoff photos — not an affiliate insurance upsell.",
            },
          ],
        },
        "Trees": {
          title: "Trees — name, health, transplant policy",
          summary: "Local nurseries tag species, zone, and root format. We win on peer listings when common name/cultivar, height, sun, evergreen/deciduous, container class, hardiness, health grade, transplant/return rules, and pest/soil notes are frozen on the agreement.",
          qa: [
            {
              q: "Why is common name or cultivar required?",
              a: "Species and cultivar set size, color, and fall interest — a generic 'shade tree' listing causes event and landscape mismatches. Name the plant like a nursery tag so renters self-screen before booking.",
            },
            {
              q: "What does plant health grade mean?",
              a: "Excellent/good/fair/stressed_disclosed mirrors nursery quality bands. Stressed_disclosed means visible issues (dieback, pest damage, loose B&B wrap) are named upfront — not hidden until handoff.",
            },
            {
              q: "How does transplant / return policy work for rentals?",
              a: "Keep_planted_no_return means the renter plants it and it is a sale-style handoff. Return_in_container and event_rental_return_pot mean the tree comes back in the original pot or B&B wrap — pick the option that matches your listing mode and fee.",
            },
            {
              q: "Why list hardiness zone and soil/drainage notes?",
              a: "Outdoor trees fail when planted out of zone or in wet clay. USDA-style zone bands and a short drainage note (sandy, clay, avoid wet feet) cut the #1 post-rent regret — dead or declining stock.",
            },
            {
              q: "What should pest and disease notes cover?",
              a: "Disclose scale, borers, fungal leaf spot, or recent treatment — even if minor. 'None observed this season' is valid.",
            },
            {
              q: "What is NOT included in a tree rental?",
              a: "Evorios does not sell nursery insurance, planting services, or municipal permit filing. Delivery, staking, and irrigation after handoff are between host and renter unless your listing says otherwise.",
            },
            {
              q: "How do deposits and claims work?",
              a: "Published health grade and container class set the baseline. Damage beyond disclosed stress (broken leaders, ripped root ball, dry-out) may use deposit per rental terms.",
            },
          ],
        },
        "Trimmers": {
          title: "Trimmers — head type, fuel, line condition",
          summary: "Tool-rental counters freeze cutting swath, string vs blade head, harness, fuel mix or battery platform, and spool/blade wear on the ticket. We match that on peer listings — deposit and kit ack, not yard-insurance promo.",
          qa: [
            {
              q: "What do the listing gates mean?",
              a: "Brand, model, power source, cutting width, head type, harness, fuel or battery band, line/blade condition, and kit checklist freeze on the rental agreement before you book. They mirror a tool-rental counter handoff so there are no surprises about spool type, blade use, or missing charger.",
            },
            {
              q: "String line vs metal blade — why does it matter?",
              a: "String heads trim grass and light weeds; metal blades on brushcutters cut thick brush and throw debris farther. Booking shows the head type so you match the job and know when blade safety rules apply.",
            },
            {
              q: "Do I need eye and ear protection?",
              a: "Flying debris and engine noise make safety glasses and hearing protection standard for trimmers and brushcutters. The listing may note whether you bring your own or the host includes basic glasses — this is a soft safety tip, not insurance or a stump-grinder waiver.",
            },
            {
              q: "Gas trimmers — fuel type and mix?",
              a: "Most gas trimmers use 2-stroke premix; some use 4-stroke gasoline only. The listing states fuel type and optional mix notes (ratio, who supplies oil).",
            },
            {
              q: "Cordless — battery platform and charger?",
              a: "Voltage family (18V/20V, 40V, 60V+) must match the included battery and charger in the kit checklist. Renting the wrong platform means the unit will not run your yard job — confirm battery count and charger at handoff.",
            },
            {
              q: "Harness and heavy units?",
              a: "Straight-shaft and blade brushcutters often need a shoulder harness to work safely for more than a few minutes. The listing states whether a full harness, strap only, or no harness is included so you are not stuck holding a heavy unit alone.",
            },
            {
              q: "Line, spool, and blade condition at return?",
              a: "Normal line wear is expected; depleted spool or a nicked blade beyond the published condition band may lead to refill or sharpening fees from deposit. Photo the head and spool at pickup and return if condition is borderline.",
            },
            {
              q: "What is not included?",
              a: "Evorios does not sell yard-work insurance, Home Depot rental plans, or third-party damage waivers. Deposit covers missing spools, blades, chargers, or damage beyond normal wear; injury risk stays with safe use and your own PPE.",
            },
          ],
        },
      };

export const parentCategoryKey = "Garden & Yard" as const;
