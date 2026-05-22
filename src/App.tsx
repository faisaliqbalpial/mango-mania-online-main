import { useMemo, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Check, Leaf, Phone, ShieldCheck, Truck, User, MapPin, Mail, Home, Languages, Facebook, LayoutGrid, List, ShoppingBag, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import UPAZILAS_DATA from "./upazilas.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDistrictList, getUpazilaLabel, getUpazilasForDistrict } from "@/lib/bangladeshLocations";
import { saveOrderReceipt } from "@/lib/orderStorage";
import type { OrderReceipt } from "@/types/order";
import OrderConfirmation from "@/pages/OrderConfirmation";
import heroImg from "@/assets/Real mango pic.webp";
import nengraImg from "@/assets/nengra.jpg";
import amropaliImg from "@/assets/amropali.jpg";
import himsagorImg from "@/assets/khirsapat.jpg";
import bari4Img from "@/assets/bari4.jpg";

type Lang = "bn" | "en";
type Variety = "nengra" | "amropali" | "himsagor" | "bari4";
type Pkg = "10" | "20" | "40";
type Delivery = "courier" | "home";

type VarietyLine = { pkg: Pkg; qty: number };
type VarietyLayout = "grid" | "list";
type ProductKey = `${Variety}-${Pkg}`;
type CartLine = { selected: boolean; qty: number };

const DEFAULT_VARIETY_LINES: Record<Variety, VarietyLine> = {
  nengra: { pkg: "10", qty: 1 },
  amropali: { pkg: "10", qty: 1 },
  himsagor: { pkg: "10", qty: 1 },
  bari4: { pkg: "10", qty: 1 },
};

function productKey(variety: Variety, pkg: Pkg): ProductKey {
  return `${variety}-${pkg}`;
}

function parseProductKey(key: ProductKey): { variety: Variety; pkg: Pkg } {
  const i = key.lastIndexOf("-");
  return { variety: key.slice(0, i) as Variety, pkg: key.slice(i + 1) as Pkg };
}

function varietyHasSelection(variety: Variety, cart: Record<ProductKey, CartLine>): boolean {
  return (["10", "20", "40"] as Pkg[]).some((p) => cart[productKey(variety, p)]?.selected);
}

function clampQty(q: number): number {
  if (!Number.isFinite(q)) return 1;
  return Math.max(1, Math.min(99, Math.floor(q)));
}

const T = {
bn: {
brand: "আমের বাড়ি",
tagline: "রাজশাহীর আম, সবার প্রিয় নাম",
callUs: "01970163903",
fresh: "১০০% বাগানের তাজা",
heroTitle: "মিষ্টি, রসালো আম — সরাসরি বাগান থেকে আপনার দরজায়।",
heroSub: (
<>
প্রিমিয়াম <strong>ন্যাংড়া</strong>, <strong>আম্রপালি</strong>,{" "}
<strong>খিরসাপাত/হিমসাগর</strong> ও <strong>বারি ৪</strong> আম অর্ডার করুন ১০, ২০ ও ৪০ কেজি প্যাকেজে। সারা বাংলাদেশে ডেলিভারি।
</>
),
orderNow: "এখনই প্রি-অর্ডার করুন",
whyUs: "কেন আমরা",
safe: "নিরাপদ ও বিশুদ্ধ",
nationwide: "সারাদেশে ডেলিভারি",
gardenFresh: "বাগানের তাজা",
whyTitle: "কেন আমাদের থেকে অর্ডার করবেন?",
whySub: "আমরা প্রতিটি আম বিশ্বস্ত বাগান থেকে হাতে বাছাই করি, যাতে আপনি মৌসুমের সেরাটাই পান।",
why: [
{ title: "১০০% বাগানের তাজা", text: "সঠিক পাকা অবস্থায় হাতে বাছাই করে আপনার দরজায় পৌঁছে দেওয়া হয়।" },
{ title: "কার্বাইড ও কেমিক্যাল মুক্ত", text: "প্রাকৃতিকভাবে পাকানো — পরিবারের জন্য সম্পূর্ণ নিরাপদ।" },
{ title: "সারা দেশে ডেলিভারি", text: "বাংলাদেশের সর্বত্র দ্রুত কুরিয়ার ও হোম ডেলিভারি।" },
],
placeOrder: "প্রি-অর্ডার করুন",
placeOrderSub: "আম বাছাই করুন, প্যাকেজ ও পরিমাণ নির্বাচন করুন, ডেলিভারির ঠিকানা দিন।",
step1: "আমের জাত নির্বাচন করুন",
varietyLayoutGrid: "গ্রিড",
varietyLayoutList: "তালিকা",
varietyLayoutAria: "পণ্যের দেখার ধরন",
showMoreOptions: "আরও বিকল্প দেখুন (প্রতিটি প্যাকেজ আলাদা)",
hideMoreOptions: "সহজ দেখায় ফিরে যান",
detailedOptionsHint: "একই জাতের একাধিক প্যাকেজ একসাথে বেছে নিতে চাইলে নিচের তালিকা ব্যবহার করুন।",
step2: "ডেলিভারি পদ্ধতি",
step3: "ডেলিভারির তথ্য",
familyPack: "পারিবারিক প্যাক",
bestValue: "সেরা দাম",
bulkPack: "বাল্ক প্যাক",
courier: "কুরিয়ার (সারা বাংলাদেশ)",
courierFee: (f: number) => `৳${f} ডেলিভারি চার্জ`,
courierNote: "৩–৫ দিন। কুরিয়ার অফিস থেকে সংগ্রহ করুন।",
home: "হোম ডেলিভারি",
homeNote: "সরাসরি আপনার দরজায়।",
fullName: "পূর্ণ নাম",
namePh: "যেমন: রহিম উদ্দিন",
mobile: "মোবাইল নম্বর",
mobileError: "মোবাইল নম্বর অবশ্যই ১১ সংখ্যার হতে হবে (শুধুমাত্র সংখ্যা)।",
email: "ইমেইল",
optional: "(ঐচ্ছিক)",
area: "ডেলিভারি এলাকা",
selectDistrict: "আপনার জেলা নির্বাচন করুন",
upazilaThana: "উপজেলা / থানা",
selectUpazila: "উপজেলা / থানা নির্বাচন করুন",
upazilaManualPh: "উপজেলা বা থানার নাম লিখুন",
address: "সম্পূর্ণ ঠিকানা",
addressPh: "বাড়ি নং, রোড নং, এলাকা, থানা...",
summary: "প্রি-অর্ডার সারাংশ",
mangoLine: (kg: string, p: number) => `আম (${kg}কেজি × ৳${p})`,
qty: "পরিমাণ",
addToCart: "কার্টে যোগ করুন",
inCart: "কার্টে আছে",
addedToCart: (name: string) => `${name} কার্টে যোগ হয়েছে`,
deliveryCharge: "ডেলিভারি চার্জ",
total: "সর্বমোট",
confirm: "প্রি-অর্ডার নিশ্চিত করুন",
cod: "ক্যাশ অন ডেলিভারি উপলব্ধ। আমরা কনফার্মের জন্য কল করব।",
feesTitle: "ডেলিভারি চার্জ",
pkg: "প্যাকেজ",
courierAll: "কুরিয়ার (সারা বাংলাদেশ)",
homeDel: "হোম ডেলিভারি",
fillAll: "অনুগ্রহ করে সব আবশ্যক ঘর পূরণ করুন।",
selectProducts: "অনুগ্রহ করে অন্তত একটি আম টিক করে নির্বাচন করুন।",
emptyCart: "এখনও কোনো আম নির্বাচন করা হয়নি।",
ordered: (ref: string) => `প্রি-অর্ডার সম্পন্ন! রেফারেন্স: ${ref}`,
footerTag: "ভালোবাসায় পৌঁছে দেই বাগানের তাজা আম।",
location: "রাজশাহী, বাংলাদেশ",
fbLink: "ফেসবুকে আমাদের ফলো করুন",
varieties: {
nengra: { name: "ন্যাংড়া", sub: "Nengra", desc: "আঁশহীন, রসালো ও তীব্র সুগন্ধি — ভোজনরসিকদের প্রিয়।" },
amropali: { name: "আম্রপালি", sub: "Amropali", desc: "মিষ্টি, গাঢ়-কমলা শাঁস এবং সমৃদ্ধ স্বাদ।" },
himsagor: { name: "খিরসাপাত / হিমসাগর", sub: "Khirsapat / Himsagor", desc: "আমের রাজা — মাখনের মতো ঘন এবং অতুলনীয় মিষ্টি।" },
bari4: { name: "বারি ৪", sub: "Bari 4", desc: "আঁশমুক্ত, মিষ্টি ও সুগন্ধি — বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউটের উদ্ভাবন।" },
},
pkgSub: { "10": "পারিবারিক প্যাক", "20": "সেরা দাম", "40": "বাল্ক প্যাক" },
},
en: {
brand: "Amerbari",
tagline: "Rajshahi mangoes everyone loves",
callUs: "+880 1816510117",
fresh: "100% Garden Fresh",
heroTitle: "Sweet, juicy mangoes — straight from the orchard to your door.",
heroSub: (
<>
Order premium <strong>Nengra</strong>, <strong>Amropali</strong>,{" "}
<strong>Himsagor</strong> & <strong>Bari 4</strong> mangoes in 10kg, 20kg & 40kg packages. Nationwide delivery across Bangladesh.
</>
),
orderNow: "Pre-Order Now",
whyUs: "Why Us",
safe: "Safe & Pure",
nationwide: "Nationwide Delivery",
gardenFresh: "Garden Fresh",
whyTitle: "Why order from us?",
whySub: "We hand-pick every mango from trusted orchards so you get the very best of the season.",
why: [
{ title: "100% Garden Fresh", text: "Hand-picked at the perfect ripeness and rushed to your doorstep." },
{ title: "Carbide & Chemical Free", text: "Naturally ripened — completely safe for your family." },
{ title: "Nationwide Delivery", text: "Fast courier and home delivery available across Bangladesh." },
],
placeOrder: "Place your pre-order",
placeOrderSub: "Choose your mango, package size & quantity, and tell us where to deliver.",
step1: "Select Mango Variety",
varietyLayoutGrid: "Grid",
varietyLayoutList: "List",
varietyLayoutAria: "Product layout",
showMoreOptions: "Show more options (each pack separately)",
hideMoreOptions: "Back to simple view",
detailedOptionsHint: "Use the list below if you want multiple pack sizes of the same variety.",
step2: "Delivery Method",
step3: "Delivery Details",
familyPack: "Family pack",
bestValue: "Best value",
bulkPack: "Bulk pack",
courier: "Courier (All over BD)",
courierFee: (f: number) => `৳${f} delivery`,
courierNote: "3–5 days. Pick up from courier office.",
home: "Home Delivery",
homeNote: "Direct to your doorstep.",
fullName: "Full Name",
namePh: "e.g. Rahim Uddin",
mobile: "Mobile Number",
mobileError: "Mobile number must be exactly 11 digits (numbers only, no country code).",
email: "Email",
optional: "(Optional)",
area: "Delivery Area",
selectDistrict: "Select your district",
upazilaThana: "Upazila / Thana",
selectUpazila: "Select upazila / thana",
upazilaManualPh: "Type upazila or thana name",
address: "Full Address",
addressPh: "House No, Road No, Area, Thana...",
summary: "Pre-Order Summary",
mangoLine: (kg: string, p: number) => `Mango (${kg}kg × ৳${p})`,
qty: "Quantity",
addToCart: "Add to cart",
inCart: "In cart",
addedToCart: (name: string) => `Added ${name} to cart`,
deliveryCharge: "Delivery charge",
total: "Total",
confirm: "Confirm Pre-Order",
cod: "Cash on delivery available. We'll call to confirm.",
feesTitle: "Delivery Charges",
pkg: "Package",
courierAll: "Courier (All BD)",
homeDel: "Home Delivery",
fillAll: "Please fill in all required fields.",
selectProducts: "Please tick at least one mango to order.",
emptyCart: "No mangoes selected yet.",
ordered: (ref: string) => `Pre-order placed! Reference: ${ref}`,
footerTag: "Garden-fresh mangoes, delivered with love.",
location: "Rajshahi, Bangladesh",
fbLink: "Follow us on Facebook",
varieties: {
nengra: { name: "Nengra", sub: "ন্যাংড়া", desc: "Fiberless, juicy and intensely aromatic — a connoisseur's favourite." },
amropali: { name: "Amropali", sub: "আম্রপালি", desc: "Sweet, deep-orange flesh with a rich tropical flavour." },
himsagor: { name: "Khirsapat / Himsagor", sub: "খিরসাপাত / হিমসাগর", desc: "The king of mangoes — buttery texture and unmatched sweetness." },
bari4: { name: "Bari 4", sub: "বারি ৪", desc: "Fiberless, sweet and aromatic — developed by the Bangladesh Agricultural Research Institute." },
},
pkgSub: { "10": "Family pack", "20": "Best value", "40": "Bulk pack" },
},
} as const;

const VARIETY_IMG: Record<Variety, string> = {
nengra: nengraImg,
amropali: amropaliImg,
himsagor: himsagorImg,
bari4: bari4Img,
};

const PRICE_PER_KG: Record<Variety, number> = {
nengra: 110,
amropali: 110,
himsagor: 110,
bari4: 130,
};

const DISTRICTS_BN: Record<string, string> = {
"Bagerhat": "বাগেরহাট", "Bandarban": "বান্দরবান", "Barguna": "বরগুনা", "Barishal": "বরিশাল", "Bhola": "ভোলা", "Bogura": "বগুড়া", "Brahmanbaria": "ব্রাহ্মণবাড়িয়া", "Chandpur": "চাঁদপুর",
"Chattogram": "চট্টগ্রাম", "Chuadanga": "চুয়াডাঙ্গা", "Cox's Bazar": "কক্সবাজার", "Cumilla": "কুমিল্লা", "Dhaka": "ঢাকা", "Dinajpur": "দিনাজপুর", "Faridpur": "ফরিদপুর", "Feni": "ফেনী",
"Gaibandha": "গাইবান্ধা", "Gazipur": "গাজীপুর", "Gopalganj": "গোপালগঞ্জ", "Habiganj": "হবিগঞ্জ", "Jamalpur": "জামালপুর", "Jashore": "যশোর", "Jhalokati": "ঝালকাঠি", "Jhenaidah": "ঝিনাইদহ",
"Joypurhat": "জয়পুরহাট", "Khagrachhari": "খাগড়াছড়ি", "Khulna": "খুলনা", "Kishoreganj": "কিশোরগঞ্জ", "Kurigram": "কুড়িগ্রাম", "Kushtia": "কুষ্টিয়া", "Lakshmipur": "লক্ষ্মীপুর", "Lalmonirhat": "লালমনিরহাট",
"Madaripur": "মাদারীপুর", "Magura": "মাগুরা", "Manikganj": "মানিকগঞ্জ", "Meherpur": "মেহেরপুর", "Moulvibazar": "মৌলভীবাজার", "Munshiganj": "মুন্সীগঞ্জ", "Mymensingh": "ময়মনসিংহ", "Naogaon": "নওগাঁ",
"Narail": "নড়াইল", "Narayanganj": "নারায়ণগঞ্জ", "Narsingdi": "নরসিংদী", "Natore": "নাটোর", "Netrokona": "নেত্রকোনা", "Nilphamari": "নীলফামারী", "Noakhali": "নোয়াখালী", "Pabna": "পাবনা",
"Panchagarh": "পঞ্চগড়", "Patuakhali": "পটুয়াখালী", "Pirojpur": "পিরোজপুর", "Rajbari": "রাজবাড়ী", "Rajshahi": "রাজশাহী", "Rangamati": "রাঙ্গামাটি", "Rangpur": "রংপুর", "Satkhira": "সাতক্ষীরা",
"Shariatpur": "শরীয়তপুর", "Sherpur": "শেরপুর", "Sirajganj": "সিরাজগঞ্জ", "Sunamganj": "সুনামগঞ্জ", "Sylhet": "সিলেট", "Tangail": "টাঙ্গাইল", "Thakurgaon": "ঠাকুরগাঁও",
"Chapainawabganj": "চাঁপাইনবাবগঞ্জ",
};

const DISTRICTS = getDistrictList(Object.keys(DISTRICTS_BN));

const PACKAGE_KG: Record<Pkg, number> = { "10": 10, "20": 20, "40": 40 };
const DELIVERY_FEES: Record<Delivery, Record<Pkg, number>> = {
  courier: { "10": 200, "20": 200, "40": 300 },
  home: { "10": 350, "20": 450, "40": 700 },
};

const ALL_VARIETIES = Object.keys(VARIETY_IMG) as Variety[];
const ALL_PKGS = Object.keys(PACKAGE_KG) as Pkg[];
const PRODUCT_KEYS: ProductKey[] = ALL_VARIETIES.flatMap((v) => ALL_PKGS.map((p) => productKey(v, p)));

function initialCartLines(): Record<ProductKey, CartLine> {
  return Object.fromEntries(PRODUCT_KEYS.map((k) => [k, { selected: false, qty: 1 }])) as Record<ProductKey, CartLine>;
}

const SOCIAL_CITIES_BN = ["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "ময়মনসিংহ", "কুমিল্লা"];
const SOCIAL_CITIES_EN = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Mymensingh", "Cumilla"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomSocialMessage(lang: Lang): string {
  const t = T[lang];
  const v = pick(Object.keys(VARIETY_IMG) as Variety[]);
  const mango = t.varieties[v].name;
  const pkg = pick(["10", "20", "40"] as Pkg[]);
  const kg = PACKAGE_KG[pkg];
  const city = lang === "bn" ? pick(SOCIAL_CITIES_BN) : pick(SOCIAL_CITIES_EN);

  if (lang === "bn") {
    const bn = [
      `${city} · এইমাত্র কেউ ${kg} কেজি ${mango} বেছে নিলেন`,
      `নতুন প্রি-অর্ডার — ${mango} · ${kg} কেজি`,
      `কেউ এইমাত্র ${kg} কেজি ${mango} কনফার্ম করেছেন`,
      `${city} থেকে · ${kg} কেজি ${mango} প্যাক`,
      `এইমাত্র · ${mango} (${kg} কেজি) অর্ডার হয়েছে`,
      `${kg} কেজি ${mango} — নতুন বুকিং`,
      `একটি অর্ডার · ${mango} (${kg} কেজি) · ${city}`,
      `সদ্যই · ${city} · ${kg} কেজি ${mango}`,
      `প্রি-অর্ডার আপডেট · ${mango} ${kg} কেজি`,
      `ক্রেতা · ${city} · ${mango} (${kg} কেজি)`,
      `এইমাত্র যোগ হলো · ${kg} কেজি ${mango}`,
      `${mango} · ${kg} কেজি · ${city} থেকে`,
      `নতুন · ${kg} কেজি প্যাক (${mango})`,
      `${city} · ${mango} · ${kg} কেজি নিয়েছেন`,
    ];
    return pick(bn);
  }

  const en = [
    `Someone in ${city} just booked ${kg}kg of ${mango}`,
    `New pre-order — ${mango}, ${kg}kg pack`,
    `Just now · ${kg}kg ${mango} · ${city}`,
    `Order in · ${mango} (${kg}kg) from ${city}`,
    `${kg}kg ${mango} · confirmed`,
    `Fresh booking: ${mango} · ${city}`,
    `${city} · ${mango} · ${kg}kg selected`,
    `A customer near ${city} chose ${kg}kg ${mango}`,
    `Pre-order: ${mango} x${kg}kg`,
    `${mango} · ${kg}kg · new`,
    `Someone reserved ${kg}kg ${mango}`,
    `Latest: ${kg}kg pack · ${mango}`,
    `${city} · just grabbed ${kg}kg ${mango}`,
    `New: ${mango} (${kg}kg)`,
  ];
  return pick(en);
}

const WEB3FORMS_ACCESS_KEY = "b814ca83-3d5c-4008-a828-72c4352e69d7";
/** Set true to re-enable bottom-left “someone ordered” toasts */
const ENABLE_FAKE_ORDER_TOASTS = false;

function Landing() {
const navigate = useNavigate();
const [lang, setLang] = useState<Lang>("bn");
const t = T[lang];
const [cartLines, setCartLines] = useState<Record<ProductKey, CartLine>>(initialCartLines);
const [varietyPrefs, setVarietyPrefs] = useState<Record<Variety, VarietyLine>>(() => ({ ...DEFAULT_VARIETY_LINES }));
const [varietyLayout, setVarietyLayout] = useState<VarietyLayout>("list");
const [showDetailedOptions, setShowDetailedOptions] = useState(false);
const [delivery, setDelivery] = useState<Delivery>("courier");
const [form, setForm] = useState({ name: "", mobile: "", email: "", area: "", upazila: "", address: "" });
const [mobileError, setMobileError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [activityToast, setActivityToast] = useState<{ id: number; text: string } | null>(null);

useEffect(() => {
  if (!ENABLE_FAKE_ORDER_TOASTS) return;

  let cancelled = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  /** ms until the first “someone ordered” toast appears after load */
  const FIRST_TOAST_MIN = 2000;
  const FIRST_TOAST_MAX = 6500;

  /** ms between hiding a toast and showing the next one */
  const GAP_BEFORE_SHOW_MIN = 4500;
  const GAP_BEFORE_SHOW_MAX = 15500;

  /** ms each toast stays visible before fading */
  const VISIBLE_MIN = 2100;
  const VISIBLE_MAX = 4400;

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      if (!cancelled) fn();
    }, ms);
    timeouts.push(id);
  };

  const randBetween = (min: number, max: number) => min + Math.random() * (max - min);

  const cycle = () => {
    after(randBetween(GAP_BEFORE_SHOW_MIN, GAP_BEFORE_SHOW_MAX), () => {
      setActivityToast({ id: Date.now(), text: randomSocialMessage(lang) });
      after(randBetween(VISIBLE_MIN, VISIBLE_MAX), () => {
        setActivityToast(null);
        cycle();
      });
    });
  };

  after(randBetween(FIRST_TOAST_MIN, FIRST_TOAST_MAX), cycle);

  return () => {
    cancelled = true;
    timeouts.forEach(clearTimeout);
  };
}, [lang]);

