# Figma content audit

Source: Figma API text extraction from Page 4 category/listing frames.

This audit is intentionally strict. The current Figma file contains prototype-quality content, so
new implementation work should not blindly import every category, label, or screen into product
logic.

## Flow decisions

- **Listing must split into Personal and Business/Professional.** The category screens repeatedly
  use `Personal Use` and `Professional Use`, but the current list flow only has a single
  "I want to list something for rent" branch. Before building listing forms, add an explicit
  Personal listing vs Business/Professional listing choice.
- **Rent and List are different product modes.** Keep separate state for renter browsing and owner
  listing. Do not reuse browsing category flow as listing setup without an intermediate listing
  intent screen.
- **Mr. Rentano should be contextual, not a demo panel.** Avoid sample prices/dates/examples in
  assistant UI. The assistant should explain the current screen, guide the next action, and later
  use backend/LLM context.

## Category taxonomy issues to fix before backend

### Duplicates / likely wrong labels

- `Boats & Watercraft` and `Boat & Wildcraft` both appear in top-level categories. Keep one:
  `Boats & Watercraft`.
- `Outdoor event shelters & gear` / `Outdoor event shelter & gear` appears twice.
- `Other Profession Electronic` appears in Photography & Video and should likely be
  `Other Professional Photography & Video Gear`.
- `Tech & Maker Equipment` / `Tech & Maker Equipments` should be unified.

### Spelling and wording errors

- `Vehicales & Camper` -> `Vehicles & Campers`
- `Lawn &Garden` -> `Lawn & Garden`
- `Auto Tools & Accessoties` -> `Auto Tools & Accessories`
- `GAMING CANSOLE & VR Headset` -> `Gaming Consoles & VR Headsets`
- `Dj & Party Euipment` -> `DJ & Party Equipment`
- `Cunsumer Electronice` -> `Consumer Electronics`
- `Workststion Computers &Laptop` -> `Workstation Computers & Laptops`
- `Server Rackes` -> `Server Racks`
- `Gimble` -> `Gimbal`
- `Go pro & Action camer` -> `GoPro & Action Cameras`
- `Shol gun Mics` -> `Shotgun Mics`
- `Garden Rools` -> `Garden Tools`
- `Systam` -> `System`
- `Agriculter drone` -> `Agriculture Drone`
- `Cmera` -> `Camera`
- `stabillization` -> `stabilization`
- `Evant` -> `Event`
- `pop-up Rentail Store` -> `Pop-up Retail Store`
- `Poperty` -> `Property`
- `Luxuary` -> `Luxury`
- `Preminum` -> `Premium`
- `Traning` -> `Training`
- `Spost Event Equipment` -> `Sport Event Equipment`
- `Yatchts` -> `Yachts`
- `Supposrt` -> `Support`
- `Moterhome` -> `Motorhome`
- `Flim` -> `Film`
- `Historrical` -> `Historical`
- `Roatary Hmmaer` -> `Rotary Hammer`
- `Detaling` -> `Detailing`
- `Packges` -> `Packages`
- `Lable Maker` -> `Label Maker`
- `Electronic Texting System` -> likely `Electronic Testing System`
- `Advance Laser Cuter` -> `Advanced Laser Cutter`
- `Rubotic Arm` -> `Robotic Arm`
- `Art Galary` -> `Art Gallery`
- `Roof tarrace` -> `Roof terrace`
- `Traning Simulation Room` -> `Training Simulation Room`
- `Experimantal` -> `Experimental`

### Categories requiring product/compliance review

- `Services & Experiences`: clarify if the marketplace rents items only or also books services.
- `Private Cinema Hall Rental`, `Beer Lounge Sp Bar Takeover`, `Vintage Train Car Experience`:
  potentially high-compliance or location-specific.
- `Residential & Commercial Real Estate`: may need separate legal flow, deposits, agreements,
  and availability calendars.
- `Heavy Equipment & Machinery`, `Construction Tools`, `Auto Tools`: may need insurance,
  licensing, operator, safety, and delivery rules.
- `AI Robot & Promo Bots`, `Bio-installations Experiment Labs`, `R&D Testing Station`: keep only
  if this is a deliberate business/pro category; otherwise move to a future/professional catalog.

## Screen/content issues

- Frame name `earning your atuff` should be corrected to `earning your stuff`.
- Some frames are duplicated across pages (`Page 3`, `Page 4`, and `ALL By Rent`). Use Page 4 as
  the current source of truth unless design ownership says otherwise.
- Long screens (`Home`, `Booking`) are taller than the 393x852 viewport. Product implementation
  needs scrollable screen support before these become production UI.

## Recommendation

Before implementing real backend data models, define a canonical taxonomy:

1. Top-level category id
2. Display names per locale
3. Personal subcategories
4. Business/Professional subcategories
5. Compliance flags: delivery, deposit, insurance, license/operator, age restriction, location
6. Whether the category supports renting, listing, or both

Only after that should categories become backend seed data.
