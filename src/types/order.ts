export type OrderLineItem = {
  name: string;
  pkg: string;
  qty: number;
  pricePerKg: number;
  lineTotal: number;
};

export type OrderReceipt = {
  orderRef: string;
  createdAt: string;
  lang: "bn" | "en";
  customer: {
    name: string;
    mobile: string;
    email: string;
    district: string;
    districtLabel: string;
    upazila: string;
    address: string;
  };
  delivery: "courier" | "home";
  deliveryLabel: string;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
};
