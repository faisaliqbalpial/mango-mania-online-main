const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace DISTRICTS and DISTRICTS_BN
const oldDistricts = `const DISTRICTS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Barishal",
  "Rangpur", "Mymensingh", "Cumilla", "Narayanganj", "Gazipur", "Other",
];
const DISTRICTS_BN: Record<string, string> = {
  Dhaka: "ঢাকা", Chattogram: "চট্টগ্রাম", Rajshahi: "রাজশাহী", Khulna: "খুলনা",
  Sylhet: "সিলেট", Barishal: "বরিশাল", Rangpur: "রংপুর", Mymensingh: "ময়মনসিংহ",
  Cumilla: "কুমিল্লা", Narayanganj: "নারায়ণগঞ্জ", Gazipur: "গাজীপুর", Other: "অন্যান্য",
};`;

const newDistricts = `const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur",
  "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur", "Feni",
  "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah",
  "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat",
  "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira",
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
];
const DISTRICTS_BN: Record<string, string> = {
  "Bagerhat": "বাগেরহাট", "Bandarban": "বান্দরবান", "Barguna": "বরগুনা", "Barishal": "বরিশাল", "Bhola": "ভোলা", "Bogura": "বগুড়া", "Brahmanbaria": "ব্রাহ্মণবাড়িয়া", "Chandpur": "চাঁদপুর",
  "Chattogram": "চট্টগ্রাম", "Chuadanga": "চুয়াডাঙ্গা", "Cox's Bazar": "কক্সবাজার", "Cumilla": "কুমিল্লা", "Dhaka": "ঢাকা", "Dinajpur": "দিনাজপুর", "Faridpur": "ফরিদপুর", "Feni": "ফেনী",
  "Gaibandha": "গাইবান্ধা", "Gazipur": "গাজীপুর", "Gopalganj": "গোপালগঞ্জ", "Habiganj": "হবিগঞ্জ", "Jamalpur": "জামালপুর", "Jashore": "যশোর", "Jhalokati": "ঝালকাঠি", "Jhenaidah": "ঝিনাইদহ",
  "Joypurhat": "জয়পুরহাট", "Khagrachhari": "খাগড়াছড়ি", "Khulna": "খুলনা", "Kishoreganj": "কিশোরগঞ্জ", "Kurigram": "কুড়িগ্রাম", "Kushtia": "কুষ্টিয়া", "Lakshmipur": "লক্ষ্মীপুর", "Lalmonirhat": "লালমনিরহাট",
  "Madaripur": "মাদারীপুর", "Magura": "মাগুরা", "Manikganj": "মানিকগঞ্জ", "Meherpur": "মেহেরপুর", "Moulvibazar": "মৌলভীবাজার", "Munshiganj": "মুন্সীগঞ্জ", "Mymensingh": "ময়মনসিংহ", "Naogaon": "নওগাঁ",
  "Narail": "নড়াইল", "Narayanganj": "নারায়ণগঞ্জ", "Narsingdi": "নরসিংদী", "Natore": "নাটোর", "Netrokona": "নেত্রকোনা", "Nilphamari": "নীলফামারী", "Noakhali": "নোয়াখালী", "Pabna": "পাবনা",
  "Panchagarh": "পঞ্চগড়", "Patuakhali": "পটুয়াখালী", "Pirojpur": "পিরোজপুর", "Rajbari": "রাজবাড়ী", "Rajshahi": "রাজশাহী", "Rangamati": "রাঙ্গামাটি", "Rangpur": "রংপুর", "Satkhira": "সাতক্ষীরা",
  "Shariatpur": "শরীয়তপুর", "Sherpur": "শেরপুর", "Sirajganj": "সিরাজগঞ্জ", "Sunamganj": "সুনামগঞ্জ", "Sylhet": "সিলেট", "Tangail": "টাঙ্গাইল", "Thakurgaon": "ঠাকুরগাঁও"
};`;

content = content.replace(oldDistricts, newDistricts);

// Replace handleSubmit
const oldHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    if (!form.name || !form.mobile || !form.area || !form.address) {
      e.preventDefault();
      toast.error(t.fillAll);
      return;
    }
    // Form is valid! Allow the browser to proceed with standard HTML form submission.
  };`;

const newHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    if (!form.name || !form.mobile || !form.area || !form.address) {
      e.preventDefault();
      toast.error(t.fillAll);
      return;
    }
    
    const bdPhoneRegex = /^(?:\\+8801|01|1)[3-9]\\d{8}$/;
    if (!bdPhoneRegex.test(form.mobile.trim())) {
      e.preventDefault();
      toast.error(lang === "bn" ? "দয়া করে একটি বৈধ বাংলাদেশী মোবাইল নম্বর দিন (যেমন: ০১XXXXXXXXX)।" : "Please enter a valid Bangladeshi mobile number.");
      return;
    }

    if (form.email && form.email.trim() !== "") {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        e.preventDefault();
        toast.error(lang === "bn" ? "দয়া করে একটি বৈধ ইমেইল ঠিকানা দিন।" : "Please enter a valid email address.");
        return;
      }
    }
    // Form is valid! Allow the browser to proceed with standard HTML form submission.
  };`;

content = content.replace(oldHandleSubmit, newHandleSubmit);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Added 64 districts and validation');