const selectedEntries = useMemo(() => {
  const out: { key: ProductKey; variety: Variety; pkg: Pkg; qty: number }[] = [];
  for (const k of PRODUCT_KEYS) {
    const cell = cartLines[k];
    if (!cell?.selected) continue;
    const { variety, pkg } = parseProductKey(k);
    out.push({ key: k, variety, pkg, qty: clampQty(cell.qty) });
  }
  return out;
}, [cartLines]);

const subtotal = selectedEntries.reduce(
  (sum, { variety, pkg, qty }) => sum + qty * PACKAGE_KG[pkg] * PRICE_PER_KG[variety],
  0,
);

const shippingFor = (d: Delivery) =>
  selectedEntries.reduce((sum, { pkg, qty }) => sum + qty * DELIVERY_FEES[d][pkg], 0);

const shipping = shippingFor(delivery);
const total = subtotal + shipping;
const orderRef = useMemo(() => "ORD-" + Math.floor(Math.random() * 90000 + 10000), []);

const orderLinesLabel = selectedEntries
  .map(({ variety, pkg, qty }) => `${t.varieties[variety].name}: ${qty}×${pkg}kg`)
  .join("; ");

const uniqueVarietyNames = [...new Set(selectedEntries.map((e) => t.varieties[e.variety].name))].join(", ");

