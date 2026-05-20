import { jsPDF } from "jspdf";
import type { OrderReceipt } from "@/types/order";

function formatMoney(n: number): string {
  return `Tk ${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

export function downloadInvoicePdf(receipt: OrderReceipt): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  const line = (text: string, size = 10, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = wrapText(doc, text, contentW);
    for (const row of lines) {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(row, margin, y);
      y += size * 0.45 + 3;
    }
  };

  const row = (left: string, right: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(10);
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(left, margin, y);
    doc.text(right, pageW - margin, y, { align: "right" });
    y += 6;
  };

  doc.setTextColor(34, 85, 45);
  line("Amerbari (ammerbari.com)", 18, "bold");
  doc.setTextColor(0, 0, 0);
  line("Rajshahi mangoes — pre-order invoice", 10);
  line("Phone: +880 1970163903", 9);
  y += 2;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  line(`Invoice: ${receipt.orderRef}`, 12, "bold");
  line(`Date: ${formatDate(receipt.createdAt)}`, 10);
  y += 4;

  line("Customer", 11, "bold");
  line(receipt.customer.name, 10);
  line(`Mobile: ${receipt.customer.mobile}`, 10);
  if (receipt.customer.email) line(`Email: ${receipt.customer.email}`, 10);
  const location = [
    receipt.customer.districtLabel,
    receipt.customer.upazilaLabel || receipt.customer.upazila,
  ]
    .filter(Boolean)
    .join(" · ");
  if (location) line(location, 10);
  line(receipt.customer.address, 10);
  line(`Delivery: ${receipt.deliveryLabel}`, 10);
  y += 4;

  doc.line(margin, y, pageW - margin, y);
  y += 8;

  line("Order items", 11, "bold");
  y += 2;

  for (const item of receipt.items) {
    const label = item.nameEn ?? item.name;
    const detail = `${item.qty} x ${item.pkg} kg @ ${formatMoney(item.pricePerKg)}/kg`;
    row(label, formatMoney(item.lineTotal));
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(detail, margin + 2, y);
    doc.setTextColor(0, 0, 0);
    y += 8;
  }

  y += 2;
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  row("Subtotal (mangoes)", formatMoney(receipt.subtotal));
  row("Delivery charge", formatMoney(receipt.shipping));
  row("Grand total", formatMoney(receipt.total), true);
  y += 4;
  line("Payment: Cash on delivery", 9);
  line("Thank you for your pre-order. We will call to confirm.", 9);

  doc.save(`Amerbari-Invoice-${receipt.orderRef}.pdf`);
}
