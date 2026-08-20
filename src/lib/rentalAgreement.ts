/**
 * Versioned platform rental agreement + clickwrap e-accept records.
 * Not legal advice; ESIGN/UETA-style acceptance is common in the US but not magic.
 */

export const RENTAL_AGREEMENT_VERSION = "2026-08-19.v1";

export type RentalAgreementParty = "renter" | "host";

export type RentalAgreementSignature = {
  party: RentalAgreementParty;
  userId: string;
  displayName: string;
  signedAt: string;
  termsVersion: string;
};

export type RentalAgreementCommercialSnapshot = {
  listingId?: string;
  bookingId: string;
  itemTitle: string;
  category?: string;
  startDate: string;
  endDate: string;
  totalUsd: number;
  rentalSubtotalUsd?: number;
  depositAmountCents?: number;
  fulfillmentMethod?: string;
  insuranceRequired?: boolean;
  insuranceActiveUntil?: string;
  cancellationSummary?: string;
  lateReturnSummary?: string;
  noShowSummary?: string;
  /** Vehicle / high-value specifics when present. */
  vehicle?: {
    maxDeductible?: string;
    minLiability?: string;
    includedMilesPerDay?: string;
    overagePerMile?: string;
    tollHoldAmountCents?: number;
    namedDriverNote?: string;
    extras?: string[];
    /** May leave listing home territory (state/country). */
    travelOutsideHomeArea?: "allowed" | "forbidden";
    /** Frozen home admin boundary label/kind at accept time. */
    homeTerritoryKind?: "state" | "country";
    homeTerritoryLabel?: string;
    homeTerritoryCountryCode?: string;
    homeTerritoryRegionCode?: string;
    /** Fuel policy when powered listing (default full-to-full). */
    fuelPolicy?: "full_to_full" | "prepaid_full_tank";
    fuelType?: string;
    tracksDef?: boolean;
    fuelMissingFeeCents?: number;
  };
  /** Category trust snapshot (operator / boat / drone / car seat / real estate / P1). */
  trust?: {
    operatorCertKind?: "forklift" | "crane" | "excavator" | "general_heavy";
    operatorCertRequired?: boolean;
    boaterLicenseRequired?: boolean;
    droneCertRequired?: boolean;
    carSeatSanitizationRequired?: boolean;
    houseRules?: string;
    cleaningFeeUsd?: number;
    minAgeRequired?: number;
    uscgSafetyKitRequired?: boolean;
    kitInventoryRequired?: boolean;
    kitInventoryChecklist?: string;
    liabilityWaiverRequired?: boolean;
    helmetPolicy?: string;
    lockPolicy?: string;
    setupTeardownFeeUsd?: number;
    powerRequirement?: string;
    hitchClass?: string;
    brakeController?: string;
    hinNumber?: string;
    boatRegistration?: string;
    rvDumpStation?: string;
    rvPropane?: string;
    rvOccupancy?: string;
    /** P2 Office / Music */
    dataWipeRequired?: boolean;
    hostDataWipeStatus?: string;
    paCableStandInventoryRequired?: boolean;
    paCableStandInventory?: string;
  };
};

export type RentalAgreementRecord = {
  termsVersion: string;
  /** Locale used when the snapshot was first created. */
  locale: string;
  /** Frozen commercial terms at first signature (usually renter booking). */
  commercial: RentalAgreementCommercialSnapshot;
  /** Plain-text terms body snapshot (versioned template at accept time). */
  termsText: string;
  /** Optional richer summary lines (vehicles / high-value). */
  enrichedSummaryLines?: string[];
  renterSignature?: RentalAgreementSignature | null;
  hostSignature?: RentalAgreementSignature | null;
};

