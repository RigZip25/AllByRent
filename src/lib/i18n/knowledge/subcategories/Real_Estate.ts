import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Real Estate */
export const subs_Real_Estate: Record<string, CategoryFactBlock> = {
        "Rooms & Spaces": {
          title: "Rooms & spaces — check-in, overnight, bath, quiet hours",
          summary: "Short-stay rooms rent cleanly when check-in window, overnight policy, bath access, quiet hours, size, occupancy, access type, and house rules are frozen.",
          qa: [
            {
              q: "What gates apply before rent?",
              a: "Listings freeze size, max occupancy, parking, Wi‑Fi, access type, check-in window, overnight policy, bathroom access, quiet hours, house rules, and optional cleaning fee. Guest selfie/ID is required at check-in.",
            },
            {
              q: "Can guests stay overnight?",
              a: "Hosts mark overnight OK, day-use only, or host approval. Day-use means no overnight sleep unless the host later approves in writing.",
            },
            {
              q: "Is a bathroom included?",
              a: "Private, shared, half-bath only, none on site, or portable nearby — set expectations before booking.",
            },
            {
              q: "What are quiet hours?",
              a: "Published quiet-hour band (e.g. 10pm / 11pm / midnight) or building rules. House rules add guests, smoking, pets, and checkout detail.",
            },
            {
              q: "How big is the deposit?",
              a: "Defaults toward about one month of rent unless the host sets otherwise. Cleaning fee, when set, freezes on the agreement.",
            },
            {
              q: "What is not included?",
              a: "No Airbnb Instant Book franchise, no hotel housekeeping product, and no third-party lodging insurance from Evorios.",
            },
          ],
        },
        "Garages & Storage": {
          title: "Garages & storage — clearance, door, climate, use rules",
          summary: "Storage bays need clearance height, door width, climate, access hours, and allowed-use rules plus category size and house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes clearance height, door width, climate control, access hours, storage-use policy, size, occupancy (if shared), parking/Wi‑Fi as listed, access type, and house rules.",
            },
            {
              q: "Will my vehicle or racks fit?",
              a: "Use published clearance and door-width bands. Oversized vans and lifts need a taller bay — ask before booking if clearance is unknown.",
            },
            {
              q: "Is the space climate-controlled?",
              a: "Hosts mark climate-controlled, heated only, cooled only, ambient, or unknown. Sensitive goods in ambient bays are renter risk.",
            },
            {
              q: "What can I store?",
              a: "Use policy may allow household goods, vehicle only, no hazmat, no perishables, or a host-written list. Illegal or banned goods void coverage claims.",
            },
            {
              q: "Deposit and access?",
              a: "Deposit ≈ one month unless set otherwise. Access unlocks after guest start ID — not from a forwarded confirmation alone.",
            },
            {
              q: "What is not included?",
              a: "No Neighbor / StorageMart affiliate promo, no inventory insurance product from Evorios, and no 24/7 guard service unless the host states it.",
            },
          ],
        },
        "Parking Spots": {
          title: "Parking spots — type, vehicle fit, EV, overnight",
          summary: "Spots rent cleanly when type, vehicle size fit, EV charging, overnight policy, and access hours are published with house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes spot type, vehicle size fit, EV charging, overnight parking, access hours, size band, access type, and house rules.",
            },
            {
              q: "Will my truck or van fit?",
              a: "Fit bands run compact → sedan/SUV → full-size truck → Sprinter → oversized (ask). Oversized needs host confirmation before start.",
            },
            {
              q: "Is EV charging included?",
              a: "Level 2 included, shared outlet, none, or renter brings cord. Shared outlets may have building rules — follow house rules.",
            },
            {
              q: "Overnight parking?",
              a: "Overnight OK, day-only, or host approval. Day-only spots must be vacated by the published quiet/curfew notes.",
            },
            {
              q: "Deposit and ID?",
              a: "Deposit defaults toward ~one month of listed rent. Guest selfie/ID at start unlocks access.",
            },
            {
              q: "What is not included?",
              a: "No SpotHero / ParkWhiz affiliate, no parking-ticket defense product, and no EV utility billing product from Evorios.",
            },
          ],
        },
        "Shared Offices": {
          title: "Shared offices — desks, meetings, hours, bath",
          summary: "Desk rentals need seat count, meeting-room access, office hours, bath access, and optional monitor/dock kit with house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes desk/seat count, meeting-room access, access hours, bathroom access, Wi‑Fi, size, occupancy, access type, house rules, and recommended monitor/dock kit status.",
            },
            {
              q: "How many desks?",
              a: "Bands cover 1 desk, 2–4, 5–10, 11+, or hot-desk flex. Occupancy must stay within the published max.",
            },
            {
              q: "Are meeting rooms included?",
              a: "Included, bookable extra, none on site, or open collaboration only — do not assume a private room.",
            },
            {
              q: "Business hours vs 24/7?",
              a: "Access hours band sets 24/7, business hours, extended, appointment-only, or host schedule. After-hours may need staffed access.",
            },
            {
              q: "Deposit?",
              a: "Typically about one month of rent unless the host sets another hold. Cleaning fee may apply for private suites.",
            },
            {
              q: "What is not included?",
              a: "No WeWork membership, no IT helpdesk SLA, and no commercial lease lawyering from Evorios.",
            },
          ],
        },
        "Backyard & Outdoor": {
          title: "Backyard & outdoor — power/water, noise, weather, bath",
          summary: "Yards and patios need power/water, noise curfew, weather policy, bath access, occupancy, and quiet-hour bands with house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes outdoor power/water, noise curfew, weather policy, bathroom access, quiet hours, size, occupancy, parking, access type, and house rules.",
            },
            {
              q: "Is power or water on site?",
              a: "Hosts mark both, power only, water only, neither, or ask. Bring your own generator only if house rules allow it.",
            },
            {
              q: "Can we play music?",
              a: "Noise curfew may allow music to curfew, ban amplified sound, quiet gathering only, HOA rules, or host-set curfew. Violations can use the deposit.",
            },
            {
              q: "What if it rains?",
              a: "Rain-or-shine, covered backup, cancel/reschedule for weather, or day-of host decision — published before booking.",
            },
            {
              q: "Deposit and ID?",
              a: "Deposit ≈ one month of rent by default. Guest start ID before access unlock.",
            },
            {
              q: "What is not included?",
              a: "No Peerspace event insurance upsell, no catering partner promo, and no noise-permit filing by Evorios.",
            },
          ],
        },
        "Other": {
          title: "Real estate other — declare space kind",
          summary: "Catch-all spaces must declare kind, size, occupancy, access, and house rules — re-shelf when a named shelf fits.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes space kind, size, max occupancy, parking, Wi‑Fi, access type, and house rules. Prefer a named shelf when it fits.",
            },
            {
              q: "Why space kind?",
              a: "It tells renters if this is room-like, parking/storage, office-like, outdoor, venue/studio, warehouse/retail, or mixed — so they do not book the wrong product.",
            },
            {
              q: "Deposit and check-in?",
              a: "Deposit defaults toward about one month. Guest selfie/ID at start before unlock.",
            },
            {
              q: "Cleaning fee?",
              a: "Optional; when set it shows at booking and freezes on the agreement.",
            },
            {
              q: "What is not included?",
              a: "No generic Airbnb clone promo and no platform lodging insurance product.",
            },
          ],
        },
        "Commercial Space": {
          title: "Commercial space — permitted use, load-in, hours",
          summary: "Pro suites freeze permitted use, load-in path, access hours, meeting access, and house rules with size and occupancy.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes permitted use, load-in access, access hours, meeting-room access, size, occupancy, parking, Wi‑Fi, access type, and house rules.",
            },
            {
              q: "What uses are allowed?",
              a: "Office/admin, light production, client meetings, soft pop-up, or host-listed uses only. Zoning compliance stays with host and renter — Evorios does not certify permits.",
            },
            {
              q: "How do we load gear?",
              a: "Ground-floor easy, freight elevator, stairs only, loading dock, or curbside carry — plan crew size before arrival.",
            },
            {
              q: "Deposit?",
              a: "About one month of rent by default unless the host sets another hold.",
            },
            {
              q: "Guest ID?",
              a: "Yes — start ID / selfie before access unlock, same pattern as other Real Estate.",
            },
            {
              q: "What is not included?",
              a: "No commercial lease brokerage, no COI marketplace partner, and no Instant Book office franchise.",
            },
          ],
        },
        "Event Venues": {
          title: "Event venues — event type, alcohol, AV/kitchen, noise",
          summary: "Venues need allowed event type, alcohol policy, AV/kitchen inclusion, noise curfew, quiet hours, load-in, and occupancy with house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes event type allowed, alcohol policy, AV/kitchen inclusion, noise curfew, quiet hours, load-in, size, occupancy, parking, access type, and house rules.",
            },
            {
              q: "What events are allowed?",
              a: "Meetings only, social parties, weddings/formal, film/photo, or mixed under host rules. Stick to the published type.",
            },
            {
              q: "Is alcohol allowed?",
              a: "BYOB OK, licensed caterer only, no alcohol, or host approval. Local law still applies — Evorios does not issue liquor licenses.",
            },
            {
              q: "AV and kitchen?",
              a: "Both, AV only, kitchen only, empty room, or partial — bring missing gear yourself.",
            },
            {
              q: "Deposit and cleaning?",
              a: "Deposit ≈ one month unless set otherwise. Cleaning fee often applies after events.",
            },
            {
              q: "What is not included?",
              a: "No Peerspace / The Knot affiliate, no event-insurance product from Evorios, and no security staffing unless listed.",
            },
          ],
        },
        "Studio Space": {
          title: "Studio space — type, power, sound, cyc/grid",
          summary: "Content studios freeze studio type, power amp band, sound treatment, and cyc/grid inclusion with access and house rules.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes studio type, power amp band, sound treatment, cyc/grid inclusion, size, occupancy, Wi‑Fi, parking, access type, and house rules.",
            },
            {
              q: "Photo, video, podcast, or rehearsal?",
              a: "Studio type sets expectations. Mixed rooms may not be whisper-quiet — check sound treatment.",
            },
            {
              q: "What power is available?",
              a: "Household circuits, 20A+ dedicated, three-phase, battery/generator only, or ask host for load. Overloading breakers is renter damage risk.",
            },
            {
              q: "Is there a cyc or grid?",
              a: "Cyc and grid, cyc only, pipe/grid only, empty room, or partial backdrop — bring stands if empty.",
            },
            {
              q: "Deposit?",
              a: "Defaults toward about one month of rent. Guest start ID before unlock.",
            },
            {
              q: "What is not included?",
              a: "No Giggster / Peerspace promo, no gear rental kit unless listed, and no production insurance product from Evorios.",
            },
          ],
        },
        "Warehouse & Storage": {
          title: "Warehouse — clearance, dock, forklift, climate",
          summary: "Warehouses add dock access and forklift policy on top of clearance, door width, climate, hours, and load-in.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes clearance height, door width, climate, dock access, forklift policy, load-in, access hours, size, occupancy, access type, and house rules.",
            },
            {
              q: "Dock and forklift?",
              a: "Dock high/low, drive-in, ground only, or shared dock schedule. Forklift may be included with operator, renter-certified, none, or pallet jack only.",
            },
            {
              q: "Clearance and doors?",
              a: "Use published height and width bands before bringing box trucks or racking.",
            },
            {
              q: "Climate?",
              a: "Climate-controlled vs ambient — protect sensitive inventory accordingly.",
            },
            {
              q: "Deposit and ID?",
              a: "Deposit ≈ one month by default. Guest start ID before access.",
            },
            {
              q: "What is not included?",
              a: "No Flexe / warehouse marketplace affiliate, no cargo insurance product from Evorios, and no staffed forklift unless stated.",
            },
          ],
        },
        "Retail Space": {
          title: "Retail space — storefront, fixtures, load-in, hours",
          summary: "Retail suites freeze storefront type, fixtures, load-in, access hours, and house rules with size and occupancy.",
          qa: [
            {
              q: "What gates apply?",
              a: "Rent freezes storefront type, fixture inclusion, load-in access, access hours, size, occupancy, parking, Wi‑Fi, access type, and house rules.",
            },
            {
              q: "What kind of storefront?",
              a: "Street storefront, mall inline, kiosk/pop-up, interior suite, or shared market stall — foot traffic is not guaranteed.",
            },
            {
              q: "Are fixtures included?",
              a: "Fixtures included, shelving only, empty vanilla shell, or partial. Count what you need before move-in.",
            },
            {
              q: "Hours?",
              a: "Access hours band sets when you can occupy. Mall/building rules may override — follow house rules.",
            },
            {
              q: "Deposit?",
              a: "About one month of rent by default unless the host sets another hold.",
            },
            {
              q: "What is not included?",
              a: "No Storefront.com / Appear Here affiliate, no POS merchant promo, and no sales-tax registration service from Evorios.",
            },
          ],
        },
      };

export const parentCategoryKey = "Real Estate" as const;
