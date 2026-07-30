export const SUPPORTED_LOCALES = ["en", "cs"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  cs: "Čeština",
};

export const DEFAULT_LOCALE: AppLocale = "en";

export type FaqSectionId =
  | "gettingStarted"
  | "navigation"
  | "hosting"
  | "qrPickup"
  | "renting"
  | "payments"
  | "location"
  | "account";

export type FaqItemId =
  | "what-is"
  | "home-feed"
  | "categories-nav"
  | "garage-tab"
  | "location-rent"
  | "install-pwa"
  | "list-first"
  | "photos-ai"
  | "pricing-modes"
  | "replacement-value"
  | "qr-sticker"
  | "pickup-delivery"
  | "book-item"
  | "post-request"
  | "notifications"
  | "payments"
  | "dispute"
  | "availability-step5"
  | "skip-onboarding"
  | "bottom-nav"
  | "more-menu"
  | "in-app-chat"
  | "mre-tab"
  | "profile-vs-garage"
  | "zip-only"
  | "arkansas-rural"
  | "traveling-mode"
  | "neighbor-garage"
  | "favorites"
  | "active-rental"
  | "extend-rental"
  | "cancel-booking"
  | "host-payouts"
  | "deposit-release"
  | "passkey"
  | "co-host"
  | "pause-listing"
  | "edit-listing"
  | "boost-listing"
  | "report-issue"
  | "app-update"
  | "offline";

export type OnboardingMessages = {
  roleChoice: {
    title: string;
    subtitle: string;
    stockGarage: { title: string; subtitle: string; cta: string };
    browseBlock: { title: string; subtitle: string; cta: string };
    footer: string;
  };
  location: {
    title: string;
    subtitle: string;
    onBlock: { title: string; subtitle: string; cta: string };
    trip: { title: string; subtitle: string; cta: string };
  };
  tripDestination: {
    title: string;
    subtitle: string;
    ctaWithCity: (city: string) => string;
    ctaDefault: string;
  };
  allSet: {
    title: string;
    subtitle: string;
    exploreCta: string;
    stockGarageCta: string;
  };
  browseHub: {
    title: string;
    subtitle: string;
    findGear: { title: string; subtitle: string; cta: string };
    yardSales: { title: string; subtitle: string; cta: string };
    categoriesTitle: string;
    categoriesHint: string;
    footer: string;
  };
  firstHello: {
    bubbles: [string, string, string];
    cta: string;
    skipHint: string;
  };
  productIntro: {
    eyebrow: string;
    title: string;
    body: string;
    rent: string;
    rentHint: string;
    sell: string;
    sellHint: string;
    gift: string;
    giftHint: string;
    catalogTitle: string;
    catalogHint: string;
    nextHint: string;
    continueCta: string;
  };
};