const TERMS_BY_LOCALE: Record<string, string> = {
  en: `Evorios Platform Rental Terms (version ${RENTAL_AGREEMENT_VERSION})

1. Parties. These terms apply between the Host (item owner) and the Renter for this booking on Evorios. Evorios is a marketplace platform, not the owner of the item and not a party to the rental of the item itself, except as stated in the platform Terms of Service.

2. Booking record. By tapping Agree / Sign, you electronically accept these rental terms and the commercial snapshot shown for this booking (dates, price, deposit, fulfillment, and any vehicle or high-value specifics). Your display name, user id, timestamp, booking id, and terms version are stored as a durable record.

3. Condition & care. Renter will use the item reasonably, return it by the agreed end time in substantially the same condition (normal wear excepted), and follow any listing rules (mileage, fuel, cleaning, accessories).

4. Payment & deposit. Amounts authorized or charged through Evorios (rental, fees, deposit holds, optional toll holds) follow the in-app checkout and cancellation policy. Deposit holds are not insurance.

5. Insurance. Where the listing requires insurance proof, Renter’s coverage is primary. Uploading proof and host review do not create coverage. Evorios does not insure the item, trip, or parties.

6. Handoff. Keys, PINs, lockbox codes, and access details unlock only after required checks for this listing (including both parties’ acceptance of these terms). Do not share access codes off-platform.

7. Disputes. Document condition with photos at pickup and return. Use in-app dispute tools for damage, missing parts, or condition issues. Platform tools do not replace insurance claims or court process.

8. Not legal advice. This clickwrap record is meant to make expectations clearer than chat alone. It is not a guarantee of any legal outcome, does not replace insurance, wet-ink contracts, notarization, or advice from a licensed attorney in your jurisdiction. US ESIGN/UETA-style electronic acceptance is widely used but enforceability depends on facts and local law.

9. Platform Terms. The Evorios Terms of Service, Privacy Policy, and Refund Policy also apply to your use of the platform.`,

  cs: `Podmínky pronájmu platformy Evorios (verze ${RENTAL_AGREEMENT_VERSION})

1. Strany. Tyto podmínky platí mezi Hostitelem (vlastníkem) a Nájemcem pro tuto rezervaci na Evorios. Evorios je tržiště, nikoli vlastník věci.

2. Záznam rezervace. Klepnutím na Souhlasím / Podepsat elektronicky přijímáte tyto podmínky a obchodní shrnutí rezervace. Jméno, id uživatele, čas, id rezervace a verze podmínek se uloží jako trvalý záznam.

3. Stav a péče. Nájemce věc používá přiměřeně a vrátí ji v dohodnutém čase v podstatně stejném stavu (běžné opotřebení vyjímaje).

4. Platba a kauce. Částky přes Evorios se řídí checkoutem a storno pravidly. Kauce není pojištění.

5. Pojištění. Kde je vyžadován důkaz pojištění, primární je pojištění nájemce. Evorios nepojišťuje věc ani cesty.

6. Předání. Kódy a klíče se odemknou až po povinných kontrolách včetně přijetí těchto podmínek oběma stranami.

7. Spory. Dokumentujte stav fotkami. Použijte spory v aplikaci. Nástroje platformy nenahrazují pojištění ani soud.

8. Nejde o právní radu. Tento elektronický záznam je přehlednější než jen chat. Nenahrazuje pojištění, papírovou smlouvu, notáře ani radu právníka. Platnost závisí na okolnostech a místním právu.

9. Platí také Podmínky služby, Ochrana soukromí a Storno politika Evorios.`,

  es: `Términos de alquiler de la plataforma Evorios (versión ${RENTAL_AGREEMENT_VERSION})

1. Partes. Estos términos aplican entre el Anfitrión (propietario) y el Inquilino para esta reserva en Evorios. Evorios es un marketplace, no el dueño del artículo.

2. Registro de la reserva. Al tocar Aceptar / Firmar, aceptas electrónicamente estos términos y el resumen comercial de la reserva. Se guardan nombre, id de usuario, hora, id de reserva y versión de los términos.

3. Estado y cuidado. El inquilino usará el artículo de forma razonable y lo devolverá a tiempo en condición sustancialmente igual (salvo desgaste normal).

4. Pago y fianza. Los importes en Evorios siguen el checkout y la política de cancelación. La fianza no es un seguro.

5. Seguro. Si se exige comprobante, el seguro del inquilino es primario. Evorios no asegura el artículo ni el viaje.

6. Entrega. PIN, llaves y códigos se desbloquean solo tras las comprobaciones requeridas, incluida la aceptación de ambas partes.

7. Disputas. Documenta con fotos. Usa disputas en la app. No sustituye seguros ni procesos legales.

8. No es asesoría legal. Este registro digital es más claro que solo el chat. No garantiza resultados legales ni sustituye seguro, firma en papel, notaría o un abogado. La validez depende de los hechos y la ley local.

9. También aplican los Términos, Privacidad y Reembolsos de Evorios.`,
};