// Validate mobile: exactly 11 digits, numbers only
const validateMobile = (value: string): boolean => /^\d{11}$/.test(value);

const handleMobileChange = (v: string) => {
  // Strip any non-digit characters and cap at 11 digits
  const digits = v.replace(/\D/g, "").slice(0, 11);
  setForm({ ...form, mobile: digits });
  if (digits.length > 0 && digits.length < 11) {
    setMobileError(t.mobileError);
  } else {
    setMobileError("");
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (selectedEntries.length === 0) {
    toast.error(t.selectProducts);
    return;
  }
  if (!form.name || !form.mobile || !form.area || !form.upazila || !form.address) {
    toast.error(t.fillAll);
    return;
  }
  if (!validateMobile(form.mobile)) {
    setMobileError(t.mobileError);
    toast.error(t.mobileError);
    return;
  }
  setMobileError("");

  const receipt: OrderReceipt = {
    orderRef,
    createdAt: new Date().toISOString(),
    lang,
    customer: {
      name: form.name,
      mobile: form.mobile,
      email: form.email || "",
      district: form.area,
      districtLabel: lang === "bn" ? (DISTRICTS_BN[form.area] ?? form.area) : form.area,
      upazila: form.upazila,
      upazilaLabel: getUpazilaLabel(form.area, form.upazila, lang),
      address: form.address,
    },
    delivery,
    deliveryLabel: delivery === "home" ? t.home : t.courier,
    items: selectedEntries.map(({ variety, pkg, qty }) => ({
      name: t.varieties[variety].name,
      nameEn: T.en.varieties[variety].name,
      pkg,
      qty,
      pricePerKg: PRICE_PER_KG[variety],
      lineTotal: qty * PACKAGE_KG[pkg] * PRICE_PER_KG[variety],
    })),
    subtotal,
    shipping,
    total,
  };

  saveOrderReceipt(receipt);
  setIsSubmitting(true);

  const fd = new FormData();
  fd.append("access_key", WEB3FORMS_ACCESS_KEY);
  fd.append("subject", `New Pre-Order from ${form.name}`);
  fd.append("from_name", "Mango Mania Pre-Order");
  fd.append("Name", form.name);
  fd.append("Mobile", form.mobile);
  fd.append("Email", form.email || "No email provided");
  fd.append("District", form.area);
  fd.append("Upazila", form.upazila);
  fd.append("Address", form.address);
  fd.append("Varieties", uniqueVarietyNames || "—");
  fd.append("Order_Lines", orderLinesLabel);
  fd.append("Delivery", delivery === "home" ? "Home Delivery" : "Courier");
  fd.append("Total_Price", `৳${total}`);
  fd.append("Order_Reference", orderRef);

  try {
    await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
  } catch {
    toast.error(
      lang === "bn"
        ? "অর্ডার সংরক্ষিত হয়েছে, তবে নোটিফিকেশন পাঠানো যায়নি।"
        : "Order saved, but we could not send the notification email.",
    );
  }

  setIsSubmitting(false);
  toast.success(t.ordered(orderRef));
  navigate("/order-confirmation", { replace: true });
};

const toggleVariety = (key: Variety) => {
  const prefs = varietyPrefs[key];
  const pk = productKey(key, prefs.pkg);
  const on = varietyHasSelection(key, cartLines);
  setCartLines((prev) => {
    const next = { ...prev };
    if (on) {
      for (const p of ALL_PKGS) {
        const k = productKey(key, p);
        next[k] = { ...(next[k] ?? { qty: 1, selected: false }), selected: false };
      }
    } else {
      next[pk] = { selected: true, qty: clampQty(prefs.qty) };
    }
    return next;
  });
};

const addVarietyToCart = (key: Variety) => {
  const prefs = varietyPrefs[key];
  const pk = productKey(key, prefs.pkg);
  setCartLines((prev) => {
    const next = { ...prev };
    for (const p of ALL_PKGS) {
      const k = productKey(key, p);
      next[k] = { ...(next[k] ?? { qty: 1, selected: false }), selected: false };
    }
    next[pk] = { selected: true, qty: clampQty(prefs.qty) };
    return next;
  });
  toast.success(t.addedToCart(t.varieties[key].name));
};

const setVarietyPkg = (key: Variety, pkg: Pkg) => {
  setVarietyPrefs((prev) => ({
    ...prev,
    [key]: { ...prev[key], pkg, qty: clampQty(prev[key]?.qty ?? 1) },
  }));
  setCartLines((prev) => {
    if (!varietyHasSelection(key, prev)) return prev;
    const activePkg = ALL_PKGS.find((p) => prev[productKey(key, p)]?.selected);
    const q = clampQty(activePkg ? prev[productKey(key, activePkg)]?.qty : prev[productKey(key, pkg)]?.qty ?? 1);
    const next = { ...prev };
    for (const p of ALL_PKGS) {
      const k = productKey(key, p);
      next[k] = {
        ...(next[k] ?? { qty: 1, selected: false }),
        selected: p === pkg,
        qty: p === pkg ? q : (next[k]?.qty ?? 1),
      };
    }
    return next;
  });
};

const setVarietyQty = (key: Variety, qty: number) => {
  const q = clampQty(qty);
  const pkg = varietyPrefs[key]?.pkg ?? "10";
  setVarietyPrefs((prev) => ({ ...prev, [key]: { ...prev[key], pkg, qty: q } }));
  const pk = productKey(key, pkg);
  setCartLines((prev) => {
    if (!prev[pk]?.selected) return prev;
    return { ...prev, [pk]: { ...prev[pk], qty: q } };
  });
};

const toggleProductKey = (pk: ProductKey) => {
  setCartLines((prev) => {
    const cur = prev[pk] ?? { selected: false, qty: 1 };
    return { ...prev, [pk]: { selected: !cur.selected, qty: clampQty(cur.qty) } };
  });
};

const setProductQty = (pk: ProductKey, qty: number) => {
  const q = clampQty(qty);
  setCartLines((prev) => ({
    ...prev,
    [pk]: { ...(prev[pk] ?? { selected: false, qty: 1 }), qty: q },
  }));
};

return (
<div className="min-h-screen bg-background text-foreground" lang={lang}>
<Toaster position="top-center" richColors />

{/* Top bar */}
<header className="border-b border-border bg-card">
<div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
<div className="flex items-center gap-3 sm:gap-4">
<img src="/amerbari-logo.png" alt={`${t.brand} logo`} className="h-14 w-14 shrink-0 rounded-lg object-contain sm:h-20 sm:w-20" />
<div className="min-w-0">
<p className="text-lg font-extrabold leading-tight text-primary sm:text-2xl">{t.brand}</p>
<p className="text-xs text-muted-foreground leading-snug sm:text-sm">{t.tagline}</p>
</div>
</div>
<div className="flex items-center gap-2">
<button
onClick={() => setLang(lang === "bn" ? "en" : "bn")}
className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition"
aria-label="Switch language"
>
<Languages className="h-3.5 w-3.5" />
{lang === "bn" ? "EN" : "বাং"}
</button>
<a
href="tel:+8801970163903"
className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground sm:inline-flex"
>
<Phone className="h-4 w-4" /> {t.callUs}
</a>
</div>
</div>
</header>

{/* Hero */}
<section className="relative overflow-hidden">
<div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
<div className="space-y-6">
<span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
<Leaf className="h-3.5 w-3.5" /> {t.fresh}
</span>
<h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t.heroTitle}</h1>
<p className="text-base text-muted-foreground md:text-lg">{t.heroSub}</p>
<div className="flex flex-wrap gap-3">
<Button asChild size="lg" className="h-12 px-6 text-base">
<a href="#order">{t.orderNow}</a>
</Button>

</div>
<div className="grid grid-cols-3 gap-4 pt-4">
{[
{ icon: ShieldCheck, label: t.safe },
{ icon: Truck, label: t.nationwide },
{ icon: Leaf, label: t.gardenFresh },
].map((f) => (
<div key={f.label} className="flex flex-col items-center gap-1 text-center">
<f.icon className="h-5 w-5 text-primary" />
<span className="text-xs font-medium">{f.label}</span>
</div>
))}
</div>
</div>
<div className="relative">
<div className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl" style={{ background: "var(--gradient-warm)" }} />
<img src={heroImg} alt="Fresh mangoes in a basket" width={1536} height={1024}
className="relative rounded-3xl object-cover shadow-[var(--shadow-soft)]" />
</div>
</div>
</section>

{/* Order */}
<section id="order" className="py-14">
<div className="mx-auto max-w-6xl px-4">
<div className="text-center">
<h2 className="text-3xl font-bold">{t.placeOrder}</h2>
<p className="mt-2 text-muted-foreground">{t.placeOrderSub}</p>
</div>

<div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
<div className="space-y-8">
<Card
step="1"
title={t.step1}
action={
<div
className="inline-flex shrink-0 rounded-lg border border-border bg-background p-0.5"
role="group"
aria-label={t.varietyLayoutAria}
>
<button
type="button"
onClick={() => setVarietyLayout("grid")}
className={cn(
"inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
varietyLayout === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
)}
aria-pressed={varietyLayout === "grid"}
>
<LayoutGrid className="h-3.5 w-3.5" />
{t.varietyLayoutGrid}
</button>
<button
type="button"
onClick={() => setVarietyLayout("list")}
className={cn(
"inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
varietyLayout === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
)}
aria-pressed={varietyLayout === "list"}
>
<List className="h-3.5 w-3.5" />
{t.varietyLayoutList}
</button>
</div>
}
>
<div
className={cn(
varietyLayout === "grid" ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"
)}
>
{(Object.keys(VARIETY_IMG) as Variety[]).map((key) => {
const v = t.varieties[key];
const active = varietyHasSelection(key, cartLines);
const line = varietyPrefs[key];
const q = clampQty(line.qty);
const isList = varietyLayout === "list";
return (
<div
key={key}
role="button"
tabIndex={0}
onClick={() => toggleVariety(key)}
onKeyDown={(e) => {
if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
toggleVariety(key);
}
}}
className={cn(
"group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-card text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
active ? "border-primary shadow-[var(--shadow-soft)] ring-1 ring-primary/10" : "border-border hover:border-primary/40",
isList ? "flex gap-2 p-2 sm:gap-3 sm:p-3" : "flex flex-col"
)}
aria-pressed={active}
>
<div
className={cn(
"flex shrink-0 items-center justify-center rounded-lg border-2 shadow-sm",
active ? "border-primary bg-primary/15" : "border-primary/70 bg-white",
isList ? "mt-2 h-11 w-11 sm:mt-6" : "ml-2 mt-2 h-11 w-11"
)}
onClick={(e) => e.stopPropagation()}
onKeyDown={(e) => e.stopPropagation()}
>
<Checkbox
id={`variety-${key}`}
checked={active}
onClick={(e) => e.stopPropagation()}
onCheckedChange={() => toggleVariety(key)}
className="h-6 w-6 rounded-md border-2 border-primary bg-white shadow-md data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
aria-label={
lang === "bn"
? `${v.name} অর্ডারে যোগ করুন`
: `Include ${v.name} in order`
}
/>
</div>

<div className={cn("min-w-0 flex-1", isList && "flex flex-col sm:flex-row sm:items-stretch")}>
<div
className={cn(
isList ? "flex flex-1 gap-3 p-1 sm:min-w-0 sm:items-center sm:pr-2" : "w-full px-3 pb-1 pt-0"
)}
>
<div
className={cn(
"overflow-hidden rounded-lg shrink-0",
isList ? "h-24 w-24 sm:h-28 sm:w-28" : "aspect-square w-full"
)}
>
<img src={VARIETY_IMG[key]} alt={v.name} loading="lazy"
className="h-full w-full object-cover transition-transform group-hover:scale-105" />
</div>
<div className={cn(isList ? "min-w-0 flex-1 pt-0" : "mt-3")}>
<p className="text-sm font-bold break-words">{v.name}</p>
<p className="text-xs text-muted-foreground break-words">{v.sub}</p>
<p className="mt-1 text-xs text-muted-foreground break-words leading-snug">{v.desc}</p>
</div>
</div>

<div
className={cn(
"space-y-3",
isList
? "border-t border-border px-3 pb-3 pt-3 sm:flex sm:min-w-[19rem] sm:w-80 sm:shrink-0 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-5 sm:py-4"
: "border-t border-border px-3 pb-3 pt-3"
)}
onClick={(e) => e.stopPropagation()}
onKeyDown={(e) => e.stopPropagation()}
>
<div className="grid grid-cols-3 gap-2.5">
{(Object.keys(PACKAGE_KG) as Pkg[]).map((p) => {
const pkgActive = line.pkg === p;
return (
<button
key={p}
type="button"
onClick={() => setVarietyPkg(key, p)}
className={cn(
"rounded-lg border px-2.5 py-2.5 text-center text-xs font-semibold transition min-h-[58px]",
pkgActive ? "border-primary bg-accent/50" : "border-border bg-background hover:border-primary/40"
)}
aria-pressed={pkgActive}
>
<div className="text-sm font-extrabold leading-none">{p} KG</div>
<div className="mt-1.5 text-[11px] text-muted-foreground leading-tight whitespace-normal break-words">
{t.pkgSub[p]}
</div>
</button>
);
})}
</div>

<div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
<span className="text-xs font-semibold text-muted-foreground">{t.qty}</span>
<div className="flex items-center gap-2">
<Button
type="button"
variant="outline"
size="sm"
className="h-8 w-8 px-0"
onClick={() => setVarietyQty(key, q - 1)}
aria-label="Decrease quantity"
>
-
</Button>
<span className="min-w-6 text-center text-sm font-bold tabular-nums">{q}</span>
<Button
type="button"
variant="outline"
size="sm"
className="h-8 w-8 px-0"
onClick={() => setVarietyQty(key, q + 1)}
aria-label="Increase quantity"
>
+
</Button>
</div>
</div>

<Button
type="button"
className={cn(
"h-11 w-full gap-2 text-sm font-semibold shadow-sm",
active && "border-primary bg-primary/10 text-primary hover:bg-primary/15"
)}
variant={active ? "outline" : "default"}
onClick={() => addVarietyToCart(key)}
>
<ShoppingCart className="h-4 w-4 shrink-0" />
{active ? t.inCart : t.addToCart}
</Button>
</div>
</div>
</div>
);
})}
</div>

