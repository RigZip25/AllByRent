import { useEffect, useMemo, useState } from "react";

import { EmptySubcategoryShelf } from "./EmptySubcategoryShelf";

import { Emoji } from "./Emoji";

import { BottomNav } from "./BottomNav";

import { RentanoChatSheet } from "../../components/RentanoChat";
import { MrRentano } from "./MrRentano";
import { APP_NAME, MARKETING_URL, MASCOT_NAME } from "../../lib/brand";
import { FoundingHostPromo } from "./FoundingHostPromo";

import { subcategoriesData } from "../data/subcategories";

import type { AppMode } from "../../lib/appMode";
import { useAuth } from "../../hooks/AuthProvider";
import { readLastKnownFullName } from "../../lib/pendingAuthProfile";

import {

  getShelfCityLabel,

  fetchShelfListings,

  type ShelfPrefill,

} from "../../lib/shelfListings";
import { fetchRequestsForShelfRemote, type WantedRequest } from "../../lib/requestsStorage";

import { categoryIdFromName } from "../../screens/listing/listingItemCategories";

import { getListingDisplayTitle } from "../../lib/listingQr";
import type { MediaRef } from "../../lib/mediaStore";
import { ListingFeedCard, offerTypeFromModes } from "./ListingFeedCard";

import {

  ArrowLeft,

  Shield,

  QrCode,

  Heart,

  Star,

} from "lucide-react";



const GREEN = "#1A9E6E";

const GREEN_DARK = "#0D5C3A";

const BORDER = "#E8E6E0";

function normalizeQueryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/[\s,]+/g)
    .map((t) => t.replace(/[^\p{L}\p{N}_-]+/gu, ""))
    .filter(Boolean)
    .slice(0, 2);
}

function buildListingSearchHaystack(listing: {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  grade?: string;
  condition?: string;
}): string {
  return [
    listing.title,
    listing.description,
    listing.category,
    listing.subcategory,
    listing.grade ?? "",
    listing.condition ?? "",
  ]
    .join(" ")
    .toLowerCase();
}



function findSubcategoryLabel(category: string, subId: string): string {

  const data = subcategoriesData[category];

  if (!data) return "this shelf";

  const match = [...data.personal, ...data.professional].find((sub) => sub.id === subId);

  return match?.label ?? "this shelf";

}



function SubcategoryCard({

  emoji,

  label,

  onClick,

}: {

  emoji: string;

  label: string;

  onClick: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className="flex flex-col items-center justify-center gap-2 border bg-white transition-colors hover:border-[#1A9E6E]"

      style={{

        minHeight: 112,

        padding: 14,

        borderRadius: 16,

        borderColor: BORDER,

      }}

    >

      <Emoji emoji={emoji} size={52} />

      <span

        className="line-clamp-2 w-full px-0.5 text-center text-[14px] font-semibold leading-snug"

        style={{ color: "#888" }}

      >

        {label}

      </span>

    </button>

  );

}



interface SubcategoryProps {

  category: string;

  appMode: AppMode;

  onBack: () => void;

  onPostRequest: (prefill?: ShelfPrefill) => void;

  onStartListing: (prefill?: ShelfPrefill) => void;

  onItemSelect: (id: string) => void;

  onHome: () => void;

  onRentals: () => void;

  onFourthTab: () => void;

  onProfile: () => void;

  /** Opens AuthGate so the user can unlock/participate. */
  onUnlock: () => void;

}