export function getRentalAgreementTermsText(locale?: string): string {
  const key = (locale ?? "en").slice(0, 2).toLowerCase();
  return TERMS_BY_LOCALE[key] ?? TERMS_BY_LOCALE.en;
}

export function buildEnrichedSummaryLines(input: {
  category?: string;
  vehicle?: RentalAgreementCommercialSnapshot["vehicle"];
  trust?: RentalAgreementCommercialSnapshot["trust"];
  insuranceRequired?: boolean;
  insuranceActiveUntil?: string;
  cancellationSummary?: string;
  lateReturnSummary?: string;
  noShowSummary?: string;
}): string[] {
  const lines: string[] = [];
  const cat = (input.category ?? "").trim();
  const trust = input.trust;
  const isRich =
    cat === "Vehicles" ||
    cat === "Real Estate" ||
    cat === "Heavy Equipment" ||
    cat === "Construction" ||
    cat === "Boats & Water" ||
    cat === "Baby & Kids" ||
    cat === "Photo & Video" ||
    cat === "Electronics & Tech" ||
    cat === "Gym & Fitness" ||
    cat === "Sports & Recreation" ||
    cat === "Outdoor & Camping" ||
    cat === "Bikes & Scooters" ||
    cat === "Party & Events" ||
    cat === "Office & Business" ||
    cat === "Music & Audio" ||
    Boolean(trust?.operatorCertRequired) ||
    Boolean(trust?.boaterLicenseRequired) ||
    Boolean(trust?.droneCertRequired) ||
    Boolean(trust?.houseRules) ||
    Boolean(trust?.liabilityWaiverRequired) ||
    Boolean(trust?.uscgSafetyKitRequired) ||
    Boolean(trust?.dataWipeRequired) ||
    Boolean(trust?.paCableStandInventoryRequired) ||
    /high.?value|boat|heavy|drone/i.test(cat);

  if (!isRich && !input.vehicle) {
    if (input.cancellationSummary) lines.push(input.cancellationSummary);
    if (input.lateReturnSummary) lines.push(`Late return: ${input.lateReturnSummary}.`);
    if (input.noShowSummary) lines.push(input.noShowSummary);
    return lines;
  }

  if (input.cancellationSummary) lines.push(input.cancellationSummary);
  if (input.lateReturnSummary) lines.push(`Late return: ${input.lateReturnSummary}.`);
  if (input.noShowSummary) lines.push(input.noShowSummary);

  if (input.insuranceRequired) {
    lines.push(
      input.insuranceActiveUntil
        ? `Insurance proof required — coverage active through ${input.insuranceActiveUntil}.`
        : "Insurance proof required before handoff.",
    );
  }
  if (trust?.operatorCertRequired) {
    const kind = trust.operatorCertKind ?? "general_heavy";
    const label =
      kind === "forklift"
        ? "forklift operator credential"
        : kind === "crane"
          ? "crane operator credential"
          : kind === "excavator"
            ? "excavator operator credential"
            : "heavy-equipment operator credential";
    lines.push(`Operator credential required: ${label} (attestation + document).`);
  }
  if (trust?.boaterLicenseRequired) {
    lines.push(
      "Boater / PWC / captain license attestation and document required before handoff.",
    );
  }
  if (trust?.droneCertRequired) {
    lines.push(
      "FAA Part 107 and/or Remote ID attestation required (optional certificate upload).",
    );
  }
  if (trust?.carSeatSanitizationRequired) {
    lines.push(
      "Car seat: host confirmed non-expired / recall-checked unit; renter sanitization acknowledgment required.",
    );
  }
  if (trust?.houseRules?.trim()) {
    lines.push(`House rules: ${trust.houseRules.trim()}`);
  }
  if (trust?.cleaningFeeUsd != null && trust.cleaningFeeUsd > 0) {
    lines.push(`Cleaning fee: $${trust.cleaningFeeUsd.toFixed(2)}.`);
  }
  if (trust?.minAgeRequired) {
    lines.push(`Minimum operator / driver age: ${trust.minAgeRequired}.`);
  }
  if (trust?.hinNumber?.trim()) {
    lines.push(`Hull Identification Number (HIN): ${trust.hinNumber.trim()}.`);
  }
  if (trust?.boatRegistration?.trim()) {
    lines.push(`Vessel registration: ${trust.boatRegistration.trim()}.`);
  }
  if (trust?.uscgSafetyKitRequired) {
    lines.push(
      "USCG-style safety kit required on board (PFDs, fire extinguisher, visual distress, sound signal as applicable). Renter acknowledged at booking.",
    );
  }
  if (trust?.kitInventoryRequired) {
    lines.push(
      trust.kitInventoryChecklist?.trim()
        ? `Kit inventory: ${trust.kitInventoryChecklist.trim()}`
        : "Kit inventory checklist acknowledged at booking.",
    );
  }
  if (trust?.liabilityWaiverRequired) {
    lines.push(
      "Liability waiver: renter assumes risk of injury from gym / high-risk sports or outdoor gear use; Evorios is not the equipment owner.",
    );
  }
  if (trust?.helmetPolicy || trust?.lockPolicy) {
    lines.push(
      `Helmet policy: ${trust.helmetPolicy || "n/a"}; lock policy: ${trust.lockPolicy || "n/a"}.`,
    );
  }
  if (trust?.dataWipeRequired) {
    const wipeStatus = trust.hostDataWipeStatus?.trim();
    lines.push(
      wipeStatus
        ? `Data wipe: device has storage; host status "${wipeStatus}"; renter acknowledged wipe / no-retain duties at booking.`
        : "Data wipe: device has onboard storage; renter acknowledged wipe / no-retain duties at booking.",
    );
  }
  if (trust?.paCableStandInventoryRequired) {
    lines.push(
      trust.paCableStandInventory?.trim()
        ? `PA cable / stand inventory: ${trust.paCableStandInventory.trim()}`
        : "PA cable / stand inventory acknowledged at booking.",
    );
  }
  if (trust?.setupTeardownFeeUsd != null && trust.setupTeardownFeeUsd > 0) {
    lines.push(`Setup / teardown fee: $${trust.setupTeardownFeeUsd.toFixed(2)}.`);
  }
  if (trust?.powerRequirement?.trim()) {
    lines.push(`Power requirement: ${trust.powerRequirement.trim()}.`);
  }
  if (trust?.hitchClass || trust?.brakeController) {
    lines.push(
      `Trailer hitch: ${trust.hitchClass || "n/a"}; brake controller: ${trust.brakeController || "n/a"}.`,
    );
  }
  if (trust?.rvOccupancy || trust?.rvDumpStation || trust?.rvPropane) {
    lines.push(
      `RV occupancy ${trust.rvOccupancy || "n/a"}; dump: ${trust.rvDumpStation || "n/a"}; propane: ${trust.rvPropane || "n/a"}.`,
    );
  }
  if (input.vehicle?.maxDeductible) {
    lines.push(`Host max deductible / card hold band: ${input.vehicle.maxDeductible}.`);
  }
  if (input.vehicle?.minLiability) {
    lines.push(`Minimum liability required: ${input.vehicle.minLiability}.`);
  }
  if (input.vehicle?.includedMilesPerDay || input.vehicle?.overagePerMile) {
    const miles = input.vehicle.includedMilesPerDay
      ? `${input.vehicle.includedMilesPerDay} included mi/day`
      : null;
    const over = input.vehicle.overagePerMile
      ? `overage ${input.vehicle.overagePerMile}/mi`
      : null;
    lines.push(`Mileage: ${[miles, over].filter(Boolean).join(" · ")}.`);
  }
  if (input.vehicle?.tollHoldAmountCents && input.vehicle.tollHoldAmountCents >= 50) {
    lines.push(
      `Optional toll hold: $${(input.vehicle.tollHoldAmountCents / 100).toFixed(2)}.`,
    );
  }
  if (input.vehicle?.namedDriverNote) {
    lines.push(input.vehicle.namedDriverNote);
  }
  if (input.vehicle?.extras?.length) {
    lines.push(`Add-ons: ${input.vehicle.extras.join(", ")}.`);
  }
  if (input.vehicle?.fuelPolicy || input.vehicle?.fuelType) {
    const fee =
      input.vehicle.fuelMissingFeeCents != null
        ? `$${(input.vehicle.fuelMissingFeeCents / 100).toFixed(0)}`
        : "$20";
    const fuelLabel = input.vehicle.fuelType ? ` (${input.vehicle.fuelType})` : "";
    if (input.vehicle.fuelPolicy === "prepaid_full_tank") {
      lines.push(
        `Fuel${fuelLabel}: prepaid full tank — levels recorded at start/return.` +
          (input.vehicle.tracksDef
            ? ` DEF tracked; ${fee} fee if returned empty without settling.`
            : ""),
      );
    } else {
      lines.push(
        `Fuel${fuelLabel}: full-to-full (return full or settle missing fuel + ${fee} fee).` +
          (input.vehicle.tracksDef ? " Diesel DEF tracked the same way." : ""),
      );
    }
  }
  if (input.vehicle?.travelOutsideHomeArea) {
    const area =
      input.vehicle.homeTerritoryLabel ||
      input.vehicle.homeTerritoryRegionCode ||
      input.vehicle.homeTerritoryCountryCode ||
      "the listing’s home state/country/region";
    const kindNote =
      input.vehicle.homeTerritoryKind === "state"
        ? "home state"
        : input.vehicle.homeTerritoryKind === "country"
          ? "home country"
          : "home state/country/region";
    lines.push(
      input.vehicle.travelOutsideHomeArea === "forbidden"
        ? `Leaving the ${kindNote} where the listing is based (${area}): forbidden.`
        : `Leaving the ${kindNote} where the listing is based (${area}): allowed.`,
    );
  }
  if (isRich && lines.length === 0) {
    lines.push("High-value / vehicle-style rental — follow listing rules and insurance requirements.");
  }
  return lines;
}