<div className="mt-6 border-t border-border pt-5">
<Button
type="button"
variant="outline"
className="h-11 w-full gap-2 text-sm font-semibold"
onClick={() => setShowDetailedOptions((v) => !v)}
>
{showDetailedOptions ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
{showDetailedOptions ? t.hideMoreOptions : t.showMoreOptions}
</Button>

{showDetailedOptions && (
<div className="mt-4 space-y-3">
<p className="text-center text-xs text-muted-foreground">{t.detailedOptionsHint}</p>
<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
{PRODUCT_KEYS.map((pk) => {
const { variety, pkg } = parseProductKey(pk);
const vMeta = t.varieties[variety];
const cell = cartLines[pk] ?? { selected: false, qty: 1 };
const selected = cell.selected;
const q = clampQty(cell.qty);
const lineSub = q * PACKAGE_KG[pkg] * PRICE_PER_KG[variety];
return (
<div
key={pk}
role="button"
tabIndex={0}
onClick={() => toggleProductKey(pk)}
onKeyDown={(e) => {
if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
toggleProductKey(pk);
}
}}
className={cn(
"flex cursor-pointer gap-2.5 rounded-xl border-2 bg-card p-2.5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-3 sm:p-3",
selected ? "border-primary shadow-sm ring-1 ring-primary/10" : "border-border hover:border-primary/35"
)}
aria-pressed={selected}
>
<Checkbox
checked={selected}
onClick={(e) => e.stopPropagation()}
onCheckedChange={() => toggleProductKey(pk)}
className="mt-1 h-5 w-5 shrink-0 rounded-[6px] border-2 border-input shadow-sm data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
aria-hidden
tabIndex={-1}
/>
<img
src={VARIETY_IMG[variety]}
alt={vMeta.name}
loading="lazy"
className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
/>
<div className="min-w-0 flex-1 space-y-2">
<div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
<p className="text-sm font-bold leading-snug break-words">
{vMeta.name} · {pkg}{lang === "bn" ? " কেজি" : " KG"}
</p>
<p className="shrink-0 text-sm font-semibold tabular-nums text-primary">৳{lineSub}</p>
</div>
<p className="text-[11px] text-muted-foreground break-words sm:text-xs">{t.pkgSub[pkg]}</p>
<div
className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5"
onClick={(e) => e.stopPropagation()}
onKeyDown={(e) => e.stopPropagation()}
>
<span className="text-xs font-semibold text-muted-foreground">{t.qty}</span>
<div className="flex items-center gap-1.5">
<Button
type="button"
variant="outline"
size="sm"
className="h-7 w-7 px-0"
onClick={() => setProductQty(pk, q - 1)}
aria-label="Decrease quantity"
>
-
</Button>
<span className="min-w-5 text-center text-sm font-bold tabular-nums">{q}</span>
<Button
type="button"
variant="outline"
size="sm"
className="h-7 w-7 px-0"
onClick={() => setProductQty(pk, q + 1)}
aria-label="Increase quantity"
>
+
</Button>
</div>
</div>
</div>
</div>
);
})}
</div>
</div>
)}
</div>
</Card>

