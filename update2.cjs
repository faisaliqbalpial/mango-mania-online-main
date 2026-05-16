const fs = require('fs');

// 1. Update main.tsx
let mainContent = fs.readFileSync('src/main.tsx', 'utf8');
if (!mainContent.includes('BrowserRouter')) {
  mainContent = mainContent.replace(
    'import App from "./App";',
    'import { BrowserRouter } from "react-router-dom";\nimport App from "./App";'
  );
  mainContent = mainContent.replace(
    '<App />',
    '<BrowserRouter>\n      <App />\n    </BrowserRouter>'
  );
  fs.writeFileSync('src/main.tsx', mainContent, 'utf8');
}

// 2. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Import react-router-dom and update react imports
appContent = appContent.replace(
  'import { useMemo, useState } from "react";',
  'import { useMemo, useState } from "react";\nimport { Routes, Route, useNavigate } from "react-router-dom";'
);

// Rename App to Landing
appContent = appContent.replace(
  'export default function App() {',
  'function Landing() {'
);

// Replace handleSubmit
const oldHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.area || !form.address) {
      toast.error(t.fillAll);
      return;
    }
    toast.success(t.ordered(orderRef), {
      description: \`\${t.varieties[variety].name} • \${pkg}kg • ৳\${total}\`,
    });
  };`;

const newHandleSubmit = `  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.area || !form.address) {
      toast.error(t.fillAll);
      return;
    }
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("mobile", form.mobile);
    formData.append("email", form.email || "No email provided");
    formData.append("area", form.area);
    formData.append("address", form.address);
    formData.append("variety", t.varieties[variety].name);
    formData.append("package_kg", pkg);
    formData.append("total_price", total.toString());
    formData.append("order_reference", orderRef);
    formData.append("_subject", \`New Pre-Order from \${form.name}\`);
    formData.append("_captcha", "false");

    try {
      toast.loading("Submitting order...", { id: "submit-toast" });
      await fetch("https://formsubmit.co/ajax/contact@ammerbari.com", {
        method: "POST",
        body: formData
      });
      toast.dismiss("submit-toast");
      navigate('/thank-you');
    } catch (error) {
      toast.dismiss("submit-toast");
      toast.error("Failed to submit order. Please try again or call us.");
    }
  };`;

appContent = appContent.replace(oldHandleSubmit, newHandleSubmit);

// Append ThankYou and new App component
const newComponents = `

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
`;

appContent = appContent + newComponents;

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log('Successfully updated App.tsx and main.tsx');
