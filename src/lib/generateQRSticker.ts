import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export type QRStickerListing = {
  id: string;
  title: string;
  qrUrl: string;
};

/** US Letter sheet — 2"×2" cells, 3×4 grid (up to 12 QRs). */
export type GeneratedQrPdf = {
  blob: Blob;
  objectUrl: string;
  filename: string;
};

async function renderQrStickerPdf(listings: QRStickerListing[]): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  const cols = 3;
  const labelW = 2.0;
  const labelH = 2.0;
  const marginLeft = 1.25;
  const marginTop = 0.5;
  const gapH = 0.19;
  const gapV = 0.0;

  const count = Math.min(listings.length, 12);

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = marginLeft + col * (labelW + gapH);
    const y = marginTop + row * (labelH + gapV);
    const listing = listings[i];

    const qrDataUrl = await QRCode.toDataURL(listing.qrUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#0D5C3A", light: "#FFFFFF" },
    });

    doc.addImage(qrDataUrl, "PNG", x + 0.1, y + 0.15, 1.1, 1.1);

    doc.setFillColor(13, 92, 58);
    doc.circle(x + 1.75, y + 0.35, 0.18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("R", x + 1.72, y + 0.38);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const title =
      listing.title.length > 22
        ? `${listing.title.substring(0, 22)}...`
        : listing.title;
    doc.text(title, x + 0.1, y + 1.45);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(13, 92, 58);
    doc.text("AllByRent", x + 0.1, y + 1.62);

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(6);
    doc.text(`#${listing.id.substring(0, 8).toUpperCase()}`, x + 0.1, y + 1.78);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.01);
    doc.rect(x, y, labelW, labelH);
  }

  return doc;
}

export async function generateQRStickerPdf(
  listings: QRStickerListing[],
  options?: { filename?: string },
): Promise<GeneratedQrPdf | null> {
  if (listings.length === 0) return null;
  const doc = await renderQrStickerPdf(listings);
  const blob = doc.output("blob") as Blob;
  const objectUrl = URL.createObjectURL(blob);
  const filename = options?.filename ?? "AllByRent-QR-Stickers.pdf";
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
