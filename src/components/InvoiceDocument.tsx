import type { OrderReceipt } from "@/types/order";
import "@/invoice/invoice-document.css";

export type InvoiceLabels = {
  invoice: string;
  orderRef: string;
  date: string;
  customer: string;
  delivery: string;
  items: string;
  product: string;
  qty: string;
  perKg: string;
  lineTotal: string;
  subtotal: string;
  shipping: string;
  total: string;
  cod: string;
  brand: string;
  tagline: string;
  phone: string;
  kg: string;
};

type Props = {
  receipt: OrderReceipt;
  labels: InvoiceLabels;
  logoSrc: string;
  formatDate: (iso: string) => string;
  formatMoney: (n: number) => string;
};

export default function InvoiceDocument({ receipt, labels, logoSrc, formatDate, formatMoney }: Props) {
  return (
    <div className="invoice-doc" data-invoice-root>
      <header className="invoice-doc__header">
        <div className="invoice-doc__brand">
          <img className="invoice-doc__logo" src={logoSrc} alt={labels.brand} />
          <div>
            <p className="invoice-doc__brand-name">{labels.brand}</p>
            <p className="invoice-doc__brand-sub">{labels.tagline}</p>
            <p className="invoice-doc__brand-phone">{labels.phone}</p>
          </div>
        </div>
        <div>
          <p className="invoice-doc__invoice-label">{labels.invoice}</p>
          <p className="invoice-doc__invoice-ref">{receipt.orderRef}</p>
        </div>
      </header>

      <dl className="invoice-doc__meta">
        <div>
          <dt>{labels.orderRef}</dt>
          <dd className="invoice-doc__invoice-ref" style={{ textAlign: "left" }}>
            {receipt.orderRef}
          </dd>
        </div>
        <div>
          <dt>{labels.date}</dt>
          <dd>{formatDate(receipt.createdAt)}</dd>
        </div>
      </dl>

      <section className="invoice-doc__customer">
        <p className="invoice-doc__section-label">{labels.customer}</p>
        <p className="invoice-doc__customer-name">{receipt.customer.name}</p>
        <p className="invoice-doc__muted">{receipt.customer.mobile}</p>
        {receipt.customer.email && <p className="invoice-doc__muted">{receipt.customer.email}</p>}
        <p className="invoice-doc__muted">
          {receipt.customer.districtLabel}
          {(receipt.customer.upazilaLabel || receipt.customer.upazila)
            ? ` · ${receipt.customer.upazilaLabel || receipt.customer.upazila}`
            : ""}
        </p>
        <p className="invoice-doc__muted">{receipt.customer.address}</p>
        <p className="invoice-doc__delivery">
          <strong>{labels.delivery}: </strong>
          {receipt.deliveryLabel}
        </p>
      </section>

      <section className="invoice-doc__table-wrap">
        <p className="invoice-doc__section-label">{labels.items}</p>
        <table className="invoice-doc__table">
          <thead>
            <tr>
              <th>{labels.product}</th>
              <th>{labels.qty}</th>
              <th>{labels.perKg}</th>
              <th>{labels.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, i) => (
              <tr key={i}>
                <td>
                  <p className="invoice-doc__item-name">{item.name}</p>
                  <p className="invoice-doc__item-sub">
                    {item.qty} × {item.pkg} {labels.kg}
                  </p>
                </td>
                <td className="invoice-doc__num">{item.qty}</td>
                <td className="invoice-doc__num">{formatMoney(item.pricePerKg)}</td>
                <td className="invoice-doc__num invoice-doc__line-total">{formatMoney(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="invoice-doc__totals">
        <div className="invoice-doc__total-row">
          <span>{labels.subtotal}</span>
          <span className="invoice-doc__num">{formatMoney(receipt.subtotal)}</span>
        </div>
        <div className="invoice-doc__total-row">
          <span>{labels.shipping}</span>
          <span className="invoice-doc__num">{formatMoney(receipt.shipping)}</span>
        </div>
        <div className="invoice-doc__grand">
          <span>{labels.total}</span>
          <span className="invoice-doc__grand-amount">{formatMoney(receipt.total)}</span>
        </div>
        <p className="invoice-doc__cod">{labels.cod}</p>
      </section>
    </div>
  );
}
