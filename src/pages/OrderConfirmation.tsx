import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, Download, Home, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceDocument, { type InvoiceLabels } from "@/components/InvoiceDocument";
import { downloadInvoicePdf } from "@/lib/generateInvoicePdf";
import { loadOrderReceipt } from "@/lib/orderStorage";
import type { OrderReceipt } from "@/types/order";

const LOGO_SRC = `${import.meta.env.BASE_URL}amerbari-logo.png`;

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
    product: "পণ্য",
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
    product: "Item",
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

function invoiceLabels(t: (typeof COPY)["bn"]): InvoiceLabels {
  return {
    invoice: t.invoice,
    orderRef: t.orderRef,
    date: t.date,
    customer: t.customer,
    delivery: t.delivery,
    items: t.items,
    product: t.product,
    qty: t.qty,
    perKg: t.perKg,
    lineTotal: t.lineTotal,
    subtotal: t.subtotal,
    shipping: t.shipping,
    total: t.total,
    cod: t.cod,
    brand: t.brand,
    tagline: t.tagline,
    phone: t.phone,
    kg: t.kg,
  };
}

export default function OrderConfirmation() {
  const [receipt] = useState<OrderReceipt | null>(() => loadOrderReceipt());
  const [pdfLoading, setPdfLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!receipt) {
    return <Navigate to="/" replace />;
  }

  const t = COPY[receipt.lang];
  const labels = invoiceLabels(t);

  const handleDownloadPdf = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    setPdfLoading(true);
    try {
      await downloadInvoicePdf(el, receipt.orderRef);
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

        <div ref={invoiceRef} id="invoice-printable" className="mt-10 print:mt-0">
          <InvoiceDocument
            receipt={receipt}
            labels={labels}
            logoSrc={LOGO_SRC}
            formatDate={(iso) => formatOrderDate(iso, receipt.lang)}
            formatMoney={formatMoney}
          />
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