export function Subcategory({

  category,

  appMode,

  onBack,

  onPostRequest,

  onStartListing,

  onItemSelect,

  onHome,

  onRentals,

  onFourthTab,

  onProfile,
  onUnlock,

}: SubcategoryProps) {
  const auth = useAuth();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [rentanoOpen, setRentanoOpen] = useState(false);

  const [searchDraft, setSearchDraft] = useState("");

  const [activeQuery, setActiveQuery] = useState("");



  const categoryData = subcategoriesData[category];

  const personalSubcategories = categoryData?.personal || [];

  const professionalSubcategories = categoryData?.professional || [];



  const cityName = getShelfCityLabel(appMode);

  const subcategoryLabel = selectedSubcategory

    ? findSubcategoryLabel(category, selectedSubcategory)

    : "";



  const shelfFilter = useMemo(

    () => ({

      category,

      subcategory: subcategoryLabel || undefined,

      city: cityName,

    }),

    [category, subcategoryLabel, cityName],

  );



  const [shelfListings, setShelfListings] = useState(() => []);
  const [shelfLoading, setShelfLoading] = useState(false);
  const [requests, setRequests] = useState<WantedRequest[]>([]);

  useEffect(() => {
    if (!selectedSubcategory) {
      setShelfListings([]);
      setShelfLoading(false);
      return;
    }
    let mounted = true;
    setShelfLoading(true);
    void fetchShelfListings(shelfFilter)
      .then((next) => {
        if (!mounted) return;
        setShelfListings(next);
      })
      .finally(() => {
        if (!mounted) return;
        setShelfLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedSubcategory, shelfFilter]);

  useEffect(() => {
    if (!selectedSubcategory) {
      setRequests([]);
      return;
    }
    let mounted = true;
    void fetchRequestsForShelfRemote({
      category,
      subcategory: subcategoryLabel,
      locationLabel: cityName,
    }).then((next) => {
      if (!mounted) return;
      setRequests(next);
    });
    return () => {
      mounted = false;
    };
  }, [category, cityName, selectedSubcategory, subcategoryLabel]);

  const enableShelfSearch = Boolean(selectedSubcategory && shelfListings.length > 10);

  const queryTokens = useMemo(() => normalizeQueryTokens(activeQuery), [activeQuery]);

  const filteredShelfListings = useMemo(() => {
    if (queryTokens.length === 0) return shelfListings;
    return shelfListings.filter((listing) => {
      const haystack = buildListingSearchHaystack(listing);
      return queryTokens.every((token) => haystack.includes(token));
    });
  }, [queryTokens, shelfListings]);



  const hasItemsInSubcategory = selectedSubcategory !== null && shelfListings.length > 0;



  const shelfPrefill: ShelfPrefill = {

    category,

    categoryId: categoryIdFromName(category),

    subcategory: subcategoryLabel,

    subcategoryId: selectedSubcategory ?? undefined,

    city: cityName,

  };



  const gridItems = filteredShelfListings.map((listing) => ({

    id: listing.id,

    title: getListingDisplayTitle(listing) || listing.title || "Listing",

    price: listing.pricing.dailyRate || "—",

    rating: 4.8,

    reviews: 0,

    distance: "nearby",

    cover: listing.photos?.[0] ?? null,

    offerType: offerTypeFromModes(listing.modes),

    itemHeavy: listing.handoff.itemHeavy,

  }));



  const handleShare = () => {

    const message =

      appMode === "earn"

        ? `I'm listing ${subcategoryLabel} on ${APP_NAME} — open your garage showcase in ${cityName}! ${MARKETING_URL}`

        : `Looking for ${subcategoryLabel} near ${cityName} on ${APP_NAME}. Browse neighborhood garages → ${MARKETING_URL}`;

    if (typeof navigator !== "undefined" && navigator.share) {

      void navigator.share({ title: APP_NAME, text: message, url: MARKETING_URL }).catch(() => {

        void navigator.clipboard?.writeText(message);

      });

      return;

    }

    void navigator.clipboard?.writeText(message);

  };



  const showEmptyState = Boolean(selectedSubcategory && !shelfLoading && !hasItemsInSubcategory);

  const showFilteredEmptyState =

    Boolean(selectedSubcategory) &&

    hasItemsInSubcategory &&

    queryTokens.length > 0 &&

    filteredShelfListings.length === 0;

  const handleFind = () => setActiveQuery(searchDraft.trim());

  const handleSelectSubcategory = (subId: string) => {

    setSelectedSubcategory(subId);

    setSearchDraft("");

    setActiveQuery("");

  };

  const greetingName = readLastKnownFullName().trim().split(/\s+/)[0] || "";
  const personalizedLine = greetingName
    ? `${greetingName} — so cool you’re among the first. We’re just getting started.`
    : "So cool you’re among the first. We’re just getting started.";



  return (

    <div className="screen bg-[#F0F4F2] flex flex-col overflow-hidden">

      <div className="shrink-0 bg-white border-b px-4 py-3" style={{ borderColor: BORDER }}>

        <div className="flex items-center gap-3">

          <button

            type="button"

            onClick={onBack}

            className="p-2 hover:bg-[#F0F4F2] rounded-full transition-colors"

          >

            <ArrowLeft className="w-5 h-5" style={{ color: GREEN_DARK }} />

          </button>

          <h1 className="text-[17px] font-bold flex-1 truncate" style={{ color: GREEN_DARK }}>{category}</h1>

        </div>

      </div>



      <div className="flex-1 min-h-0 overflow-y-auto">

        {!selectedSubcategory ? (

          <div className="p-4 space-y-6">

            <div>

              <h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN }}>Personal Use</h2>

              <div className="grid grid-cols-2 gap-[10px]">

                {personalSubcategories.map((sub) => (

                  <SubcategoryCard

                    key={sub.id}

                    emoji={sub.emoji}

                    label={sub.label}

                    onClick={() => handleSelectSubcategory(sub.id)}

                  />

                ))}

              </div>

            </div>



            <div>

              <h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN_DARK }}>Professional Use</h2>

              <div className="grid grid-cols-2 gap-[10px]">

                {professionalSubcategories.map((sub) => (

                  <SubcategoryCard

                    key={sub.id}

                    emoji={sub.emoji}

                    label={sub.label}

                    onClick={() => handleSelectSubcategory(sub.id)}

                  />

                ))}

              </div>

            </div>

          </div>

        ) : selectedSubcategory && !auth.session ? (
          <div className="p-4 space-y-4">
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-sm font-semibold" style={{ color: GREEN_DARK }}>
                {personalizedLine}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Unlock this shelf with a magic link to browse listings, post a request, and save
                favorites.
              </p>
            </div>
            <button
              type="button"
              onClick={onUnlock}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
              style={{ backgroundColor: GREEN_DARK }}
            >
              Get magic link to unlock →
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubcategory(null)}
              className="w-full rounded-xl border py-2.5 text-sm font-semibold"
              style={{ borderColor: BORDER, color: GREEN_DARK }}
            >
              Back to subcategories
            </button>
          </div>
        ) : showEmptyState ? (

          <EmptySubcategoryShelf

            categoryName={category}

            subcategoryName={subcategoryLabel}

            cityName={cityName}

            appMode={appMode}
            requests={requests}

            onBack={() => setSelectedSubcategory(null)}

            onPostRequest={() => onPostRequest(shelfPrefill)}

            onStartListing={() => onStartListing(shelfPrefill)}

            onShare={handleShare}

          />

        ) : hasItemsInSubcategory ? (

          <div className="p-4 space-y-4">

            <FoundingHostPromo
              appMode={appMode}
              subcategoryLabel={subcategoryLabel}
              onPrimary={() => {
                if (appMode === "earn") onStartListing(shelfPrefill);
                else onPostRequest(shelfPrefill);
              }}
              onShare={handleShare}
            />

            <button

              onClick={() => setSelectedSubcategory(null)}

              className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"

            >

              <ArrowLeft className="w-4 h-4" />

              Back to subcategories

            </button>



            {enableShelfSearch ? (

              <div className="rounded-2xl border bg-white p-3" style={{ borderColor: BORDER }}>

                <div className="flex items-center gap-3">

                  <MrRentano size={28} className="shrink-0" />

                  <input

                    value={searchDraft}

                    onChange={(e) => setSearchDraft(e.target.value)}

                    onKeyDown={(e) => {

                      if (e.key === "Enter") handleFind();

                    }}

                    placeholder="Search in this shelf…"

                    className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"

                    style={{ borderColor: BORDER }}

                    inputMode="search"

                  />

                  <button

                    type="button"

                    onClick={handleFind}

                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"

                    style={{ backgroundColor: GREEN_DARK }}

                    disabled={!searchDraft.trim()}

                  >

                    Find

                  </button>

                </div>



                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">

                  {queryTokens.length > 0 ? (

                    <span aria-live="polite">

                      {filteredShelfListings.length} match{filteredShelfListings.length === 1 ? "" : "es"} in{" "}

                      {subcategoryLabel}

                    </span>

                  ) : (

                    <span>Tip: use 1–2 keywords (e.g. “dewalt”, “tripod”)</span>

                  )}



                  <button

                    type="button"

                    onClick={() => {

                      setActiveQuery(searchDraft.trim());

                      setRentanoOpen(true);

                    }}

                    className="text-primary hover:underline disabled:opacity-50"

                    disabled={!searchDraft.trim()}

                    title="Uses AI only when tapped"

                  >

                    Ask {MASCOT_NAME}

                  </button>

                </div>

              </div>

            ) : null}



            {showFilteredEmptyState ? (

              <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>

                <p className="text-sm font-semibold" style={{ color: GREEN_DARK }}>

                  No matches for “{activeQuery.trim()}”

                </p>

                <p className="mt-1 text-xs text-muted-foreground">

                  Try fewer keywords, or post a request so hosts know what to list.

                </p>

                <button

                  type="button"

                  onClick={() => onPostRequest({ ...shelfPrefill, query: activeQuery.trim() })}

                  className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white"

                  style={{ backgroundColor: GREEN_DARK }}

                >

                  Post request for “{activeQuery.trim()}”

                </button>

              </div>

            ) : null}



            <div className="grid grid-cols-2 gap-3">

              {gridItems.map((item) => (

                <ListingFeedCard

                  key={item.id}

                  title={item.title}

                  price={item.price}

                  rating={item.rating}

                  reviews={item.reviews}

                  distance={item.distance}

                  cover={item.cover}

                  offerType={item.offerType}

                  itemHeavy={item.itemHeavy}

                  onSelect={() => onItemSelect(item.id)}

                />

              ))}

            </div>

          </div>

        ) : null}

      </div>



      <BottomNav

        activeTab="none"

        appMode={appMode}

        onHome={onHome}

        onRentals={onRentals}

        onRentano={() => setRentanoOpen(true)}

        onFourthTab={onFourthTab}

        onProfile={onProfile}

      />

      <RentanoChatSheet

        open={rentanoOpen}

        onClose={() => setRentanoOpen(false)}
        defaultView="chat"

        context={{

          screen: "subcategory",

          appMode,

          category,

          subcategory: subcategoryLabel,

          city: cityName,

          query: activeQuery.trim() || searchDraft.trim(),

          listingTitles: shelfListings

            .slice(0, 20)

            .map((l) => getListingDisplayTitle(l) || l.title)

            .filter(Boolean),

        }}

      />

    </div>

  );

}

