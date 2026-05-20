import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, Download, Home, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import { loadOrderReceipt } from "@/lib/orderStorage";
import type { OrderReceipt } from "@/types/order";

const COPY = {
  bn: {
    title: "আপনার প্রি-অর্ডার নিশ্চিত হয়েছে",
    subtitle: "নিচে আপনার ইনভয়েস দেখুন। আমরা শীঘ্রই কনফার্মেশনের জন্য যোগাযোগ করব।",
    invoice: "ইনভয়েস",
    orderRef: "অর্ডার রেফারেন্স",
    date: "তারিখ",
    customer: "গ্রাহকের তথ্য",
    delivery: "ডেলিভারি",
    items: "অর্ডারের বিবরণ",
    subtotal: "মোট (আম)",
    shipping: "ডেলিভারি চার্জ",
    total: "সর্বমোট",
    cod: "ক্যাশ অন ডেলিভারি",
    downloadPdf: "PDF ডাউনলোড",
    print: "প্রিন্ট",
    home: "হোমপেজে ফিরে যান",
    brand: "আমের বাড়ি",
    tagline: "রাজশাহীর আম, সবার প্রিয় নাম",
    phone: "০১৯৭০১৬৩৯০৩",
    kg: "কেজি",
    qty: "পরিমাণ",
    perKg: "প্রতি কেজি",
    lineTotal: "মোট",
    generating: "PDF তৈরি হচ্ছে...",
    pdfError: "PDF তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
  },
  en: {
    title: "Your pre-order is confirmed",
    subtitle: "Your invoice is below. We will contact you shortly to confirm.",
    invoice: "Invoice",
    orderRef: "Order reference",
    date: "Date",
    customer: "Customer details",
    delivery: "Delivery",
    items: "Order details",
    subtotal: "Subtotal (mangoes)",
    shipping: "Delivery charge",
    total: "Grand total",
    cod: "Cash on delivery",
    downloadPdf: "Download PDF",
    print: "Print",
    home: "Back to home",
    brand: "Amerbari",
    tagline: "Rajshahi mangoes everyone loves",
    phone: "+880 1970163903",
    kg: "KG",
    qty: "Qty",
    perKg: "Per kg",
    lineTotal: "Line total",
    generating: "Generating PDF...",
    pdfError: "Could not generate PDF. Please try again.",
  },
} as const;

function formatOrderDate(iso: string, lang: "bn" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(n: number): string {
  return `৳${n.toLocaleString("en-IN")}`;
}

export default function OrderConfirmation() {
  const [receipt] = useState<OrderReceipt | null>(() => loadOrderReceipt());
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!receipt) {
    return <Navigate to="/" replace />;
  }

  const t = COPY[receipt.lang];

  const handleDownloadPdf = () => {
    setPdfLoading(true);
    try {
      downloadInvoicePdf(receipt);
    } catch {
      alert(t.pdfError);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl">
        <div className="no-print text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">{t.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleDownloadPdf} disabled={pdfLoading}>
              <Download className="h-4 w-4" />
              {pdfLoading ? t.generating : t.downloadPdf}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t.print}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
                {t.home}
              </Link>
            </Button>
          </div>
        </div>

        <div
          id="invoice-printable"
          className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm print:mt-0 print:border-0 print:shadow-none"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <img
                src="/amerbari-logo.png"
                alt={t.brand}
                className="h-12 w-12 rounded-lg object-contain"
              />
              <div>
                <p className="text-lg font-extrabold text-primary">{t.brand}</p>
                <p className="text-xs text-muted-foreground">{t.tagline}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.invoice}
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-foreground">{receipt.orderRef}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.orderRef}</dt>
              <dd className="font-mono font-medium">{receipt.orderRef}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.date}</dt>
              <dd>{formatOrderDate(receipt.createdAt, receipt.lang)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-muted/30 p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t.customer}</p>
            <p className="mt-2 font-semibold">{receipt.customer.name}</p>
            <p className="text-muted-foreground">{receipt.customer.mobile}</p>
            {receipt.customer.email && (
              <p className="text-muted-foreground">{receipt.customer.email}</p>
            )}
            <p className="mt-2 text-muted-foreground">
              {receipt.customer.districtLabel}
              {(receipt.customer.upazilaLabel || receipt.customer.upazila)
                ? ` · ${receipt.customer.upazilaLabel || receipt.customer.upazila}`
                : ""}
            </p>
            <p className="text-muted-foreground">{receipt.customer.address}</p>
            <p className="mt-2">
              <span className="font-semibold text-foreground">{t.delivery}: </span>
              {receipt.deliveryLabel}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t.items}</p>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-2">{receipt.lang === "bn" ? "পণ্য" : "Item"}</th>
                  <th className="pb-2 pr-2">{t.qty}</th>
                  <th className="pb-2 pr-2 hidden sm:table-cell">{t.perKg}</th>
                  <th className="pb-2 text-right">{t.lineTotal}</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-3 pr-2">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} × {item.pkg} {t.kg}
                      </p>
                    </td>
                    <td className="py-3 pr-2 tabular-nums">{item.qty}</td>
                    <td className="py-3 pr-2 hidden sm:table-cell tabular-nums">
                      {formatMoney(item.pricePerKg)}
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {formatMoney(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2 border-t border-dashed border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.subtotal}</span>
              <span className="tabular-nums font-medium">{formatMoney(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.shipping}</span>
              <span className="tabular-nums font-medium">{formatMoney(receipt.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>{t.total}</span>
              <span className="tabular-nums text-primary">{formatMoney(receipt.total)}</span>
            </div>
            <p className="pt-2 text-center text-xs text-muted-foreground">{t.cod}</p>
          </div>
        </div>

        <p className="no-print mt-6 text-center text-xs text-muted-foreground">
          {receipt.lang === "bn"
            ? "ইনভয়েসটি এই ব্রাউজার সেশনে সংরক্ষিত আছে। পেজ রিফ্রেশ করলে আবার হোম থেকে অর্ডার করতে হবে।"
            : "This invoice is saved for this browser session. Refreshing may clear it — place a new order from home if needed."}
        </p>
      </div>
    </div>
  );
}
