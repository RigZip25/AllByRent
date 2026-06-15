import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { APP_NAME, MASCOT_NAME } from "./brand";

export type QRStickerListing = {
  id: string;
  title: string;
  qrUrl: string;
};

export type StickerPaper = "letter" | "a4";
export type StickerLayout = "sheet" | "single";

export type GeneratedQrPdf = {
  blob: Blob;
  objectUrl: string;
  filename: string;
};

function clampTitle(title: string, max: number): string {
  const trimmed = title.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.substring(0, max)}...`;
}

async function renderStickerAt(doc: jsPDF, listing: QRStickerListing, x: number, y: number, w: number, h: number) {
  const qrDataUrl = await QRCode.toDataURL(listing.qrUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#0D5C3A", light: "#FFFFFF" },
  });

  const qrSize = Math.min(w, h) * 0.55;
  doc.addImage(qrDataUrl, "PNG", x + 0.15, y + 0.2, qrSize, qrSize);

  // Rentano badge
  doc.setFillColor(13, 92, 58);
  doc.circle(x + w - 0.35, y + 0.35, 0.18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("R", x + w - 0.39, y + 0.38);

  // Instruction
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Scan to rent this item", x + 0.15, y + qrSize + 0.35);

  // Item title + branding
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(clampTitle(listing.title, 26), x + 0.15, y + h - 0.55);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(13, 92, 58);
  doc.text(`${APP_NAME} · ${MASCOT_NAME}`, x + 0.15, y + h - 0.35);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6);
  doc.text(`#${listing.id.substring(0, 8).toUpperCase()}`, x + 0.15, y + h - 0.15);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.01);
  doc.rect(x, y, w, h);
}

async function renderQrStickerPdf(listings: QRStickerListing[], options: { paper: StickerPaper; layout: StickerLayout; labelIn: number }): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: options.paper,
  });

  if (options.layout === "single") {
    const listing = listings[0];
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const w = Math.min(options.labelIn, pageW - 1);
    const h = Math.min(options.labelIn, pageH - 1.2);
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    await renderStickerAt(doc, listing, x, y, w, h);
    return doc;
  }

  // Sheet layout (best-effort; tuned for home printing).
  const labelW = options.labelIn;
  const labelH = options.labelIn;

  const cols = options.paper === "a4" ? 3 : 3;
  const max = options.paper === "a4" ? 12 : 12;

  const marginLeft = options.paper === "a4" ? 0.6 : 1.25;
  const marginTop = 0.5;
  const gapH = options.paper === "a4" ? 0.18 : 0.19;
  const gapV = 0.0;

  const count = Math.min(listings.length, max);
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = marginLeft + col * (labelW + gapH);
    const y = marginTop + row * (labelH + gapV);
    await renderStickerAt(doc, listings[i], x, y, labelW, labelH);
  }

  return doc;
}

export async function generateQRStickerPdf(
  listings: QRStickerListing[],
  options?: { filename?: string; paper?: StickerPaper; layout?: StickerLayout; labelIn?: number },
): Promise<GeneratedQrPdf | null> {
  if (listings.length === 0) return null;
  const paper: StickerPaper = options?.paper ?? "letter";
  const layout: StickerLayout = options?.layout ?? "sheet";
  const labelIn = Math.max(1.5, Math.min(3, options?.labelIn ?? 2.0));
  const doc = await renderQrStickerPdf(listings, { paper, layout, labelIn });
  const blob = doc.output("blob") as Blob;
  const objectUrl = URL.createObjectURL(blob);
  const filename = options?.filename ?? `${APP_NAME}-QR-Stickers.pdf`;
  return { blob, objectUrl, filename };
}

export async function generateQRStickerSheet(listings: QRStickerListing[]): Promise<void> {
  const generated = await generateQRStickerPdf(listings);
  if (!generated) return;
  const { objectUrl, filename } = generated;
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 15_000);
}