export type AppMessages = {
  tagline: string;
  taglineShort: string;
  modes: { earn: string; rent: string };
  common: {
    back: string;
    continue: string;
    skip: string;
    cancel: string;
    save: string;
    send: string;
    edit: string;
    close: string;
    next: string;
    loading: string;
    signIn: string;
  };
  nav: {
    home: string;
    stock: string;
    garage: string;
    more: string;
  };
  splash: {
    chipGarage: string;
    chipBlock: string;
  };
  auth: {
    intentTitle: string;
    intentListSubtitle: string;
    intentListRentano: string;
    intentBookSubtitle: string;
    intentBookRentano: (mascot: string) => string;
    intentMessageSubtitle: string;
    intentMessageRentano: (mascot: string) => string;
    intentGenericSubtitle: string;
    intentGenericRentano: (mascot: string) => string;
    confirmTitle: string;
    confirmSubtitle: (email: string, mascot: string, otpHint: string) => string;
    closeAria: string;
    supabaseMissing: string;
    nameRequired: string;
    emailInvalid: string;
    locationRequired: string;
    rateLimit: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phoneOptional: string;
    phonePlaceholder: string;
    areaLabel: string;
    useMyLocation: string;
    detecting: string;
    areaPlaceholder: string;
    areaEmptyHint: string;
    sendCode: string;
    sending: string;
    resendIn: (seconds: number) => string;
    agreePrefix: string;
    terms: string;
    and: string;
    privacy: string;
    summaryName: string;
    summaryEmail: string;
    summaryPhone: string;
    summaryArea: string;
    codeSent: string;
    emptyValue: string;
    otpLabel: string;
    otpPlaceholder: string;
    verify: string;
    checking: string;
    wrongDetailsHint: string;
    sendNewCode: string;
    newCodeIn: (seconds: number) => string;
    editDetails: string;
    spamHint: string;
    freeToJoin: string;
  };
  install: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    body: (appName: string, shortName: string) => string;
    iosStep1Title: string;
    iosStep1Hint: string;
    iosStep2Title: string;
    iosStep2Hint: string;
    iosStep3Title: string;
    iosStep3Hint: string;
    iosStep4Title: string;
    iosStep4Hint: (shortName: string) => string;
    iosAddButton: string;
    androidInstallReady: string;
    androidMenuStep: string;
    androidInstallStep: string;
    iosAfterAdd: (appName: string) => string;
    androidAfter: (appName: string) => string;
    installApp: (appName: string) => string;
    addedContinue: string;
    continueBrowser: string;
    almostThereAlert: (shortName: string) => string;
  };
  home: {
    priceAny: string;
    priceUnder25: string;
    price25to75: string;
    price75plus: string;
    backToBrowseAria: string;
    setBlock: string;
    setBlockAria: string;
    changeBlockAria: string;
    filtersAria: string;
    filters: string;
    bookingsAria: string;
    notificationsAria: string;
    notificationsUpdateAria: string;
    closeFiltersAria: string;
    garagesNearYou: string;
    loadingGarages: string;
    emptyFilteredTitle: string;
    emptyBlockTitle: string;
    emptyFilteredBody: (category: string) => string;
    emptyBlockBody: string;
    postRequest: string;
    postRequestShare: string;
    stockGarage: string;
    clearFilters: string;
    modeAny: string;
    modeRent: string;
    modeBuy: string;
    filtersTitle: string;
    categoryTitle: string;
    allCategories: string;
    priceTitle: string;
    distanceTitle: string;
    miles: (n: number) => string;
    done: string;
    cantFind: string;
    cantFindBody: string;
  };
  item: {
    notFound: string;
    about: string;
    availability: string;
    rentalIncludes: string;
    askOwner: string;
    checkAvailability: string;
    share: string;
    addFavoriteAria: string;
    removeFavoriteAria: string;
    signInToMessage: string;
    messageGiftHint: string;
    messageSellHint: string;
    messageRentHint: string;
    viewPublicProfile: string;
    verifiedHost: (appName: string) => string;
    startBookingAria: string;
    messageSellerAria: string;
    messagingOpensWithBooking: string;
    messageSellerTitle: string;
    questionsBeforeBuy: string;
    questionsBeforeBook: string;
    instructions: string;
    deliveryAvailable: string;
    bidInGarage: string;
    viewInGarage: string;
    paused: string;
    giftHint: string;
    notAvailable: string;
    yourListing: string;
    sellerMissing: string;
  };
  rentals: {
    title: string;
    subtitleGuest: string;
    subtitleHost: string;
    tabActive: string;
    tabUpcoming: string;
    tabHistory: string;
    roleAll: string;
    roleRenting: string;
    roleHosting: string;
    sortRecent: string;
    sortOldest: string;
    sortAmount: string;
    emptyActiveTitle: string;
    emptyActiveBody: string;
    emptyUpcomingTitle: string;
    emptyUpcomingBody: string;
    emptyHistoryTitle: string;
    emptyHistoryBody: string;
    searchPlaceholder: string;
    requests: string;
    scanCheckinTitle: string;
    leaveReview: string;
    reRent: string;
    viewDetails: string;
    loadMore: (remaining: number) => string;
  };
  profile: {
    language: string;
    languageAuto: string;
    languageValue: (label: string) => string;
    languageHint: string;
    defaultExperience: string;
    defaultExperienceHint: string;
    yourStats: string;
    asRenter: string;
    asHost: string;
    response: string;
    noRentalsYet: string;
    noListingsYet: string;
    listingsCount: (n: number) => string;
    account: string;
    location: string;
    name: string;
    phone: string;
    addPhone: string;
    personalInfo: string;
    coHosts: string;
    coHostsHint: string;
    payouts: string;
    bankConnected: string;
    connectBank: string;
    openingStripe: string;
    payoutsEnabled: (last4?: string) => string;
    pendingVerification: string;
    requiredPayouts: string;
    reviews: string;
    noComment: string;
    trustPayments: string;
    verification: string;
    fullyVerified: string;
    completeId: string;
    reviewsHint: string;
    preferences: string;
    notifications: string;
    on: string;
    off: string;
    helpFaq: string;
    signOut: string;
    signingOut: string;
    signInCreate: string;
    signInRequired: string;
    addProfilePhoto: string;
    signInPublicProfile: string;
  };
  more: {
    title: string;
    subtitle: string;
    profileHint: string;
    sectionActivity: string;
    sectionGarage: string;
    sectionSupport: string;
    rentals: string;
    rentalsHint: string;
    messages: string;
    messagesHint: string;
    favorites: string;
    favoritesHint: string;
    notifications: string;
    notificationsHint: string;
    myGarage: string;
    myGarageHint: string;
    earnDashboard: string;
    earnDashboardHint: string;
    howItWorks: (appName: string) => string;
    howItWorksHint: string;
    chatWith: (mascot: string) => string;
    chatWithHint: string;
    accountSettings: string;
    accountSettingsHint: string;
  };
  messages: {
    title: string;
    subtitle: string;
    signInHint: string;
    emptyTitle: string;
    emptyBody: string;
    rental: string;
    buyGift: string;
    tapToDiscuss: string;
  };
  howItWorks: {
    title: (appName: string) => string;
    stepOf: (step: number, total: number) => string;
    steps: {
      idea: { title: string; subtitle: string };
      modes: { title: string; subtitle: string };
      navigate: { title: string; subtitle: string };
      categories: { title: string; subtitle: string };
    };
    ideaBody1: (appName: string) => string;
    ideaBody2: string;
    rememberTitle: string;
    rememberBody: string;
    modeRentTitle: string;
    modeRentBody: string;
    modeSellTitle: string;
    modeSellBody: string;
    modeGiftTitle: string;
    modeGiftBody: string;
    navHomeTitle: string;
    navHomeBody: string;
    navStockTitle: string;
    navStockBody: string;
    navGarageTitle: string;
    navGarageBody: string;
    navMoreTitle: string;
    navMoreBody: (mascot: string) => string;
    catalogHint: string;
    browseCta: string;
    stockCta: string;
    askCta: (mascot: string) => string;
  };
  catalog: {
    explorerHint: string;
    household: string;
    pro: string;
  };
  garage: {
    title: string;
    subtitle: string;
  };
  mrEvorios: {
    subtitle: (appName: string, modeLabel: string) => string;
    chat: string;
    faq: string;
    install: string;
    welcome: (mascot: string) => string;
    listeningHint: string;
    editThenSend: string;
    placeholderListening: string;
    placeholderIdle: string;
  };
  listing: {
    stepOf: (step: number, total: number) => string;
    continue: string;
    editListing: string;
    goPublicTitle: string;
    howQrWorks: string;
    qrSetup: string;
    saved: string;
    published: string;
    sellerSetup: string;
    loadingListing: string;
    goBackAria: string;
    returnToPreviousQr: string;
    analyzingPhotos: (mascot: string) => string;
    discardTitle: string;
    discardBody: string;
    discard: string;
    listingActive: string;
    savedFinishQr: string;
    intro: {
      slideSnapTitle: string;
      slideSnapTip: string;
      slideShowcaseTitle: string;
      slideShowcaseTip: (mascot: string) => string;
      slideGoLiveTitle: string;
      slideGoLiveTip: string;
      goToSlideAria: (n: number) => string;
    };
    steps: {
      photos: string;
      detailsPricing: string;
      reviewPublish: string;
    };
    photos: {
      title: string;
      subtitle: (maxPhotos: number, maxVideos: number) => string;
      chooseLibrary: string;
      takePhoto: string;
      addVideo: string;
      addMoreSlots: string;
      cover: string;
      addPhotoAria: string;
      retryAria: string;
      enhancing: string;
      tapToRetry: string;
      listingPhotoAria: string;
      displayFailed: string;
      viewCoverAria: string;
      viewPhotoAria: string;
      removePhotoAria: string;
      removeVideoAria: string;
      videosHeading: (count: number, max: number) => string;
      loadingVideo: string;
      aiFillsTitle: string;
      aiFillsBody: (mascot: string) => string;
      reanalyzing: string;
      reanalyze: string;
      tipDefault: (mascot: string) => string;
      tipYardSale: (mascot: string) => string;
      tipAnalyzed: string;
      previewAria: string;
      closePreviewAria: string;
      setAsCover: string;
      previousPhotoAria: string;
      nextPhotoAria: string;
      enhancementUnavailable: (detail: string) => string;
      couldntAddPhoto: (detail: string) => string;
    };
    itemInfo: {
      title: string;
      titleYardSale: string;
      subtitle: string;
      subtitleYardSale: string;
      yardSaleBadge: string;
      fieldTitle: string;
      titlePlaceholder: string;
      category: string;
      selectCategory: string;
      grade: string;
      personal: string;
      professional: string;
      gradeHint: string;
      subcategory: string;
      selectGradeFirst: string;
      selectSubcategory: string;
      selectGradeForSubs: string;
      condition: string;
      conditionNew: string;
      conditionLikeNew: string;
      conditionGood: string;
      conditionFair: string;
      description: string;
      descriptionPlaceholder: string;
      rewriting: (mascot: string) => string;
      askImprove: (mascot: string) => string;
      replacementValue: string;
      replacementValueHelper: string;
      notSureValue: string;
      searchPriceLink: (title: string) => string;
      instructionsUrl: string;
      instructionsPlaceholder: string;
      instructionsHelper: string;
    };
    modes: {
      title: string;
      subtitle: string;
      rent: string;
      sell: string;
      gift: string;
      rentSubtitleDailyWeeklyMonthly: string;
      rentSubtitleWeeklyMonthly: string;
      rentSubtitleMonthly: string;
      rentSubtitleDailyWeekly: string;
      sellSubtitle: string;
      giftSubtitle: string;
      minimumPeriod: string;
      period1Day: string;
      period3Days: string;
      period1Week: string;
      period2Weeks: string;
      period1Month: string;
      dailyRate: string;
      weeklyRate: string;
      monthlyRate: string;
      longTermTitle: string;
      longTermBody: string;
      longTermToggleAria: string;
      longTermMonthlyRate: string;
      longTermRentersNote: string;
      howToPrice: string;
      longTermHelp: (example: string) => string;
      securityDeposit: string;
      securityDepositHint: string;
      depositProtectionNote: (label: string) => string;
      salePrice: string;
      sellNote: string;
      pricingTipRoi: (count: number) => string;
      pricingTipDefault: string;
      restrictedModesNote: string;
    };
    pickup: {
      title: string;
      subtitle: string;
      inPerson: string;
      inPersonDesc: string;
      contactless: string;
      contactlessDesc: string;
      privacyTitle: string;
      privacyAddress: string;
      privacyInstructions: string;
      contactlessPlaceholder: string;
      contactlessUnlockHint: string;
      heavyItem: string;
      weightLbs: string;
      weightRequired: string;
      weightPlaceholder: string;
      iCanDeliver: string;
      iCanDeliverDesc: string;
      deliveryHeading: string;
      deliveryPolicy: string;
      maxDistance: string;
      milesRoundTrip: string;
      roundTripFee: string;
      estimate: string;
      usingEnteredFee: string;
      estimateTitle: string;
      estimateBody: string;
      estimateBase: string;
      estimatePerMile: string;
      estimateHeavy: string;
      estimateNoSurcharge: string;
      suggestedTotal: string;
      useThisPrice: string;
      pickHandoffHint: string;
    };
    availability: {
      title: string;
      subtitle: string;
      regularHours: string;
      regularHoursDesc: string;
      daysOfWeek: string;
      weekdayMo: string;
      weekdayTu: string;
      weekdayWe: string;
      weekdayTh: string;
      weekdayFr: string;
      weekdaySa: string;
      weekdaySu: string;
      weekdaysLabel: string;
      weekendsLabel: string;
      from: string;
      to: string;
      start: string;
      end: string;
      optionalExceptions: string;
      optionalExceptionsDesc: string;
      pauseListing: string;
      pauseDesc: string;
      listingPaused: string;
      blockDates: string;
      blockDatesDesc: string;
      addBlockedPeriod: string;
      blockThisPeriod: string;
      remove: string;
      hint: string;
      imageAlt: string;
    };
    qr: {
      title: string;
      subtitle: string;
      requiredTitle: string;
      requiredBody: string;
      afterPublishing: string;
      emailPrint: string;
      printLabel: string;
      printBulk: string;
      publishBeforePrint: string;
      tip: string;
    };
    review: {
      title: string;
      subtitle: string;
      modes: string;
      rent: string;
      sell: string;
      freeGiveaway: string;
      rateSet: string;
      priceSet: string;
      free: string;
      ratePerDay: (rate: string) => string;
      handoffInPerson: string;
      handoffContactless: string;
      handoffHeavy: string;
      handoffDelivery: (miles: number, fee: string, weight: string) => string;
      handoffDeliveryNoFee: (miles: number, weight: string) => string;
      handoffNotSet: string;
      handoffAdjustHint: string;
      paused: string;
      availableDefault: string;
      untitled: string;
      tipEditing: string;
      tipNew: string;
      saving: string;
      opening: string;
      saveChanges: string;
      goPublicCta: string;
      nearby: string;
    };
    goPublic: {
      backToReview: string;
      title: string;
      subtitle: string;
      checkingSetup: string;
      signInTitle: string;
      signInDone: string;
      signInPending: string;
      signInCta: string;
      stripeTitle: string;
      stripeConnectedBank: (last4: string) => string;
      stripePayoutsEnabled: string;
      stripeOnboardingComplete: string;
      stripeFinishForm: string;
      stripePending: string;
      openingStripe: string;
      continueStripe: string;
      refreshing: string;
      refreshStatus: string;
      tip: (mascot: string) => string;
      goingLive: string;
      goLive: string;
      completeSteps: string;
    };
    success: {
      title: string;
      isOn: string;
      shareListing: string;
      backToListings: string;
    };
  };
  booking: {
    loading: string;
    notFound: string;
    goBack: string;
    title: string;
    heavyItem: string;
    rentalLength: string;
    days: (n: number) => string;
    hostMinimum: (period: string) => string;
    longTermTip: string;
    pickupStartDate: string;
    datesBlocked: string;
    howWantItem: string;
    pickupInPerson: string;
    pickupInPersonDesc: string;
    pickupContactless: string;
    pickupContactlessDesc: string;
    deliveryRoundTrip: string;
    deliveryRoundTripDesc: string;
    deliveryAddress: string;
    deliveryAddressPlaceholder: string;
    deliveryFeeNote: string;
    depositHoldNote: (label: string, amount: string) => string;
    depositHoldTitle: (label: string) => string;
    depositHoldBody: (amount: string) => string;
    cardPayment: string;
    backToDetails: string;
    preparing: string;
    continueToPay: (total: string) => string;
    sendRequest: (total: string) => string;
    authorizeDepositFooter: string;
    completePaymentFooter: string;
    failedToSave: string;
    confirmedTitle: string;
    confirmedBody: string;
    withHost: (name: string) => string;
    total: (amount: string) => string;
    ref: (id: string) => string;
    viewRentals: string;
    backToHome: string;
  };
  postRequest: {
    title: string;
    headline: string;
    headlineLocked: string;
    subtitle: string;
    subtitleLocked: string;
    requestFor: string;
    selectCategory: string;
    catTools: string;
    catSports: string;
    catPhoto: string;
    catGaming: string;
    catMusic: string;
    catHome: string;
    describeLabel: string;
    describePlaceholder: string;
    locationRadius: string;
    dateRange: string;
    selectDates: string;
    fromDate: (date: string) => string;
    selectDateRange: string;
    startDate: string;
    endDate: string;
    confirm: string;
    budgetPerDay: string;
    idPayUpTo: string;
    shareTitle: string;
    shareBody: string;
    posting: string;
    postCta: string;
    errorMissingCategoryLocked: string;
    errorPickCategory: string;
    errorMissingSubcategory: string;
    errorDescription: string;
    errorSignIn: string;
    postedTitle: string;
    shareNowTitle: string;
    shareNowBody: string;
    done: string;
    lookingForQuery: (query: string) => string;
    lookingForQueryNear: (query: string, city: string) => string;
    shareTitleApp: (appName: string) => string;
    shareDefaultText: (appName: string, city: string) => string;
  };
  garageUi: {
    shop: string;
    share: string;
    shareShowcaseTitle: string;
    shareShowcaseBody: string;
    finishPublishingTitle: string;
    finishPublishingBody: (title: string, step: number) => string;
    resumeDraft: string;
    garageLiveShareTitle: string;
    garageLiveShareBody: string;
    openShareSheet: string;
    shareGarage: string;
    live: string;
    needsQr: string;
    earnings: string;
    noneYet: string;
    pendingBookingRequests: string;
    activeRentals: string;
    yourListings: string;
    newListing: string;
    loading: string;
    noListingsYet: string;
    noListingsBodyBefore: string;
    noListingsBodyAfter: string;
    statusPaused: string;
    statusNeedsQr: string;
    statusAwaitingOk: string;
    statusReadyPickup: string;
    statusOutWithNeighbor: string;
    statusOverdue: string;
    statusCompleted: string;
    openListingAria: (title: string) => string;
    itemFallback: string;
  };
  rentalDetail: {
    title: string;
    emptyBody: string;
    backToRentals: string;
    overdueWarning: string;
    openDisputeTitle: string;
    openDisputeBody: string;
    viewDispute: string;
    startDispute: string;
    rentalItemFallback: string;
    rentalPeriod: (start: string, end: string) => string;
    statusPendingCheckin: string;
    statusActive: string;
    statusOverdue: string;
    statusBooking: string;
    scanCheckIn: string;
    scanReturn: string;
    scanCheckInBody: string;
    scanReturnBody: string;
    scanQrCode: string;
    pickupLocation: string;
    pickupLocationHostHint: string;
    pickupLocationRenterHint: string;
    openInMaps: string;
    contactlessAccess: string;
    contactlessBody: string;
    contactlessRenterHint: string;
    contactlessHostHint: string;
    roundTripDelivery: string;
    roundTripDeliveryBody: string;
    roundTripDeliveryFee: (amount: string) => string;
    dropOff: string;
    security: string;
    securityBody: string;
    pickupPin: string;
    returnPin: string;
    pinShareHint: string;
    askHostForPin: (stage: string) => string;
    pinStagePickup: string;
    pinStageReturn: string;
    depositProtection: string;
    depositProtectionBody: string;
    ownerContact: string;
    renterContact: string;
    hostFallback: string;
    renterFallback: string;
    verifiedOnEvorios: string;
    tapToViewProfile: string;
    message: string;
    call: string;
    phoneSharedAfterCheckin: string;
    close: string;
    beforeCheckIn: string;
    inspectItem: string;
    takePhotos: string;
    reviewReturnDate: string;
    askOwner: string;
    alreadyConfirmedPickup: string;
    pickupConfirmed: string;
    alreadyConfirmedReturn: string;
    returnConfirmed: string;
    disputeEvidence: string;
    disputeWindowLeft: (timeLeft: string) => string;
    countdownRunning: string;
    depositFrozen: string;
    disputeOpened: string;
    addPhoto: string;
    evidence: string;
    visibleToBoth: string;
  };
  rentalCard: {
    noShow: string;
    overdue: string;
    inDispute: string;
    renting: string;
    hosting: string;
    total: (amount: number) => string;
    inclDelivery: (fee: number) => string;
    stripe: string;
    escalated: string;
    returnsIn: (countdown: string) => string;
    overdueTimer: (overdue: string) => string;
    returnNow: string;
    extendBooking: string;
    requestReturn: string;
    runningLate: string;
    markNoShow: string;
    markNoShowHint: string;
    submitEvidence: string;
    leaveReview: string;
    reviewHelpsTrust: string;
    seeReview: string;
    rentAgain: string;
    markedAsNoShow: string;
  };
  notifications: {
    title: string;
    backAria: string;
    filtersAria: string;
    modeRenting: string;
    modeHosting: string;
    tabAll: string;
    tabBookings: string;
    tabMessages: string;
    sectionAll: string;
    sectionBookings: string;
    sectionMessages: string;
    checkForUpdates: string;
    checking: string;
    updateFound: string;
    latestVersionPwa: string;
    noUpdateWaiting: string;
    updatesUnavailable: string;
    demoUpdateAdded: string;
    demoShowUpdate: string;
    pushTitle: string;
    pushBody: string;
    enabling: string;
    enabled: string;
    enable: string;
    messagesSection: string;
    inbox: string;
    loading: string;
    appUpdates: string;
    markAsRead: string;
    notification: string;
    modeFooter: string;
    empty: {
      rent: {
        all: { title: string; body: string };
        bookings: { title: string; body: string; hint: string };
        messages: { title: string; body: string };
      };
      earn: {
        all: { title: string; body: string };
        bookings: { title: string; body: string; hint: string };
        messages: { title: string; body: string };
      };
    };
    previews: {
      rent: {
        yourBookings: { title: string; description: string };
        pickupReturn: { title: string; description: string };
        ownerMessages: { title: string; description: string };
        yourRequests: { title: string; description: string };
      };
      earn: {
        bookingRequests: { title: string; description: string };
        pickupReturn: { title: string; description: string };
        renterMessages: { title: string; description: string };
        listingEarnings: { title: string; description: string };
      };
    };
    prefs: {
      title: string;
      hint: string;
      bookings: string;
      bookingsHint: string;
      messages: string;
      messagesHint: string;
      newGaragesNearby: string;
      newGaragesNearbyHint: string;
      openGarageDays: string;
      openGarageDaysHint: string;
      savedListings: string;
      savedListingsHint: string;
      agentTips: (mascot: string) => string;
      agentTipsHint: string;
      garagesYouFollow: string;
      newListings: string;
      openGarageDay: string;
      pushFooter: string;
    };
  };
  faq: {
    panel: {
      searchPlaceholder: string;
      searchAria: string;
      noMatchesTitle: string;
      noMatchesBody: (mascot: string) => string;
      askAboutQuery: (mascot: string) => string;
      askDefault: (mascot: string) => string;
    };
    sections: Record<FaqSectionId, string>;
    items: Record<FaqItemId, { q: string; a: string }>;
  };
  favorites: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    browseCta: string;
    listingFallback: string;
    removeAria: (title: string) => string;
    ratePerDay: (rate: string) => string;
  };
  signInPrompt: {
    cta: string;
  };
  peerChat: {
    title: string;
    tip: (mascotHandle: string) => string;
    empty: string;
    placeholder: string;
    listingChatFallback: string;
    listingChatSubtitle: string;
  };
  onboarding: OnboardingMessages;
};