export function createRentalAgreementRecord(input: {
  commercial: RentalAgreementCommercialSnapshot;
  locale?: string;
  renterSignature?: RentalAgreementSignature | null;
  hostSignature?: RentalAgreementSignature | null;
}): RentalAgreementRecord {
  const locale = (input.locale ?? "en").slice(0, 2).toLowerCase();
  const termsText = getRentalAgreementTermsText(locale);
  const enrichedSummaryLines = buildEnrichedSummaryLines({
    category: input.commercial.category,
    vehicle: input.commercial.vehicle,
    trust: input.commercial.trust,
    insuranceRequired: input.commercial.insuranceRequired,
    insuranceActiveUntil: input.commercial.insuranceActiveUntil,
    cancellationSummary: input.commercial.cancellationSummary,
    lateReturnSummary: input.commercial.lateReturnSummary,
    noShowSummary: input.commercial.noShowSummary,
  });
  return {
    termsVersion: RENTAL_AGREEMENT_VERSION,
    locale,
    commercial: input.commercial,
    termsText,
    enrichedSummaryLines: enrichedSummaryLines.length ? enrichedSummaryLines : undefined,
    renterSignature: input.renterSignature ?? null,
    hostSignature: input.hostSignature ?? null,
  };
}

export function makeAgreementSignature(input: {
  party: RentalAgreementParty;
  userId: string;
  displayName: string;
  termsVersion?: string;
}): RentalAgreementSignature {
  const name = input.displayName.trim() || "Signed user";
  return {
    party: input.party,
    userId: input.userId,
    displayName: name,
    signedAt: new Date().toISOString(),
    termsVersion: input.termsVersion ?? RENTAL_AGREEMENT_VERSION,
  };
}