<Card step="2" title={t.step2}>
<div className="grid gap-3 sm:grid-cols-2">
<DeliveryOption active={delivery === "courier"} onClick={() => setDelivery("courier")}
icon={<Truck className="h-5 w-5" />} title={t.courier}
sub={t.courierFee(shippingFor("courier"))} note={t.courierNote} />
<DeliveryOption active={delivery === "home"} onClick={() => setDelivery("home")}
icon={<Home className="h-5 w-5" />} title={t.home}
sub={t.courierFee(shippingFor("home"))} note={t.homeNote} />
</div>
</Card>

<Card step="3" title={t.step3}>
<form id="order-form" onSubmit={handleSubmit} className="space-y-5">
<Field label={t.fullName} required icon={<User className="h-4 w-4" />}
placeholder={t.namePh} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
<div className="grid gap-5 sm:grid-cols-2">
  <div className="space-y-1">
    <Field
      label={t.mobile}
      required
      icon={<span className="text-base">🇧🇩</span>}
      placeholder="01XXXXXXXXX"
      value={form.mobile}
      type="tel"
      inputMode="numeric"
      maxLength={11}
      pattern="\d{11}"
      title={lang === "bn" ? "মোবাইল নম্বর ১১ সংখ্যার হতে হবে" : "Mobile number must be exactly 11 digits (numbers only)"}
      hasError={!!mobileError}
      onChange={handleMobileChange}
    />
    {mobileError && (
      <p className="text-xs text-destructive">{mobileError}</p>
    )}
  </div>
