const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSubmit = `    const formData = new FormData();
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
    }`;

const newSubmit = `    try {
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
    }`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed submit function.');
