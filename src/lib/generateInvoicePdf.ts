import { jsPDF } from "jspdf";
import type { InvoiceLabels } from "@/components/InvoiceDocument";
import { loadInvoiceFonts } from "@/lib/invoicePdfFonts";
import type { OrderReceipt } from "@/types/order";

const PRIMARY: [number, number, number] = [45, 106, 79];
const MUTED: [number, number, number] = [107, 114, 128];
const TEXT: [number, number, number] = [26, 46, 34];
const BORDER: [number, number, number] = [226, 232, 224];

async function loadLogoDataUrl(logoSrc: string): Promise<string | null> {
  try {
    const res = await fetch(logoSrc);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function registerFonts(doc: jsPDF, fonts: { regular: string; bold: string }) {
  doc.addFileToVFS("HindSiliguri-Regular.ttf", fonts.regular);
  doc.addFileToVFS("HindSiliguri-Bold.ttf", fonts.bold);
  doc.addFont("HindSiliguri-Regular.ttf", "HindSiliguri", "normal");
  doc.addFont("HindSiliguri-Bold.ttf", "HindSiliguri", "bold");
}

export async function downloadInvoicePdf(
  receipt: OrderReceipt,
  labels: InvoiceLabels,
  formatDate: (iso: string) => string,
  formatMoney: (n: number) => string,
  logoSrc?: string,
): Promise<void> {
  const fonts = await loadInvoiceFonts();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  registerFonts(doc, fonts);

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  const setNormal = (size: number) => {
    doc.setFont("HindSiliguri", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...TEXT);
  };

  const setBold = (size: number, color: [number, number, number] = TEXT) => {
    doc.setFont("HindSiliguri", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const setMuted = (size: number) => {
    doc.setFont("HindSiliguri", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...MUTED);
  };

  const hr = () => {
    doc.setDrawColor(...BORDER);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  const logo = logoSrc ? await loadLogoDataUrl(logoSrc) : null;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", margin, y, 14, 14);
    } catch {
      /* skip logo if unsupported */
    }
  }

  const brandX = logo ? margin + 18 : margin;
  setBold(14, PRIMARY);
  doc.text(labels.brand, brandX, y + 5);
  setMuted(8);
  doc.text(labels.tagline, brandX, y + 10);
  doc.text(labels.phone, brandX, y + 14);

  setMuted(8);
  doc.text(labels.invoice, pageW - margin, y + 4, { align: "right" });
  setBold(10);
  doc.text(receipt.orderRef, pageW - margin, y + 9, { align: "right" });

  y += 22;
  hr();

  setMuted(7);
  doc.text(labels.orderRef, margin, y);
  doc.text(labels.date, pageW / 2 + 4, y);
  y += 4;
  setBold(9);
  doc.text(receipt.orderRef, margin, y);
  setNormal(9);
  doc.text(formatDate(receipt.createdAt), pageW / 2 + 4, y);
  y += 10;

  const boxStart = y;
  const boxPad = 3;
  const customerLines: string[] = [
    labels.customer,
    receipt.customer.name,
    receipt.customer.mobile,
    ...(receipt.customer.email ? [receipt.customer.email] : []),
    ...[
      [
        receipt.customer.districtLabel,
        receipt.customer.upazilaLabel || receipt.customer.upazila,
      ]
        .filter(Boolean)
        .join(" · "),
      receipt.customer.address,
      `${labels.delivery}: ${receipt.deliveryLabel}`,
    ].filter(Boolean),
  ];
  const boxHeight = customerLines.length * 4.8 + 8;
  doc.setFillColor(243, 245, 240);
  doc.roundedRect(margin, boxStart, contentW, boxHeight, 2, 2, "F");

  y = boxStart + 5;
  setMuted(7);
  doc.text(labels.customer, margin + boxPad, y);
  y += 5;
  setBold(9);
  doc.text(receipt.customer.name, margin + boxPad, y);
  y += 5;
  setNormal(9);
  setMuted(9);
  doc.text(receipt.customer.mobile, margin + boxPad, y);
  y += 4.5;
  if (receipt.customer.email) {
    doc.text(receipt.customer.email, margin + boxPad, y);
    y += 4.5;
  }
  const location = [
    receipt.customer.districtLabel,
    receipt.customer.upazilaLabel || receipt.customer.upazila,
  ]
    .filter(Boolean)
    .join(" · ");
  if (location) {
    doc.text(location, margin + boxPad, y);
    y += 4.5;
  }
  doc.text(receipt.customer.address, margin + boxPad, y);
  y += 5;
  setBold(9, TEXT);
  doc.text(`${labels.delivery}: ${receipt.deliveryLabel}`, margin + boxPad, y);
  y = boxStart + boxHeight + 6;

  setMuted(7);
  doc.text(labels.items, margin, y);
  y += 5;

  const colQty = pageW - margin - 52;
  const colKg = pageW - margin - 36;
  const colTotal = pageW - margin;

  setMuted(7);
  doc.text(labels.product, margin, y);
  doc.text(labels.qty, colQty, y, { align: "right" });
  doc.text(labels.perKg, colKg, y, { align: "right" });
  doc.text(labels.lineTotal, colTotal, y, { align: "right" });
  y += 3;
  hr();

  for (const item of receipt.items) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    setBold(9);
    doc.text(item.name, margin, y);
    setNormal(9);
    doc.text(String(item.qty), colQty, y, { align: "right" });
    doc.text(formatMoney(item.pricePerKg), colKg, y, { align: "right" });
    setBold(9);
    doc.text(formatMoney(item.lineTotal), colTotal, y, { align: "right" });
    y += 4;
    setMuted(7);
    doc.text(`${item.qty} × ${item.pkg} ${labels.kg}`, margin, y);
    y += 7;
    doc.setDrawColor(...BORDER);
    doc.line(margin, y - 2, pageW - margin, y - 2);
  }

  y += 4;
  doc.setLineDashPattern([1, 1], 0);
  hr();
  doc.setLineDashPattern([], 0);

  const totalRow = (label: string, value: string, bold = false) => {
    if (bold) {
      setBold(11);
      doc.text(label, margin, y);
      doc.setTextColor(...PRIMARY);
      doc.text(value, colTotal, y, { align: "right" });
      doc.setTextColor(...TEXT);
    } else {
      setMuted(9);
      doc.text(label, margin, y);
      setNormal(9);
      doc.text(value, colTotal, y, { align: "right" });
    }
    y += 6;
  };

  totalRow(labels.subtotal, formatMoney(receipt.subtotal));
  totalRow(labels.shipping, formatMoney(receipt.shipping));
  totalRow(labels.total, formatMoney(receipt.total), true);
  y += 2;
  setMuted(8);
  doc.text(labels.cod, pageW / 2, y, { align: "center" });

  doc.save(`Amerbari-Invoice-${receipt.orderRef}.pdf`);
}
