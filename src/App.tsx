import { useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Check, Leaf, Phone, ShieldCheck, Truck, User, MapPin, Mail, Home, Languages, Facebook } from "lucide-react";
import UPAZILAS_DATA from "./upazilas.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import logo from "@/assets/amerbari-logo.png";
import heroImg from "@/assets/Real mango pic.webp";
import nengraImg from "@/assets/nengra.jpg";
import amropaliImg from "@/assets/amropali.jpg";
import himsagorImg from "@/assets/khirsapat.jpg";
import bari4Img from "@/assets/bari4.jpg";

type Lang = "bn" | "en";
type Variety = "nengra" | "amropali" | "himsagor" | "bari4";
type Pkg = "10" | "20" | "40";
type Delivery = "courier" | "home";

const T = {
bn: {
brand: "আমের বাড়ি",
tagline: "রাজশাহীর আম, সবার প্রিয় নাম",
callUs: "+৮৮০ ১৮১৬৫১০১১৭",
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
placeOrderSub: "আম বাছাই করুন, প্যাকেজ নির্বাচন করুন, ডেলিভারির ঠিকানা দিন।",
step1: "আমের জাত নির্বাচন করুন",
step2: "প্যাকেজের আকার বেছে নিন",
step3: "ডেলিভারি পদ্ধতি",
step4: "ডেলিভারির তথ্য",
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
address: "সম্পূর্ণ ঠিকানা",
addressPh: "বাড়ি নং, রোড নং, এলাকা, থানা...",
summary: "প্রি-অর্ডার সারাংশ",
mangoLine: (kg: string, p: number) => `আম (${kg}কেজি × ৳${p})`,
deliveryCharge: "ডেলিভারি চার্জ",
total: "সর্বমোট",
confirm: "প্রি-অর্ডার নিশ্চিত করুন",
cod: "ক্যাশ অন ডেলিভারি উপলব্ধ। আমরা কনফার্মের জন্য কল করব।",
feesTitle: "ডেলিভারি চার্জ",
pkg: "প্যাকেজ",
courierAll: "কুরিয়ার (সারা বাংলাদেশ)",
homeDel: "হোম ডেলিভারি",
fillAll: "অনুগ্রহ করে সব আবশ্যক ঘর পূরণ করুন।",
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
placeOrderSub: "Choose your mango, pick a package, and tell us where to deliver.",
step1: "Select Mango Variety",
step2: "Choose Package Size",
step3: "Delivery Method",
step4: "Delivery Details",
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
address: "Full Address",
addressPh: "House No, Road No, Area, Thana...",
summary: "Pre-Order Summary",
mangoLine: (kg: string, p: number) => `Mango (${kg}kg × ৳${p})`,
deliveryCharge: "Delivery charge",
total: "Total",
confirm: "Confirm Pre-Order",
cod: "Cash on delivery available. We'll call to confirm.",
feesTitle: "Delivery Charges",
pkg: "Package",
courierAll: "Courier (All BD)",
homeDel: "Home Delivery",
fillAll: "Please fill in all required fields.",
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

const DISTRICTS = Object.keys(UPAZILAS_DATA).sort();
const DISTRICTS_BN: Record<string, string> = {
"Bagerhat": "বাগেরহাট", "Bandarban": "বান্দরবান", "Barguna": "বরগুনা", "Barishal": "বরিশাল", "Bhola": "ভোলা", "Bogura": "বগুড়া", "Brahmanbaria": "ব্রাহ্মণবাড়িয়া", "Chandpur": "চাঁদপুর",
"Chattogram": "চট্টগ্রাম", "Chuadanga": "চুয়াডাঙ্গা", "Cox's Bazar": "কক্সবাজার", "Cumilla": "কুমিল্লা", "Dhaka": "ঢাকা", "Dinajpur": "দিনাজপুর", "Faridpur": "ফরিদপুর", "Feni": "ফেনী",
"Gaibandha": "গাইবান্ধা", "Gazipur": "গাজীপুর", "Gopalganj": "গোপালগঞ্জ", "Habiganj": "হবিগঞ্জ", "Jamalpur": "জামালপুর", "Jashore": "যশোর", "Jhalokati": "ঝালকাঠি", "Jhenaidah": "ঝিনাইদহ",
"Joypurhat": "জয়পুরহাট", "Khagrachhari": "খাগড়াছড়ি", "Khulna": "খুলনা", "Kishoreganj": "কিশোরগঞ্জ", "Kurigram": "কুড়িগ্রাম", "Kushtia": "কুষ্টিয়া", "Lakshmipur": "লক্ষ্মীপুর", "Lalmonirhat": "লালমনিরহাট",
"Madaripur": "মাদারীপুর", "Magura": "মাগুরা", "Manikganj": "মানিকগঞ্জ", "Meherpur": "মেহেরপুর", "Moulvibazar": "মৌলভীবাজার", "Munshiganj": "মুন্সীগঞ্জ", "Mymensingh": "ময়মনসিংহ", "Naogaon": "নওগাঁ",
"Narail": "নড়াইল", "Narayanganj": "নারায়ণগঞ্জ", "Narsingdi": "নরসিংদী", "Natore": "নাটোর", "Netrokona": "নেত্রকোনা", "Nilphamari": "নীলফামারী", "Noakhali": "নোয়াখালী", "Pabna": "পাবনা",
"Panchagarh": "পঞ্চগড়", "Patuakhali": "পটুয়াখালী", "Pirojpur": "পিরোজপুর", "Rajbari": "রাজবাড়ী", "Rajshahi": "রাজশাহী", "Rangamati": "রাঙ্গামাটি", "Rangpur": "রংপুর", "Satkhira": "সাতক্ষীরা",
"Shariatpur": "শরীয়তপুর", "Sherpur": "শেরপুর", "Sirajganj": "সিরাজগঞ্জ", "Sunamganj": "সুনামগঞ্জ", "Sylhet": "সিলেট", "Tangail": "টাঙ্গাইল", "Thakurgaon": "ঠাকুরগাঁও"
};

const PACKAGE_KG: Record<Pkg, number> = { "10": 10, "20": 20, "40": 40 };
const DELIVERY_FEES: Record<Delivery, Record<Pkg, number>> = {
courier: { "10": 200, "20": 200, "40": 300 },
home: { "10": 350, "20": 450, "40": 700 },
};

function Landing() {
const [lang, setLang] = useState<Lang>("bn");
const t = T[lang];
const [variety, setVariety] = useState<Variety>("himsagor");
const [pkg, setPkg] = useState<Pkg>("10");
const [delivery, setDelivery] = useState<Delivery>("courier");
const [form, setForm] = useState({ name: "", mobile: "", email: "", area: "", upazila: "", address: "" });
const [mobileError, setMobileError] = useState("");

const subtotal = PACKAGE_KG[pkg] * PRICE_PER_KG[variety];
const shipping = DELIVERY_FEES[delivery][pkg];
const total = subtotal + shipping;
const orderRef = useMemo(() => "ORD-" + Math.floor(Math.random() * 90000 + 10000), []);

const navigate = useNavigate();

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

const handleSubmit = (e: React.FormEvent) => {
  if (!form.name || !form.mobile || !form.area || !form.upazila || !form.address) {
    e.preventDefault();
    toast.error(t.fillAll);
    return;
  }
  if (!validateMobile(form.mobile)) {
    e.preventDefault();
    setMobileError(t.mobileError);
    toast.error(t.mobileError);
    return;
  }
  setMobileError("");
};

return (
<div className="min-h-screen bg-background text-foreground" lang={lang}>
<Toaster position="top-center" richColors />

{/* Top bar */}
<header className="border-b border-border bg-card">
<div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
<div className="flex items-center gap-3">
<img src={logo} alt={`${t.brand} logo`} className="h-12 w-12 rounded-lg object-contain" />
<div>
<p className="text-sm font-bold leading-tight">{t.brand}</p>
<p className="text-xs text-muted-foreground leading-tight">{t.tagline}</p>
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
href="tel:+8801816510117"
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
<Card step="1" title={t.step1}>
<div className="grid gap-4 sm:grid-cols-3">
{(Object.keys(VARIETY_IMG) as Variety[]).map((key) => {
const v = t.varieties[key];
const active = variety === key;
return (
<button type="button" key={key} onClick={() => setVariety(key)}
className={cn("group relative overflow-hidden rounded-xl border-2 bg-card p-3 text-left transition-all",
active ? "border-primary shadow-[var(--shadow-soft)]" : "border-border hover:border-primary/40")}>
<div className="aspect-square overflow-hidden rounded-lg">
<img src={VARIETY_IMG[key]} alt={v.name} loading="lazy"
className="h-full w-full object-cover transition-transform group-hover:scale-105" />
</div>
<div className="mt-3">
<p className="text-sm font-bold">{v.name}</p>
<p className="text-xs text-muted-foreground">{v.sub}</p>
<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{v.desc}</p>
</div>
{active && (
<span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
<Check className="h-3.5 w-3.5" />
</span>
)}
</button>
);
})}
</div>
</Card>

<Card step="2" title={t.step2}>
<div className="grid gap-3 sm:grid-cols-3">
{(Object.keys(PACKAGE_KG) as Pkg[]).map((p) => {
const active = pkg === p;
return (
<button type="button" key={p} onClick={() => setPkg(p)}
className={cn("rounded-xl border-2 p-4 text-left transition-all",
active ? "border-primary bg-accent/40" : "border-border bg-card hover:border-primary/40")}>
<p className="text-2xl font-extrabold">{p} KG</p>
<p className="mt-1 text-sm text-muted-foreground">৳{PACKAGE_KG[p] * PRICE_PER_KG[variety]}</p>
<p className="mt-1 text-xs text-muted-foreground">{t.pkgSub[p]}</p>
</button>
);
})}
</div>
</Card>

<Card step="3" title={t.step3}>
<div className="grid gap-3 sm:grid-cols-2">
<DeliveryOption active={delivery === "courier"} onClick={() => setDelivery("courier")}
icon={<Truck className="h-5 w-5" />} title={t.courier}
sub={t.courierFee(DELIVERY_FEES.courier[pkg])} note={t.courierNote} />
<DeliveryOption active={delivery === "home"} onClick={() => setDelivery("home")}
icon={<Home className="h-5 w-5" />} title={t.home}
sub={t.courierFee(DELIVERY_FEES.home[pkg])} note={t.homeNote} />
</div>
</Card>

<Card step="4" title={t.step4}>
<form id="order-form" action="https://api.web3forms.com/submit" method="POST" onSubmit={handleSubmit} className="space-y-5">
{/* Replace b814ca83-3d5c-4008-a828-72c4352e69d7 with the key sent to your email */}
<input type="hidden" name="access_key" value="b814ca83-3d5c-4008-a828-72c4352e69d7" />
<input type="hidden" name="redirect" value={window.location.origin + "/thank-you"} />
<input type="hidden" name="subject" value={`New Pre-Order from ${form.name}`} />
{/* Optional: Add from_name to see the customer name as the sender name */}
<input type="hidden" name="from_name" value="Mango Mania Pre-Order" />
<input type="hidden" name="Name" value={form.name} />
<input type="hidden" name="Mobile" value={form.mobile} />
<input type="hidden" name="Email" value={form.email || "No email provided"} />
<input type="hidden" name="District" value={form.area} />
<input type="hidden" name="Upazila" value={form.upazila} />
<input type="hidden" name="Address" value={form.address} />
<input type="hidden" name="Variety" value={t.varieties[variety].name} />
<input type="hidden" name="Package_KG" value={pkg} />
<input type="hidden" name="Delivery" value={delivery === "home" ? "Home Delivery" : "Courier"} />
<input type="hidden" name="Total_Price" value={`৳${total}`} />
<input type="hidden" name="Order_Reference" value={orderRef} />
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

{form.area && UPAZILAS_DATA[form.area as keyof typeof UPAZILAS_DATA] && (
<div className="space-y-2">
<Label className="text-sm font-semibold">
Upazila / Thana <span className="text-destructive">*</span>
</Label>
<Select required value={form.upazila} onValueChange={(v) => setForm({ ...form, upazila: v })}>
<SelectTrigger className="h-11">
<SelectValue placeholder="Select Upazila/Thana" />
</SelectTrigger>
<SelectContent>
{UPAZILAS_DATA[form.area as keyof typeof UPAZILAS_DATA].map((u: any) => (
<SelectItem key={u.en} value={u.en}>
{lang === "bn" ? u.bn : u.en}
</SelectItem>
))}
</SelectContent>
</Select>
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
<div className="mt-4 flex items-center gap-3 rounded-xl bg-accent/40 p-3">
<img src={VARIETY_IMG[variety]} alt={t.varieties[variety].name} loading="lazy"
className="h-14 w-14 rounded-lg object-cover" />
<div className="flex-1">
<p className="text-sm font-bold">{t.varieties[variety].name}</p>
<p className="text-xs text-muted-foreground">
{pkg} KG • {delivery === "home" ? t.home : t.courier}
</p>
</div>
</div>
<dl className="mt-5 space-y-2 text-sm">
<Row label={t.mangoLine(pkg, PRICE_PER_KG[variety])} value={`৳${subtotal}`} />
<Row label={t.deliveryCharge} value={`৳${shipping}`} />
<div className="my-3 border-t border-dashed border-border" />
<Row label={t.total} value={`৳${total}`} bold />
</dl>
<Button type="submit" form="order-form" size="lg" className="mt-6 h-12 w-full text-base">
{t.confirm}
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
<div className="flex items-center justify-center gap-2">
<img src={logo} alt="" className="h-8 w-8 object-contain" />
<p className="font-semibold text-foreground">{t.brand}</p>
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
</div>
);
}

function Card({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
return (
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
<div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
{step}
</span>
<h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
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

function ThankYou() {
const [lang] = useState<Lang>("bn");
return (
<div className="flex min-h-screen items-center justify-center bg-background px-4">
<div className="max-w-md text-center">
<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
<Check className="h-8 w-8" />
</div>
<h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
{lang === "bn" ? "ধন্যবাদ! আপনার প্রি-অর্ডারটি গৃহীত হয়েছে।" : "Thank you! Your pre-order has been received."}
</h1>
<p className="mt-2 text-sm text-muted-foreground">
{lang === "bn" ? "আমরা শীঘ্রই কনফার্মেশনের জন্য আপনার সাথে যোগাযোগ করব।" : "We will contact you shortly for confirmation."}
</p>
<div className="mt-6">
<Button asChild>
<a href="/">
{lang === "bn" ? "হোমপেজে ফিরে যান" : "Go back home"}
</a>
</Button>
</div>
</div>
</div>
);
}

export default function App() {
return (
<Routes>
<Route path="/" element={<Landing />} />
<Route path="/thank-you" element={<ThankYou />} />
</Routes>
);
}
