import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Gym & Fitness — host-facing Q→A only. */
export const subs_Gym_and_Fitness: Record<string, CategoryFactBlock> = {
  "Boxing Equipment": {
    title: "Boxing tips",
    summary: "Weekend gym kits beat vague peer ads .",
    qa: [
      {
        q: "What does gear type mean?",
        a: "It splits the listing into heavy bag, gloves, pads/mitts, ring-corner gear, or a mixed kit. That choice drives glove size, stand/mount, and how deep the piece checklist must be.",
      },
      {
        q: "How do weight band and glove size work?",
        a: "Weight band is the bag’s filled mass (or light gear under 10 lb). Glove size band is youth through XXL or mixed pairs — required for glove and mix listings so handoff matches the care card.",
      },
      {
        q: "What is the hygiene / wipe or liner policy?",
        a: "Hosts state wipe-before-return, liner or wraps required, host sanitizes between rentals, renter brings own gloves, or not skin-contact (bag hardware only). Soft notes may add spray or disposable liner details.",
      },
      {
        q: "Why is a pair / set checklist required?",
        a: "Left and right gloves, wraps, pads, chains, and corner pieces go missing after weekends. The renter confirms the inventory at booking and counts pieces at handoff and return.",
      },
      {
        q: "Is a stand or mount included?",
        a: "Bag, mix, and ring-corner listings declare freestanding stand, ceiling/wall mount included, mount not included, freestanding base, or N/A. Renters must know if they need their own mount or ceiling clearance.",
      },
      {
        q: "What is bag-only vs sparring use policy?",
        a: "Hosts set bag-only, pads drill only, sparring allowed under host rules, or demo/display only. Evorios does not certify coaches or sanction sparring — the host’s published rule is what goes on the rental agreement.",
      },
      {
        q: "How does the liability waiver work?",
        a: "Gym & Fitness rentals usually require an assumption-of-risk waiver at booking unless the host marks not required. The waiver covers ordinary-use injury risk; the deposit covers gear damage and missing pieces — not a gym-insurance product.",
      },
      {
        q: "What is not included?",
        a: "Unless listed: coaching, mouthguard, headgear, gym membership, Title Boxing retail kits, and any third-party sports insurance. Evorios does not sell boxing insurance or partner with big-box fight shops.",
      },
    ],
  },
  "Cardio Equipment": {
    title: "Cardio equipment tips",
    summary: "Home bikes, ellipticals, rowers, and stair climbers rent cleanly when brand, model, max user weight, power, fold/footprint, stairs notes, wipe policy, and waiver status are on the agreement — warranty is not included and is not insurance.",
    qa: [
      {
        q: "What details apply before I can rent cardio equipment?",
        a: "Rent listings list brand, model, cardio type, foldable status, plug vs battery power, equipment weight band, max user weight band, stairs move-in disclosure, hygiene wipe policy, warranty-not-included note, and liability waiver status.",
      },
      {
        q: "Bike, elliptical, rower — or a commercial treadmill?",
        a: "This personal shelf is for home upright/spin/recumbent bikes, ellipticals, rowers, stair climbers, and other home cardio. Full-size commercial treadmills belong on Commercial Treadmills so pro move and capacity details apply.",
      },
      {
        q: "Why max user weight and equipment weight bands?",
        a: "Max user weight is a safety limit for who may use the machine. Equipment weight band helps plan carry and stairs. Stay within the published max; exceeding it can damage the frame and may use deposit per rental terms.",
      },
      {
        q: "What about power, folding, floors, and stairs?",
        a: "Power needs state plug-in, battery, dual, or none/manual. Foldable status and footprint notes set apartment fit. Stairs disclosure is a soft handoff note — two-person carry, elevator, or host delivery only — not a moving-company offer.",
      },
      {
        q: "What is the hygiene wipe rule?",
        a: "Hosts set wipe-before-return, host wipe with flat fee, disposable wipes included, or light sweat OK as received. Ack the policy at booking; sweat residue beyond policy can affect deposit.",
      },
      {
        q: "Waiver vs injury — what am I agreeing to?",
        a: "Gym & Fitness defaults to a liability / assumption-of-risk waiver at booking unless the host marks not required. The waiver covers ordinary-use injury risk between peers; it is separate from the deposit, which covers equipment damage.",
      },
      {
        q: "Is manufacturer warranty or gym insurance included?",
        a: "No. Peer rentals are as-is with a soft warranty-not-included note. Evorios does not sell gym insurance, connected-fitness subscriptions, or Planet Fitness / Peloton / Mirror / Tonal partner offer plans.",
      },
      {
        q: "If something goes wrong after the rental?",
        a: "Published wipe policy, weight limits, and machine specs are listed on the agreement. Damage from misuse, missing batteries against listed power needs, or unclean return beyond wipe policy are handled via deposit and messages — not via insurance upsell.",
      },
    ],
  },
  "Commercial Treadmills": {
    title: "Commercial treadmills tips",
    summary: "Commercial decks need brand/model, motor HP, user-weight limit, deck/incline, 110/220 power, delivery access, sanitization, and clear move/install responsibility.",
    qa: [
      {
        q: "Why are commercial treadmills gated?",
        a: "Heavy motors, high user loads, and tight power/path constraints make failed handoffs expensive. Specs, sanitization, waiver, and move/install responsibility lock the rent path until cleared.",
      },
      {
        q: "What do motor HP and commercial-use class mean?",
        a: "Motor HP band is the continuous duty class when known. Commercial-use class discloses commercial-rated, light-commercial, or honest home-use — a soft duty disclosure, not an insurance certificate.",
      },
      {
        q: "What is max user weight?",
        a: "The host’s rated user-weight band (up to 200 / 250 / 300 lb, 300 lb+, or not rated). Stay within it; exceeding it risks belt, deck, and injury disputes.",
      },
      {
        q: "What about power, plug amp, and delivery notes?",
        a: "List 110/120 vs 208/220 (or dual / hardwired). Soft plug-amp band flags 15A vs 20A+ circuits. Delivery notes cover stairs, elevator, path width, and who carries the deck.",
      },
      {
        q: "Who moves and installs?",
        a: "Hosts declare whether they deliver and install, deliver only, renter picks up, a third-party mover is used, or meet curbside. Third-party mover is a disclosure — not an Evorios partner booking.",
      },
      {
        q: "What sanitization and wear hours mean?",
        a: "Hosts attest rails, console, and belt contact surfaces were wiped before list or handoff. Soft hours band is a wear proxy, not a guaranteed odometer reading.",
      },
      {
        q: "How do waiver and deposit interact?",
        a: "The liability waiver covers ordinary-use injury assumption of risk. The deposit covers equipment damage and missing parts. They are separate layers.",
      },
      {
        q: "What is not included?",
        a: "Evorios does not underwrite gym injury, sell gym insurance. Waiver + deposit + host disclosures are the primary layers.",
      },
    ],
  },
  "Competition Gear": {
    title: "Competition gear tips",
    summary: "Meet loans beat vague ads .",
    qa: [
      {
        q: "What does sport discipline band mean?",
        a: "It tags the listing as powerlifting, weightlifting, CrossFit-style, strongman, or other. That frames plate expectations and what soft federation or meet-rule notes should cover.",
      },
      {
        q: "What are federation or rule soft notes?",
        a: "Host-written expectations for a local meet, club standard, or federation-style setup. They are not an official federation partnership and do not mean Evorios certifies the gear for sanctioned competition.",
      },
      {
        q: "What is calibrated vs training plates disclosure?",
        a: "Hosts must say whether plates are calibrated competition discs, training/bumper plates, a mixed set, implements with no plates, or ask-host. Mislabeling “comp plates” that are actually training discs is the top meet dispute.",
      },
      {
        q: "What does bar certification soft text mean?",
        a: "Optional host-declared notes (manufacturer claim, prior meet use). Evorios does not issue IWF, IPF, or any platform bar approval — treat the text as the host’s statement only.",
      },
      {
        q: "Why is a kit checklist required?",
        a: "Bars, plates by denomination, collars, change plates, blocks, and straps go missing after meets. The renter confirms the list at booking and counts pieces at handoff and return.",
      },
      {
        q: "How does weight band apply here?",
        a: "Use it for the total kit or plate-set load band (or adjustable for partial sets). It is not a max-user-weight machine rating — that gate stays off this shelf.",
      },
      {
        q: "How do waiver, deposit, and claims work?",
        a: "The liability waiver covers ordinary-use injury risk when required. The deposit covers bent bars, missing plates, and damaged collars against the listed inventory. Evorios does not sell competition or sports insurance.",
      },
      {
        q: "What is not included?",
        a: "Unless listed: meet entry fees, officials, chalk beyond the kit, Rogue retail bundles, and any third-party sports insurance. No platform IWF/IPF certification badge is ever implied.",
      },
    ],
  },
  "Free Weights": {
    title: "Free weights tips",
    summary: "Dumbbells, kettlebells, and plate kits rent cleanly when weight band, pair vs set, piece list, rack inclusion, coating, floor protection, drop policy, and waiver status are on the agreement — deposit covers gear damage, not gym insurance.",
    qa: [
      {
        q: "What details apply before I can rent free weights?",
        a: "Rent listings list weight band, pair/single/set form, piece-count band, rack/stand inclusion, coating type, floor-protection rule, drop policy, and liability waiver status. Multi-piece sets also require a short kit checklist of every included piece.",
      },
      {
        q: "Pair vs set — why does piece count matter?",
        a: "A matched pair is two pieces; a set kit may include many dumbbells, plates, collars, and clamps. The checklist lists what must return — missing plates or collars are the top free-weight handoff dispute.",
      },
      {
        q: "Is a rack or stand included?",
        a: "Hosts state included, not included, optional add-on, or not applicable. Do not assume a dumbbell tree or plate rack ships with the weights unless the field says included.",
      },
      {
        q: "Rubber vs iron — and floor protection?",
        a: "Coating (rubber, urethane, bare iron, chrome, mixed) affects floor risk and noise. Floor protection may be mat required, recommended, bumper-OK on bare floor, or host provides a mat — ack at booking.",
      },
      {
        q: "What is the drop policy?",
        a: "No-drop, controlled set-down only, bumper drop OK, outdoor drop only, or host sets at handoff. Dropping bare iron against a no-drop rule can damage floors and gear and may use deposit per rental terms.",
      },
      {
        q: "Waiver vs injury — what am I agreeing to?",
        a: "Gym & Fitness defaults to a liability / assumption-of-risk waiver at booking unless the host marks not required. The waiver covers ordinary-use injury risk; the deposit covers damaged or missing weights — they are separate.",
      },
      {
        q: "What is not included?",
        a: "Manufacturer warranty transfer, gym memberships, spotting services, and third-party gym insurance are not included. Evorios does not sell Planet Fitness plans or insurance partner offer products.",
      },
      {
        q: "If something goes wrong after the rental?",
        a: "Published kit list, drop policy, and coating/floor rules are listed on the agreement. Missing pieces, floor damage against mat-required, or drops against no-drop policy are handled via deposit and messages.",
      },
    ],
  },
  Other: {
    title: "Other tips",
    summary: "Prefer a named Gym & Fitness shelf so the right details apply.",
    qa: [
      {
        q: "Should I use Other or a named shelf?",
        a: "move to a named category whenever a specific shelf fits — Yoga & Pilates, Cardio Equipment, Free Weights, Resistance Bands, Recovery Tools (personal), or Commercial Treadmills, Weight Machines, Boxing Equipment, Competition Gear, Training Systems (professional).",
      },
      {
        q: "What does the type discriminator mean?",
        a: "Cardio, weights, yoga, recovery, boxing, competition, training, or mixed tells renters what kind of gear to expect and which named shelf you should probably use instead. Mixed is a bundle spanning more than one kind — declare honestly.",
      },
      {
        q: "Why are weight band and waiver still required?",
        a: "Gym & Fitness requires a weight/resistance band category-wide and a liability waiver status on rent. Other does not skip those floors — even catch-all listings list how heavy the gear is and whether a waiver is required at booking.",
      },
      {
        q: "Do I need max user weight on Other?",
        a: "Hard max-user-weight requirements live on Cardio Equipment, Commercial Treadmills, and Weight Machines. If your Other item is cardio-like, add a max user weight when you can — or move to a named category so the hard gate applies.",
      },
      {
        q: "Do I need a piece inventory?",
        a: "Single-item listings need only the structured fields. Multi-piece kits — band packs, glove+wrap sets, recovery bundles — require a short free-text inventory listing every included piece for handoff and return.",
      },
      {
        q: "What condition photos should I attest?",
        a: "Confirm listing photos show the item overall, grips/pads/cords as relevant, visible wear or damage, and all pieces when multi-piece. This is a soft attest — we do not upload-verify — but photos are the first layer in missing-part and damage disputes.",
      },
      {
        q: "Waiver vs injury — and what is not included?",
        a: "The waiver (when required) covers ordinary-use injury risk between peers; the deposit covers damaged or missing gear. Evorios does not sell gym insurance, Peloton/Mirror/Tonal subscriptions, or Planet Fitness partner offer plans — warranty transfer is not implied on Other.",
      },
      {
        q: "How do claims work on Other?",
        a: "Use condition photos, inventory, weight band, and deposit hold for missing pieces or damage. Prefer a named shelf next time so specialist requirements (wipe, drop, max user weight, power) are listed on the agreement from the start.",
      },
    ],
  },
  "Recovery Tools": {
    title: "Recovery tools tips",
    summary: "Peer rollers and massage guns win when tool type, battery/runtime, wipe hygiene, intensity/speed, soft noise notes, and waiver are clear on the agreement.",
    qa: [
      {
        q: "What tool types are on this shelf?",
        a: "Foam rollers, massage guns, other percussion devices, ice/heat packs, massage-ball kits, or mixed recovery kits. Pick the type that matches what you will use so runtime and intensity details apply correctly.",
      },
      {
        q: "Why battery or runtime on powered tools?",
        a: "Guns and percussion devices need a charge or cord. The listing shows under 30 min, 30–60 min, 60+ min, corded AC, or unknown — plan charging before a long session. Rollers and packs are usually not powered.",
      },
      {
        q: "What is the hygiene wipe attest?",
        a: "Hosts state wiped at handoff, renter wipes before/after, sleeve/cover required, or sealed sanitized. Follow the rule — these tools touch skin and the next renter depends on a clean return.",
      },
      {
        q: "What does intensity or speed mean on a gun?",
        a: "Low, medium, high, multi-speed, or unknown/variable. Start low on unfamiliar devices. Intensity is not medical advice — stop if pain is sharp and follow the host’s ordinary-use guidance.",
      },
      {
        q: "Why soft noise notes?",
        a: "Percussion guns can bother neighbors in apartments. Hosts may note quiet hours or typical noise. Notes are soft expectations, not a measured dB certificate.",
      },
      {
        q: "Waiver vs deposit — what covers what?",
        a: "Deposit covers cracked rollers, lost heads, dead batteries beyond fair use, and missing packs. The liability waiver covers ordinary-use injury risk. They are separate — one does not replace the other.",
      },
      {
        q: "What is not included?",
        a: "No physical-therapy appointment, clinical diagnosis, or gym membership unless the host states it. Evorios does not sell gym insurance or percussion-br.",
      },
    ],
  },
  "Resistance Bands": {
    title: "Resistance bands tips",
    summary: "Peer band kits win when resistance level, piece inventory, latex vs fabric, anchor inclusion, snap/wear grade, and waiver are clear on the agreement.",
    qa: [
      {
        q: "What does resistance level band mean?",
        a: "Light through X-heavy describes effort for a single band or a matched pair. Mixed progressive set means several strengths in one kit — check the inventory for each color or label.",
      },
      {
        q: "Why list every piece in a set?",
        a: "Handles, door anchors, and small loops go missing after home workouts. A numbered checklist at listing and return beats arguing from memory when the deposit is at stake.",
      },
      {
        q: "Latex vs fabric — why does material matter?",
        a: "Latex loops and tubes can snap or trigger allergies; fabric bands stretch differently and rarely snap the same way. Pick the material that matches your skin comfort and exercise style.",
      },
      {
        q: "Is a door anchor included?",
        a: "The listing says included, door-anchor only, not included, or provided at handoff. If not included, plan bodyweight moves or bring your own safe anchor — do not improvise on fragile doors.",
      },
      {
        q: "What is snap/wear disclosure?",
        a: "Hosts grade bands from like-new to visible nicks or replace-soon. Inspect at handoff; worn latex can fail under load. The grade lists the baseline so normal stretch marks are not confused with new damage.",
      },
      {
        q: "Waiver vs deposit — what covers what?",
        a: "Deposit covers torn bands, missing handles, and lost anchors. The liability waiver covers ordinary-use injury risk (including snap-back). They are separate — one does not replace the other.",
      },
      {
        q: "What is not included?",
        a: "No personal trainer, gym floor access, or membership unless the host states it. Evorios does not sell gym insurance or sporting-goods partner offer coverage — deposit and rental terms handle damage and missing pieces.",
      },
    ],
  },
  "Training Systems": {
    title: "Training systems tips",
    summary: "Studio pop-ups beat vague ads .",
    qa: [
      {
        q: "What does system type mean?",
        a: "It splits the listing into suspension (strap-style), functional trainer / cable column, rack plus attachments, smart guided mirror-like unit, or other. Labels stay generic — Evorios does not promote Mirror, Tonal, or TRX.",
      },
      {
        q: "What are anchor and install requirements?",
        a: "Hosts declare door anchor, ceiling or wall mount, freestanding, bolted/weighted rack, renter-provides-anchor, or host installs on site. Soft notes cover door thickness, bolt pattern, or footprint so handoff does not fail.",
      },
      {
        q: "How do weight band and max users work?",
        a: "Weight band is stack max, resistance, bodyweight-only, or adjustable. Max users band is concurrent people the host allows (one, two, small group, class-size, or not rated) — not a machine max-user-weight plate.",
      },
      {
        q: "Why are ceiling height / clearance notes important?",
        a: "Suspension straps, racks, and cable trainers need room height and swing clearance. Renters confirm the space fits before pickup; missing clearance notes drive damaged ceilings and failed installs.",
      },
      {
        q: "What is the wipe hygiene policy?",
        a: "Hosts set wipe grips after each use, wipe before return, host sanitizes between, screen-and-grips wipe, or N/A outdoor-only. Soft notes may list approved cleaners.",
      },
      {
        q: "Why is a kit checklist required?",
        a: "Handles, straps, carabiners, door anchors, pins, cables, remotes, and mats go missing after pop-ups. The renter confirms the list at booking and counts pieces at handoff and return.",
      },
      {
        q: "How do waiver, deposit, and claims work?",
        a: "The liability waiver covers ordinary-use injury risk when required. The deposit covers missing attachments and damage beyond published wipe notes. Evorios does not sell gym or wellness insurance.",
      },
      {
        q: "What is not included?",
        a: "Unless listed: wall bolting labor, structural engineering, Wi-Fi, class coaching, Mirror/Tonal subscriptions, TRX retail kits, and any third-party gym insurance. Brand promo links are not part of booking.",
      },
    ],
  },
  "Weight Machines": {
    title: "Weight machines tips",
    summary: "Selectorized, cable, Smith, and functional machines need type, stack or plate-loaded band, max user weight, footprint, pin/selector, assembly status, and sanitization.",
    qa: [
      {
        q: "Why are weight machines gated?",
        a: "Heavy stacks, cable pinch points, and wrong-room footprints drive failed handoffs. Type, load band, footprint, pin/selector, assembly status, sanitization, and the category waiver lock the rent path.",
      },
      {
        q: "What does machine type mean?",
        a: "It labels cable crossover, selectorized stack, Smith, functional trainer, plate-loaded station, multi-gym, or other — so renters know the movement pattern before booking.",
      },
      {
        q: "What is the resistance / stack band?",
        a: "It is the weight-stack range, dual-stack, plate-loaded, or unknown. Pair plate-loaded with pin status not-applicable. Stay within the host’s max user-weight band on pads and platforms.",
      },
      {
        q: "What about footprint, pin, and assembly?",
        a: "Footprint matches room size (compact through room-span or wall-mounted). Pin/selector inclusion prevents missing-magnet disputes. Assembly status says fully assembled, partial, flat-pack, host installs, or disclosed pro install.",
      },
      {
        q: "What is cable wear disclosure?",
        a: "A soft honesty field for cable machines: cables OK, minor fray disclosed, recently replaced, not a cable machine, or unknown. It is disclosure — not a certification.",
      },
      {
        q: "What sanitization is expected?",
        a: "Hosts attest pads, handles, and pins were wiped before list or handoff. Renters acknowledge hygiene at booking and return contact surfaces reasonably clean.",
      },
      {
        q: "How do waiver and deposit interact?",
        a: "The liability waiver covers ordinary-use injury assumption of risk. The deposit covers equipment damage, missing pins, and cable abuse beyond disclosed wear. They are separate layers.",
      },
      {
        q: "What is not included?",
        a: "Evorios does not underwrite gym injury, sell gym insurance. Waiver + deposit + host disclosures are the primary layers.",
      },
    ],
  },
  "Yoga & Pilates": {
    title: "Yoga & Pilates tips",
    summary: "Peer mats and kits win when thickness, surface, block/strap inventory, size, wipe rules, and waiver are clear on the agreement.",
    qa: [
      {
        q: "What mat details should I check before booking?",
        a: "Thickness (thin travel vs standard vs thick cushion), surface type (PVC, TPE, rubber, cork), and length/size. These decide comfort, grip, and whether the mat fits your height or travel bag.",
      },
      {
        q: "What does the kit band and inventory checklist mean?",
        a: "Mat-only is one mat. Kits with blocks, straps, rings, or balls must list every piece. Count them at handoff — missing props drive most yoga kit deposit claims.",
      },
      {
        q: "What is the hygiene wipe policy?",
        a: "Hosts set wipe-before-and-after, wipe-after-only, sanitized at handoff, or a required towel cover. Follow the listed rule so skin-contact gear stays clean for the next renter.",
      },
      {
        q: "Why is a liability waiver on yoga gear?",
        a: "Yoga and Pilates can still strain joints or cause falls. When the host marks the waiver required, you acknowledge ordinary-use injury risk at booking — you rent from a neighbor, not a studio chain.",
      },
      {
        q: "What does weightBand mean on a mat listing?",
        a: "It is the gear’s shipping/feel band (often under 10 lb or bodyweight-only), not your body-weight limit. This shelf does not use max user weight — that gate is for machines and cardio.",
      },
      {
        q: "What does the deposit cover vs the waiver?",
        a: "Deposit covers damage, stains, and missing blocks or straps. The waiver covers ordinary-use injury risk. They are separate — one does not replace the other.",
      },
      {
        q: "What is not included?",
        a: "No studio class, instructor, or gym-membership access unless the host states it. Evorios does not sell gym insurance or Planet Fitness / studio partner offer coverage — deposit and rental terms handle damage and missing pieces.",
      },
    ],
  },
};

export const parentCategoryKey = "Gym & Fitness" as const;
