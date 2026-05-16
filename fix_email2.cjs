const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandleSubmit = `  const navigate = useNavigate();
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
      const res = await fetch("https://formsubmit.co/ajax/contact@ammerbari.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          email: form.email || "No email provided",
          area: form.area,
          address: form.address,
          variety: t.varieties[variety].name,
          package_kg: pkg,
          total_price: total.toString(),
          order_reference: orderRef,
          _subject: \`New Pre-Order from \${form.name}\`,
          _captcha: "false"
        })
      });
      
      const data = await res.json();
      
      toast.dismiss("submit-toast");
      if (res.ok) {
        navigate('/thank-you');
      } else {
        console.error("FormSubmit Error:", data);
        toast.error(data.message || "Failed to submit order. Please try again.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.dismiss("submit-toast");
      toast.error("Network error. Please check your connection or turn off ad-blocker.");
    }
  };`;

const newHandleSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    if (!form.name || !form.mobile || !form.area || !form.address) {
      e.preventDefault();
      toast.error(t.fillAll);
      return;
    }
    // Form is valid! Allow the browser to proceed with standard HTML form submission.
  };`;

content = content.replace(oldHandleSubmit, newHandleSubmit);

const oldFormTag = `<form id="order-form" onSubmit={handleSubmit} className="space-y-5">`;

const newFormTag = `<form id="order-form" action="https://formsubmit.co/contact@ammerbari.com" method="POST" onSubmit={handleSubmit} className="space-y-5">
                  <input type="hidden" name="_next" value={window.location.origin + "/thank-you"} />
                  <input type="hidden" name="_subject" value={\`New Pre-Order from \${form.name}\`} />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="Name" value={form.name} />
                  <input type="hidden" name="Mobile" value={form.mobile} />
                  <input type="hidden" name="Email" value={form.email || "No email provided"} />
                  <input type="hidden" name="Area" value={form.area} />
                  <input type="hidden" name="Address" value={form.address} />
                  <input type="hidden" name="Variety" value={t.varieties[variety].name} />
                  <input type="hidden" name="Package_KG" value={pkg} />
                  <input type="hidden" name="Delivery" value={delivery === "home" ? "Home Delivery" : "Courier"} />
                  <input type="hidden" name="Total_Price" value={\`৳\${total}\`} />
                  <input type="hidden" name="Order_Reference" value={orderRef} />`;

content = content.replace(oldFormTag, newFormTag);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed submit function using native HTML form action.');