<Field label={t.email} optional optionalLabel={t.optional}
type="email"
icon={<Mail className="h-4 w-4" />} placeholder="you@example.com"
value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
</div>
<div className="space-y-2">
<Label className="text-sm font-semibold">
{t.area} (District) <span className="text-destructive">*</span>
</Label>
<Select required value={form.area} onValueChange={(v) => setForm({ ...form, area: v, upazila: "" })}>
<SelectTrigger className="h-11">
<SelectValue placeholder={t.selectDistrict} />
</SelectTrigger>
<SelectContent>
{DISTRICTS.map((d) => (
<SelectItem key={d} value={d}>
{lang === "bn" ? DISTRICTS_BN[d] : d}
</SelectItem>
))}
</SelectContent>
</Select>
</div>

{form.area && (
<div className="space-y-2">
<Label className="text-sm font-semibold">
{t.upazilaThana} <span className="text-destructive">*</span>
</Label>
{getUpazilasForDistrict(form.area).length > 0 ? (
<Select required value={form.upazila} onValueChange={(v) => setForm({ ...form, upazila: v })}>
<SelectTrigger className="h-11">
<SelectValue placeholder={t.selectUpazila} />
</SelectTrigger>
<SelectContent>
{getUpazilasForDistrict(form.area).map((u) => (
<SelectItem key={u.en} value={u.en}>
{lang === "bn" ? u.bn : u.en}
</SelectItem>
))}
</SelectContent>
</Select>
) : (
<Input
required
className="h-11"
placeholder={t.upazilaManualPh}
value={form.upazila}
onChange={(e) => setForm({ ...form, upazila: e.target.value })}
/>
)}
</div>
)}
<div className="space-y-2">
<Label className="text-sm font-semibold">
{t.address} <span className="text-destructive">*</span>
</Label>
<div className="relative">
<MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
<Textarea rows={3} placeholder={t.addressPh} className="pl-9"
value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
</div>
</div>
</form>
</Card>
</div>

