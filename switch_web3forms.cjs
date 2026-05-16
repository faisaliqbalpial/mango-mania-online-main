const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFormTag = `<form id="order-form" action="https://formsubmit.co/contact@ammerbari.com" method="POST" onSubmit={handleSubmit} className="space-y-5">
                  <input type="hidden" name="_next" value={window.location.origin + "/thank-you"} />
                  <input type="hidden" name="_subject" value={\`New Pre-Order from \${form.name}\`} />
                  <input type="hidden" name="_captcha" value="false" />`;

const newFormTag = `<form id="order-form" action="https://api.web3forms.com/submit" method="POST" onSubmit={handleSubmit} className="space-y-5">
                  {/* Replace YOUR_WEB3FORMS_ACCESS_KEY with the key sent to your email */}
                  <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
                  <input type="hidden" name="redirect" value={window.location.origin + "/thank-you"} />
                  <input type="hidden" name="subject" value={\`New Pre-Order from \${form.name}\`} />
                  {/* Optional: Add from_name to see the customer name as the sender name */}
                  <input type="hidden" name="from_name" value="Mango Mania Pre-Order" />`;

content = content.replace(oldFormTag, newFormTag);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Switched to Web3Forms');
