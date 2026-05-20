import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFPage, type PDFFont, type RGB } from "pdf-lib";
import type { InvoiceLabels } from "@/components/InvoiceDocument";
import { loadInvoiceFontBytes } from "@/lib/invoicePdfFonts";
import type { OrderReceipt } from "@/types/order";

const PRIMARY = rgb(45 / 255, 106 / 255, 79 / 255);
const MUTED = rgb(107 / 255, 114 / 255, 128 / 255);
const TEXT = rgb(26 / 255, 46 / 255, 34 / 255);
const BORDER = rgb(226 / 255, 232 / 255, 224 / 255);
const BOX_BG = rgb(243 / 255, 245 / 255, 240 / 255);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;

type Fonts = { regular: PDFFont; bold: PDFFont };

function lineGap(size: number) {
  return size * 1.45;
}

function drawRight(page: PDFPage, text: string, xRight: number, y: number, size: number, font: PDFFont, color: RGB) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

function ensureSpace(ctx: { page: PDFPage; y: number; doc: PDFDocument; fonts: Fonts }, needed: number) {
  if (ctx.y - needed < MARGIN) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - MARGIN;
  }
}

export async function downloadInvoicePdf(
  receipt: OrderReceipt,
  labels: InvoiceLabels,
  formatDate: (iso: string) => string,
  formatMoney: (n: number) => string,
  logoSrc?: string,
): Promise<void> {
  const fontBytes = await loadInvoiceFontBytes();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fonts: Fonts = {
    regular: await doc.embedFont(fontBytes.regular),
    bold: await doc.embedFont(fontBytes.bold),
  };

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const contentW = PAGE_W - MARGIN * 2;

  if (logoSrc) {
    try {
      const logoRes = await fetch(logoSrc);
      if (logoRes.ok) {
        const logoBytes = await logoRes.arrayBuffer();
        const isPng = logoSrc.toLowerCase().includes(".png");
        const img = isPng ? await doc.embedPng(logoBytes) : await doc.embedJpg(logoBytes);
        const dim = img.scale(0.12);
        page.drawImage(img, {
          x: MARGIN,
          y: y - dim.height,
          width: dim.width,
          height: dim.height,
        });
      }
    } catch {
      /* optional logo */
    }
  }

  const brandX = MARGIN + 52;
  page.drawText(labels.brand, { x: brandX, y: y - 14, size: 16, font: fonts.bold, color: PRIMARY });
  page.drawText(labels.tagline, { x: brandX, y: y - 28, size: 8, font: fonts.regular, color: MUTED });
  page.drawText(labels.phone, { x: brandX, y: y - 40, size: 8, font: fonts.regular, color: MUTED });

  drawRight(page, labels.invoice, PAGE_W - MARGIN, y - 10, 8, fonts.regular, MUTED);
  drawRight(page, receipt.orderRef, PAGE_W - MARGIN, y - 24, 11, fonts.bold, TEXT);

  y -= 56;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: BORDER });
  y -= 18;

  page.drawText(labels.orderRef, { x: MARGIN, y, size: 7, font: fonts.regular, color: MUTED });
  page.drawText(labels.date, { x: PAGE_W / 2, y, size: 7, font: fonts.regular, color: MUTED });
  y -= 12;
  page.drawText(receipt.orderRef, { x: MARGIN, y, size: 10, font: fonts.bold, color: TEXT });
  page.drawText(formatDate(receipt.createdAt), { x: PAGE_W / 2, y, size: 10, font: fonts.regular, color: TEXT });
  y -= 22;

  const customerRows = [
    { text: labels.customer, font: fonts.regular, size: 7, color: MUTED },
    { text: receipt.customer.name, font: fonts.bold, size: 10, color: TEXT },
    { text: receipt.customer.mobile, font: fonts.regular, size: 9, color: MUTED },
    ...(receipt.customer.email
      ? [{ text: receipt.customer.email, font: fonts.regular, size: 9, color: MUTED }]
      : []),
  ];
  const location = [
    receipt.customer.districtLabel,
    receipt.customer.upazilaLabel || receipt.customer.upazila,
  ]
    .filter(Boolean)
    .join(" · ");
  if (location) customerRows.push({ text: location, font: fonts.regular, size: 9, color: MUTED });
  customerRows.push(
    { text: receipt.customer.address, font: fonts.regular, size: 9, color: MUTED },
    { text: `${labels.delivery}: ${receipt.deliveryLabel}`, font: fonts.bold, size: 9, color: TEXT },
  );

  const boxHeight = customerRows.length * 14 + 16;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: contentW,
    height: boxHeight,
    color: BOX_BG,
    borderColor: BORDER,
    borderWidth: 0.5,
  });

  let cy = y - 12;
  for (const row of customerRows) {
    page.drawText(row.text, { x: MARGIN + 10, y: cy, size: row.size, font: row.font, color: row.color });
    cy -= row.size + 6;
  }
  y -= boxHeight + 16;

  page.drawText(labels.items, { x: MARGIN, y, size: 7, font: fonts.regular, color: MUTED });
  y -= 14;

  const colQty = PAGE_W - MARGIN - 120;
  const colKg = PAGE_W - MARGIN - 72;
  const colTotal = PAGE_W - MARGIN;

  page.drawText(labels.product, { x: MARGIN, y, size: 7, font: fonts.regular, color: MUTED });
  drawRight(page, labels.qty, colQty + 30, y, 7, fonts.regular, MUTED);
  drawRight(page, labels.perKg, colKg + 40, y, 7, fonts.regular, MUTED);
  drawRight(page, labels.lineTotal, colTotal, y, 7, fonts.regular, MUTED);
  y -= 8;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: BORDER });
  y -= 16;

  for (const item of receipt.items) {
    ensureSpace({ page, y, doc, fonts }, 50);
    if (y < MARGIN + 80) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }

    page.drawText(item.name, { x: MARGIN, y, size: 10, font: fonts.bold, color: TEXT });
    drawRight(page, String(item.qty), colQty + 30, y, 10, fonts.regular, TEXT);
    drawRight(page, formatMoney(item.pricePerKg), colKg + 40, y, 10, fonts.regular, TEXT);
    drawRight(page, formatMoney(item.lineTotal), colTotal, y, 10, fonts.bold, TEXT);
    y -= 12;
    page.drawText(`${item.qty} × ${item.pkg} ${labels.kg}`, {
      x: MARGIN,
      y,
      size: 7,
      font: fonts.regular,
      color: MUTED,
    });
    y -= 10;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: BORDER });
    y -= 12;
  }

  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: BORDER,
    dashArray: [2, 2],
  });
  y -= 18;

  const totalRow = (label: string, value: string, grand = false) => {
    const size = grand ? 12 : 9;
    const labelFont = grand ? fonts.bold : fonts.regular;
    const valueFont = grand ? fonts.bold : fonts.regular;
    const valueColor = grand ? PRIMARY : TEXT;
    page.drawText(label, { x: MARGIN, y, size, font: labelFont, color: grand ? TEXT : MUTED });
    drawRight(page, value, colTotal, y, size, valueFont, valueColor);
    y -= grand ? 18 : 14;
  };

  totalRow(labels.subtotal, formatMoney(receipt.subtotal));
  totalRow(labels.shipping, formatMoney(receipt.shipping));
  totalRow(labels.total, formatMoney(receipt.total), true);

  const codW = fonts.regular.widthOfTextAtSize(labels.cod, 8);
  page.drawText(labels.cod, {
    x: (PAGE_W - codW) / 2,
    y: y - 4,
    size: 8,
    font: fonts.regular,
    color: MUTED,
  });

  const bytes = await doc.save();
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Amerbari-Invoice-${receipt.orderRef}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