<aside className="lg:sticky lg:top-6 lg:self-start">
<div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
<h3 className="text-lg font-bold">{t.summary}</h3>
<div className="mt-4 space-y-3">
{selectedEntries.length === 0 ? (
<p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
{t.emptyCart}
</p>
) : (
selectedEntries.map(({ key, variety, pkg, qty }) => {
const lineSub = qty * PACKAGE_KG[pkg] * PRICE_PER_KG[variety];
return (
<div key={key} className="flex gap-3 rounded-xl bg-accent/40 p-3">
<img
src={VARIETY_IMG[variety]}
alt={t.varieties[variety].name}
loading="lazy"
className="h-14 w-14 shrink-0 rounded-lg object-cover ring-2 ring-primary/30"
/>
<div className="min-w-0 flex-1">
<p className="text-sm font-bold leading-snug break-words">{t.varieties[variety].name}</p>
<p className="mt-1 break-words text-xs text-muted-foreground">
{qty} × {pkg} {lang === "bn" ? "কেজি" : "KG"} · {t.pkgSub[pkg]}
</p>
</div>
<p className="shrink-0 text-sm font-semibold tabular-nums">৳{lineSub}</p>
</div>
);
})
)}
</div>
<div className="mt-5 space-y-2 text-sm">
<div className="my-3 border-t border-dashed border-border" />
<Row
label={`${t.deliveryCharge} (${delivery === "home" ? t.home : t.courier})`}
value={`৳${shipping}`}
/>
<div className="my-3 border-t border-dashed border-border" />
<Row label={t.total} value={`৳${total}`} bold />
</div>
<Button
type="submit"
form="order-form"
size="lg"
className={cn("mt-6 h-12 w-full text-base", (selectedEntries.length === 0 || isSubmitting) && "opacity-60")}
disabled={selectedEntries.length === 0 || isSubmitting}
>
{isSubmitting ? (lang === "bn" ? "পাঠানো হচ্ছে..." : "Submitting...") : t.confirm}
</Button>
<p className="mt-3 text-center text-xs text-muted-foreground">{t.cod}</p>
</div>
</aside>
</div>
</div>
</section>

