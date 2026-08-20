import type { CategoryFactBlock } from "../types";

/** Canonical EN subcategory FactCards for Electronics & Tech */
export const subs_Electronics_and_Tech: Record<string, CategoryFactBlock> = {
        "Broadcast Equipment": {
            title: "Broadcast equipment FAQ",
            summary: "Short answers for switchers, encoders, and livestream kits.",
            qa: [
              {
                q: "What subtype should be listed?",
                a: "Switcher, encoder, recorder, teleprompter, or similar—plus brand/model.",
              },
              {
                q: "What I/O and power are shown?",
                a: "Every SDI/HDMI path, cables/converters, and power/battery plate.",
              },
              {
                q: "Is capture media included?",
                a: "The listing says whether SD/CF/SSD ships with the kit.",
              },
              {
                q: "Is a return function test required?",
                a: "Yes when the host sets it—power-on / I/O check at return.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing cables/media and failed return tests beyond wear.",
              },
            ],
          },
        "Display Systems": {
            title: "Display systems FAQ",
            summary: "Short answers for panels, LED walls, mounts, and power.",
            qa: [
              {
                q: "What size and inputs are published?",
                a: "Size band, resolution/HDR, and every HDMI/DP/SDI input.",
              },
              {
                q: "Indoor or outdoor?",
                a: "Follow the listing rating—do not use indoor panels outdoors.",
              },
              {
                q: "What about power?",
                a: "Check the published circuit/amps band before setup.",
              },
              {
                q: "Are mounts or cases included?",
                a: "The listing states stand/mount/flight-case inclusion.",
              },
              {
                q: "What does the deposit cover?",
                a: "Cracked glass, bent cabinets, and missing cables/remotes/modules.",
              },
            ],
          },
        "Gaming Gear": {
            title: "Gaming gear FAQ",
            summary: "Short answers for consoles, PCs, VR, login, and wipe.",
            qa: [
              {
                q: "What login is allowed?",
                a: "Prefer guest/offline as published—do not leave personal accounts linked.",
              },
              {
                q: "How many controllers ship?",
                a: "Controller count and HDMI/cables are on the listing inventory.",
              },
              {
                q: "Is a wipe required?",
                a: "When the device has storage—follow host wipe/unlink and return wipe rules.",
              },
              {
                q: "What about VR hygiene?",
                a: "Clean face foam per the listing notes before return.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing pads/cables and damage beyond published hygiene notes.",
              },
            ],
          },
        "Laptops": {
            title: "Laptop rental FAQ",
            summary: "Short answers for unlock, charger, battery, and wipe.",
            qa: [
              {
                q: "Is the charger included?",
                a: "Yes when listed—note wattage band on the kit inventory.",
              },
              {
                q: "How do I unlock it?",
                a: "Follow the published OS/admin unlock and demo-login notes.",
              },
              {
                q: "What wipe is required?",
                a: "Host wipe status at list; return wipe depth as published; acknowledge at booking.",
              },
              {
                q: "What battery health is claimed?",
                a: "Stay within the published battery band; photo the brick at handoff.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing charger/kit pieces and screen/keyboard damage beyond grade.",
              },
            ],
          },
        "Network Gear": {
            title: "Network gear FAQ",
            summary: "Short answers for switches, APs, PoE, and factory restore.",
            qa: [
              {
                q: "What subtype and PoE are listed?",
                a: "Router/switch/AP/firewall/mesh plus PoE budget and port band.",
              },
              {
                q: "Must I factory-restore on return?",
                a: "Yes when the listing requires it—clear leftover SSIDs and admin creds.",
              },
              {
                q: "Is outdoor use allowed?",
                a: "Only if the AP/outdoor rating allows it.",
              },
              {
                q: "What kit pieces are counted?",
                a: "Injectors, antennas, SFPs, rails/ears—per inventory.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing parts and config left contrary to restore policy.",
              },
            ],
          },
        "Other": {
            title: "Other electronics FAQ",
            summary: "Short answers when no named electronics shelf fits.",
            qa: [
              {
                q: "Should I use Other?",
                a: "Prefer a named shelf (Laptops, Projectors, Gaming, etc.) so the right gates apply.",
              },
              {
                q: "What must Other listings declare?",
                a: "Power delivery, storage yes/no, wipe when storage exists, and condition photos.",
              },
              {
                q: "Multi-piece kits?",
                a: "List every piece in the inventory.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing parts and damage with photos + serial.",
              },
              {
                q: "Is partner insurance included?",
                a: "No—deposit hold only.",
              },
            ],
          },
        "Pro Audio": {
            title: "Pro audio FAQ",
            summary: "Short answers for interfaces, mics, phantom, and looms.",
            qa: [
              {
                q: "What gear type is this?",
                a: "Interface, mixer, mic, monitor, or similar—stated on the listing.",
              },
              {
                q: "Is 48V phantom / DI included?",
                a: "Check the listing—required for many condensers and bass DI needs.",
              },
              {
                q: "How are cables counted?",
                a: "Every XLR/TRS/USB/ADAT in the loom is inventoried and counted at handoff.",
              },
              {
                q: "Is a return function test required?",
                a: "Yes when set—power-on / I/O check at return.",
              },
              {
                q: "Is this the same as Music PA?",
                a: "No—this shelf is studio/capture under Electronics & Tech.",
              },
            ],
          },
        "Projectors": {
            title: "Projector rental FAQ",
            summary: "Short answers for lumens, throw, inputs, and kits.",
            qa: [
              {
                q: "How bright is it?",
                a: "Use the published lumen band and native resolution.",
              },
              {
                q: "What throw distance works?",
                a: "Follow throw/distance notes on the listing.",
              },
              {
                q: "Which inputs are included?",
                a: "HDMI count and adapters are on the inventory.",
              },
              {
                q: "Indoor or outdoor?",
                a: "Follow the published use environment.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing remote/cables and lamp/outdoor misuse beyond the listing.",
              },
            ],
          },
        "Servers & Workstations": {
            title: "Servers & workstations FAQ",
            summary: "Short answers for form factor, power, BMC, and wipe depth.",
            qa: [
              {
                q: "What form factor and power?",
                a: "Tower / rack U / laptop WS plus PSU/power config on the listing.",
              },
              {
                q: "Are rack rails included?",
                a: "Only if the listing says so—count them at handoff.",
              },
              {
                q: "What wipe depth is required?",
                a: "Secure erase, OS reinstall, or drives pulled—as published.",
              },
              {
                q: "How does IPMI/iDRAC access work?",
                a: "Follow the host BMC access policy; do not leave open credentials.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing rails/NICs and hardware loss—not cyber insurance.",
              },
            ],
          },
        "Smart Home Devices": {
            title: "Smart home devices FAQ",
            summary: "Short answers for unlink, hubs, and protocols.",
            qa: [
              {
                q: "Must I unlink my account?",
                a: "Yes—return per account-return policy; do not leave the next guest linked.",
              },
              {
                q: "Is a hub/bridge required?",
                a: "Only if the listing says the protocol needs one.",
              },
              {
                q: "Which protocol is supported?",
                a: "Wi-Fi / Thread / Zigbee / Matter band is on the listing.",
              },
              {
                q: "Cameras?",
                a: "Use the privacy cover when provided; follow install/removal notes.",
              },
              {
                q: "What does the deposit cover?",
                a: "Missing hubs/sensors and wall damage beyond install notes.",
              },
            ],
          },
        "Speakers": {
            title: "Speakers FAQ",
            summary: "Short answers for portable/party speakers (not stage PA).",
            qa: [
              {
                q: "Battery or AC?",
                a: "Follow the published power type; return charge band when battery.",
              },
              {
                q: "Outdoor / splash OK?",
                a: "Only within the published weather band.",
              },
              {
                q: "Are cables included?",
                a: "Named cable checklist on the listing—count at handoff.",
              },
              {
                q: "Volume rules?",
                a: "Follow neighbor-volume / quiet-hours notes on the listing.",
              },
              {
                q: "Is this Music & Audio PA?",
                a: "No—consumer/portable only; stage PA stays under Music & Audio.",
              },
            ],
          },
      };

export const parentCategoryKey = "Electronics & Tech" as const;
