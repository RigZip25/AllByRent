import type { AppMessages } from "../types";

export const faq: AppMessages["faq"] = {
  panel: {
    searchPlaceholder: "Search help…",
    searchAria: "Search FAQ",
    noMatchesTitle: "No matches",
    noMatchesBody: (mascot) => `Try different words, or ask ${mascot} directly.`,
    askAboutQuery: (mascot) => `Ask ${mascot} about this`,
    askDefault: (mascot) => `Didn't find an answer? Ask ${mascot}`,
  },
  sections: {
    gettingStarted: "Getting started",
    navigation: "Navigation",
    hosting: "Hosting & listings",
    qrPickup: "QR & pickup",
    renting: "Renting",
    payments: "Payments & safety",
    location: "Location",
    account: "Account",
  },
  items: {
    "why-name": {
      q: "Why is it called Evorios?",
      a: "Evorios is a coined name from evo- (evolve / evolution) plus -rios, a short ending that sounds Latin/Romance and suggests many homes — varios in Spanish means “various.” Say it eh-VOR-ee-ohs (stress on VOR).\n\nWe chose it because the product is about evolution, not about stuffing “rent” or “sale” into the brand: (1) how households think — garage stuff becomes a storefront; (2) how people consume — borrow, buy used, or pass things on; (3) how neighbors relate — porch trust instead of anonymous commerce. One line: evolve how your home shares.\n\nIt can feel unfamiliar at first — that is normal for an invented brand. Descriptive names are easier on day one but hard to own worldwide and lock you into one mode. Evorios is unique to search, we own evorios.com, and once you hear the story and the stress on VOR, it sticks.",
    },
    "what-is": {
      q: "What is Evorios?",
      a: "Evorios is a neighborhood marketplace: every household is a business cell — a garage storefront on the block. Neighbors rent, sell, or gift (Sell at $0). Browse categories on Home, or stock your garage with the green + button.",
    },
    "home-feed": {
      q: "How does Home work?",
      a: "Home opens the browse hub. Tap a category chip (Tools, Garden, Party…) or “Browse the block”, then filter All · Rent · Buy on the feed. There is no search magnifier in the footer — categories live on Home. Tap the center + to list from your garage.",
    },
    "categories-nav": {
      q: "How do I browse by category?",
      a: "Open Home → use the category chips on the browse hub, or on the feed strip under Rent/Buy. Tap a category in More → How Evorios works (or the intro screen) to expand household and pro subcategories. When listing with +, pick the same categories in the wizard. There is no magnifying-glass search in the footer.",
    },
    "garage-tab": {
      q: "What is the My Garage tab?",
      a: "The Garage tab is your household storefront — active listings, booking requests, and stats. Settings (gear icon) opens your profile. Stock items anytime with the center + button.",
    },
    "location-rent": {
      q: "Why do I need to set my block?",
      a: "We show garages and items in your cluster (25 mi / ~40 km by default). Tap the location line on Home to widen to 50 or 100 mi (~80 / 160 km), or change your block. Rural or sparse? Use the wider radius there.",
    },
    "install-pwa": {
      q: "How do I install the app on my phone?",
      a: "Tap Mr. Evorios in the bottom menu for install tips, or use Add to Home Screen. On iPhone: Share → Add to Home Screen. On Android: use the browser install prompt when it appears.",
    },
    "list-first": {
      q: "How do I list my first item?",
      a: "Tap the green + in the footer (or Garage → New), then the fast wizard: 1) photos, 2) details & pricing (Rent / Sell), 3) review & publish. For rentals you may set up a QR sticker after publish. Want to give something away? Use Sell with price $0. Mr. Evorios helps on each step.",
    },
    "photos-ai": {
      q: "What happens after I add photos?",
      a: "On step 1, when you continue, Mr. Evorios analyzes your photos and suggests title, category, condition, description, and estimated value. You can edit everything on step 2.",
    },
    "pricing-modes": {
      q: "Which pricing modes should I choose?",
      a: "On step 2 (Details & pricing) pick Rent and/or Sell. Only the fields for the modes you turn on are required. Sell-only listings skip the rental QR sticker. Price $0 on Sell = free giveaway (no separate Gift mode yet).",
    },
    "replacement-value": {
      q: "What is replacement value?",
      a: "It is the cost to buy the item new today in your marketplace currency — context for you when setting a deposit. AI suggests a value from your photos. Deposit amount is always set by the host; insurance for expensive items comes later.",
    },
    "qr-sticker": {
      q: "Why do I need a QR sticker?",
      a: "For rentals, a QR links the physical item to your listing. You don’t need a printer to start — show the code from your phone at handoff. Print a sticker later (or in bulk from My Garage) if you want it on the item. We don’t ask you to photograph a printed sticker.",
    },
    "pickup-delivery": {
      q: "How do pickup and delivery work?",
      a: "New listings start with sensible neighborhood defaults (weekday porch hours). After publish, open the listing from My Garage → Full edit (or quick edits on the detail screen) to set in-person / contactless pickup and delivery miles & fees. Exact address is shared with a confirmed renter after booking.",
    },
    "book-item": {
      q: "How do I rent an item?",
      a: "Search on Home or browse the Feed, open an item, and request a booking. You'll authorize rental payment and any deposit hold separately. Track active rentals from the bookings icon on Home.",
    },
    "post-request": {
      q: "Nothing shows up in search — what now?",
      a: "Post a request from the empty search result. Neighbors with the right gear can respond. No fake counts — we show real listings on your block as garages fill up.",
    },
    "notifications": {
      q: "Where are my notifications?",
      a: "Tap the bell on Home. Tabs show All, Bookings, and Messages.",
    },
    "payments": {
      q: "How do payments work?",
      a: "Rentals: pay the rental total, then a separate deposit protection hold if the host set a deposit. Payments run through Stripe — Evorios does not store your card. Hosts connect Stripe for payouts.",
    },
    "dispute": {
      q: "Something went wrong with a rental — what now?",
      a: "Document the issue with photos and messages in the app. For urgent safety issues contact local authorities first. Mr. Evorios can guide you on next in-app steps but cannot decide disputes alone.",
    },
    "availability-step5": {
      q: "How do I set availability or pause a listing?",
      a: "Open My Garage → tap the listing:\\n• Pause / Unpause hides or restores the item in browse without deleting it.\\n• Edit availability times (weekdays / weekend) from the detail quick-edit or Full edit.\\n• Delete permanently removes the listing from your garage and the server.",
    },
    "skip-onboarding": {
      q: "Can I skip onboarding?",
      a: "Yes — Skip on intro screens sends you to set your block, then straight to Home. You can finish location later from the location chip on Home.",
    },
    "bottom-nav": {
      q: "What do the bottom menu buttons do?",
      a: "Home = browse hub & categories. Mr. Evorios = help (FAQ + chat). Green + = stock a new item. Garage = your storefront & earnings. More = profile, rentals, favorites, and How Evorios works. There is no search lupa in the footer.",
    },
    "more-menu": {
      q: "What is in the More menu?",
      a: "More holds your profile card, Rentals, Messages (in-app chat), Favorites, Notifications, My Garage shortcut, Earn dashboard, the interactive How Evorios works guide, and chat with Mr. Evorios.",
    },
    "in-app-chat": {
      q: "How do I message a neighbor in the app?",
      a: "Open More → Messages for all threads. For a rental: Rentals → open booking → Message. For a purchase: listing → message icon. Replies can send a push notification if the other person enabled push.",
    },
    "mre-tab": {
      q: "How do I use Mr. Evorios?",
      a: "Tap his tab in the footer. FAQ = instant answers (no AI cost). Chat checks FAQ first, then AI only if needed (answers are cached). Install tab helps add the app to your home screen.",
    },
    "profile-vs-garage": {
      q: "Profile vs Garage — what is the difference?",
      a: "Garage is for hosting: your listings, requests, and stats. Profile is your identity: name, photo, phone, payout setup, notifications prefs, and sign out.",
    },
    "zip-only": {
      q: "Do I need my exact street address?",
      a: "No. City + ZIP (e.g. Hot Springs Village, AR 71909) is enough for browsing nearby garages. Exact address is only shared with a confirmed renter at handoff when you choose that pickup mode.",
    },
    "arkansas-rural": {
      q: "I'm in rural Arkansas — why so few listings?",
      a: "New blocks fill in as neighbors stock their garages. Use Search wider on Home (50+ mi / ~80+ km), post a request, or list your own gear — early hosts get more visibility.",
    },
    "traveling-mode": {
      q: "I'm traveling — how do I browse another area?",
      a: "During onboarding choose Traveling, or change location from the chip on Home. Pick destination city/ZIP — we show garages there, not your home block.",
    },
    "neighbor-garage": {
      q: "How do I open a neighbor's garage?",
      a: "On Home switch to Garages lens, or tap a host card in the feed. You will see their storefront and active listings.",
    },
    "favorites": {
      q: "How do saved favorites work?",
      a: "More → Favorites saves listings you hearted. Tap any favorite to open the item and book again.",
    },
    "active-rental": {
      q: "Where is my active rental?",
      a: "More → Rentals, or the clipboard icon on Home. Open the booking for pickup window, messages, QR check-in, and return steps.",
    },
    "extend-rental": {
      q: "Can I extend a rental?",
      a: "If the host allows it, open the active rental and request more days before return. The host approves and pricing updates in the app.",
    },
    "cancel-booking": {
      q: "How do I cancel a booking?",
      a: "Open the rental in Rentals and choose Cancel before pickup. Pending requests: cancel anytime (card auth released). After acceptance: 48+ hours before start → full refund; 24–48 hours → 50%; under 24 hours → no rental refund. Host cancel before pickup refunds the renter in full.",
    },
    "host-payouts": {
      q: "How do hosts get paid?",
      a: "Connect Stripe in Profile → payouts on the account that owns the garage. Helpers do not receive that garage’s payouts. Rental payouts land after successful return; platform fees are shown before you publish.",
    },
    "deposit-release": {
      q: "When is my deposit released?",
      a: "After the host confirms return (or auto-release timer if no dispute). Holds are separate from the rental charge on your card statement.",
    },
    "passkey": {
      q: "What is a passkey?",
      a: "Passkeys let you sign in with Face ID / fingerprint instead of typing the email code each time. After first sign-in, the app may offer to set one up — optional but faster. Sign-in codes still come by email.",
    },
    "co-host": {
      q: "Can I add a co-host / helper?",
      a: "Yes. During garage setup or Profile / Account settings → Co-hosts, invite people by their own email. We email them an invite link. They sign in separately (code / Face ID), accept the invite, and can stock your shelf. They still keep their own garage if they want one. Payouts (Stripe) stay with the garage owner.",
    },
    "garage-switcher": {
      q: "I help in another garage — how do I switch?",
      a: "Open My Garage. If you belong to more than one garage, use Working in at the top to choose My garage or the shared one. Photos and + go into the garage you selected. Browse is always under your own login.",
    },
    "own-and-help": {
      q: "We live next door and help each other — do we share one garage?",
      a: "Not required. Each home can have its own garage and Stripe. Invite each other as helpers, then switch Working in when you stock their shelf. Same pattern for family in one house who want one shared storefront, or neighbors who each keep a shop.",
    },
    "stripe-garage-owner": {
      q: "Whose Stripe gets paid when helpers stock the shelf?",
      a: "Money always goes to the garage owner who connected Stripe for that storefront. Helpers can add listings; only the owner opens Live and receives payouts. If you opened Live on your phone with your bank, that is your garage — switch Working in before stocking someone else’s.",
    },
    "browse-own-login": {
      q: "If Mom’s phone is open, can Dad browse as himself?",
      a: "No — Browse and bookings follow whoever is signed in on that device. Dad uses his own phone (or signs out and into his email / Face ID). Helping on a shared garage does not change who you are when browsing or renting.",
    },
    "pause-listing": {
      q: "How do I pause a listing?",
      a: "My Garage → open the listing → Pause listing. It disappears from browse instantly. Tap Unpause when you are ready again. Use Delete only if you want it gone forever.",
    },
    "edit-listing": {
      q: "How do I edit a published listing?",
      a: "Garage → tap the listing → use quick edits on the detail screen, or Full edit for photos and pricing. Pause and Delete are on the same Manage section.",
    },
    "boost-listing": {
      q: "How do I get more views?",
      a: "Clear photos, fair pricing, and complete availability help most. Paid boost (when available) highlights your item on the block feed.",
    },
    "report-issue": {
      q: "How do I report a user or listing?",
      a: "Open the listing or rental thread → Report. For emergencies call local authorities first. Include photos and dates for damage claims.",
    },
    "app-update": {
      q: "The app asked me to update — what should I do?",
      a: "Evorios downloads updates in the background and installs them overnight around 2 AM on your phone (or the next time you open the app after that). You can also open Notifications (bell) and tap Update if you want it sooner. If the screen feels stuck after update, close and reopen the app.",
    },
    "offline": {
      q: "Does Evorios work offline?",
      a: "Browsing cached pages may work briefly, but booking, chat, and new search need internet. You will see an offline screen when there is no connection.",
    },
  },
};