<section className="bg-card py-12">
<div className="mx-auto max-w-4xl px-4">
<h2 className="text-center text-2xl font-bold">{t.feesTitle}</h2>
<div className="mt-6 overflow-hidden rounded-2xl border border-border">
<table className="w-full text-sm">
<thead className="bg-accent text-accent-foreground">
<tr>
<th className="px-4 py-3 text-left">{t.pkg}</th>
<th className="px-4 py-3 text-left">{t.courierAll}</th>
<th className="px-4 py-3 text-left">{t.homeDel}</th>
</tr>
</thead>
<tbody>
{(["10", "20", "40"] as Pkg[]).map((p) => (
<tr key={p} className="border-t border-border bg-background">
<td className="px-4 py-3 font-semibold">{p} KG</td>
<td className="px-4 py-3">৳{DELIVERY_FEES.courier[p]}</td>
<td className="px-4 py-3">৳{DELIVERY_FEES.home[p]}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</section>

<footer className="border-t border-border bg-card py-8">
<div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
<div className="flex items-center justify-center gap-3">
<img src="/amerbari-logo.png" alt="" className="h-11 w-11 object-contain" />
<p className="text-lg font-bold text-foreground">{t.brand}</p>
</div>
<p className="mt-1">{t.footerTag}</p>
<div className="mt-4 flex justify-center">
<a href="https://www.facebook.com/ammerbari.bd" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
<Facebook className="h-5 w-5 text-[#1877F2]" />
<span className="text-sm font-medium">{t.fbLink}</span>
</a>
</div>
<p className="mt-4 text-xs">📍 {t.location} • © {new Date().getFullYear()}</p>
</div>
</footer>

{ENABLE_FAKE_ORDER_TOASTS && activityToast && (
<div
key={activityToast.id}
className="pointer-events-none fixed bottom-4 left-4 z-[60] max-w-[min(22rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-bottom-3 slide-in-from-left-2 duration-500"
role="status"
aria-live="polite"
>
<div className="flex gap-2.5 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:gap-3 sm:px-3.5">
<ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
<p className="text-xs leading-snug text-foreground sm:text-[13px]">{activityToast.text}</p>
</div>
</div>
)}
</div>
);
}

function Card({ step, title, children, action }: { step: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
return (
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
<div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
<div className="flex min-w-0 items-center gap-3">
<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
{step}
</span>
<h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
</div>
{action}
</div>
{children}
</div>
);
}

function DeliveryOption({ active, onClick, icon, title, sub, note }: {
active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string; note: string;
}) {
return (
<button type="button" onClick={onClick}
className={cn("flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
active ? "border-primary bg-accent/40" : "border-border bg-card hover:border-primary/40")}>
<span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
{icon}
</span>
<div className="flex-1">
<p className="text-sm font-bold">{title}</p>
<p className="text-sm text-primary">{sub}</p>
<p className="mt-1 text-xs text-muted-foreground">{note}</p>
</div>
</button>
);
}

function Field({ label, required, optional, optionalLabel, icon, prefix, placeholder, value, onChange, type, inputMode, maxLength, pattern, title: fieldTitle, hasError }: {
label: string; required?: boolean; optional?: boolean; optionalLabel?: string;
icon?: React.ReactNode; prefix?: string; placeholder?: string;
value: string; onChange: (v: string) => void;
type?: string; inputMode?: string; maxLength?: number; pattern?: string; title?: string; hasError?: boolean;
}) {
return (
<div className="space-y-2">
<Label className="text-sm font-semibold">
{label}{" "}
{required && <span className="text-destructive">*</span>}
{optional && <span className="text-xs font-normal text-muted-foreground">{optionalLabel}</span>}
</Label>
<div className="relative flex items-stretch">
{icon && (
<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
{icon}
</span>
)}
{prefix && (
<span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium">
{prefix}
</span>
)}
<Input
  value={value}
  onChange={(e) => onChange(e.target.value)}
  placeholder={placeholder}
  type={type}
  inputMode={inputMode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
  maxLength={maxLength}
  pattern={pattern}
  title={fieldTitle}
  className={cn("h-11", icon && !prefix && "pl-9", prefix && "rounded-l-none", hasError && "border-destructive focus-visible:ring-destructive")}
/>
</div>
</div>
);
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
return (
<div className={cn("flex items-center justify-between", bold && "text-base font-bold")}>
<dt className={cn(!bold && "text-muted-foreground")}>{label}</dt>
<dd>{value}</dd>
</div>
);
}

export default function App() {
return (
<Routes>
<Route path="/" element={<Landing />} />
<Route path="/order-confirmation" element={<OrderConfirmation />} />
<Route path="/thank-you" element={<OrderConfirmation />} />
</Routes>
);
}