export function agreementFullySigned(
  record: RentalAgreementRecord | null | undefined,
): boolean {
  return Boolean(record?.renterSignature?.signedAt && record?.hostSignature?.signedAt);
}

export function agreementMissingParties(
  record: RentalAgreementRecord | null | undefined,
): RentalAgreementParty[] {
  const missing: RentalAgreementParty[] = [];
  if (!record?.renterSignature?.signedAt) missing.push("renter");
  if (!record?.hostSignature?.signedAt) missing.push("host");
  return missing;
}

/** Merge preferring whichever side has more complete signatures / newer host/renter stamps. */
export function mergeRentalAgreementRecords(
  a?: RentalAgreementRecord | null,
  b?: RentalAgreementRecord | null,
): RentalAgreementRecord | null {
  if (!a && !b) return null;
  if (!a) return b ?? null;
  if (!b) return a;
  return {
    ...a,
    ...b,
    commercial: a.commercial?.bookingId ? a.commercial : b.commercial,
    termsText: a.termsText?.length >= (b.termsText?.length ?? 0) ? a.termsText : b.termsText,
    termsVersion: a.termsVersion || b.termsVersion,
    locale: a.locale || b.locale,
    enrichedSummaryLines: a.enrichedSummaryLines?.length
      ? a.enrichedSummaryLines
      : b.enrichedSummaryLines,
    renterSignature: a.renterSignature?.signedAt
      ? a.renterSignature
      : b.renterSignature ?? null,
    hostSignature: a.hostSignature?.signedAt ? a.hostSignature : b.hostSignature ?? null,
  };
}

export function formatAgreementDownloadText(record: RentalAgreementRecord): string {
  const c = record.commercial;
  const lines = [
    `Evorios rental agreement · ${record.termsVersion}`,
    `Booking: ${c.bookingId}`,
    `Item: ${c.itemTitle}`,
    `Dates: ${c.startDate} → ${c.endDate}`,
    `Total: $${c.totalUsd.toFixed(2)}`,
    c.depositAmountCents != null
      ? `Deposit hold: $${(c.depositAmountCents / 100).toFixed(2)}`
      : null,
    c.fulfillmentMethod ? `Fulfillment: ${c.fulfillmentMethod}` : null,
    "",
    ...(record.enrichedSummaryLines ?? []),
    "",
    "— Signatures —",
    record.renterSignature
      ? `Renter: ${record.renterSignature.displayName} · ${record.renterSignature.userId} · ${record.renterSignature.signedAt}`
      : "Renter: (not signed)",
    record.hostSignature
      ? `Host: ${record.hostSignature.displayName} · ${record.hostSignature.userId} · ${record.hostSignature.signedAt}`
      : "Host: (not signed)",
    "",
    "— Terms snapshot —",
    record.termsText,
  ];
  return lines.filter((line) => line !== null).join("\n");
}
