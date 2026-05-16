const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update JS Regex
content = content.replace(
  'const bdPhoneRegex = /^(?:\\+8801|01|1)[3-9]\\d{8}$/;',
  'const bdPhoneRegex = /^01[3-9]\\d{8}$/;'
);

// Update HTML Field Pattern
const oldField = `<Field label={t.mobile} required icon={<span className="text-base">🇧🇩</span>}
                      prefix="+880" placeholder="1XXXXXXXXX" value={form.mobile}
                      pattern="^(?:\\+8801|01|1)[3-9]\\d{8}$" title="Please enter a valid Bangladeshi mobile number"
                      type="tel"
                      onChange={(v) => setForm({ ...form, mobile: v })} />`;

const newField = `<Field label={t.mobile} required icon={<span className="text-base">🇧🇩</span>}
                      placeholder="01XXXXXXXXX" value={form.mobile}
                      pattern="^01[3-9]\\d{8}$" title="Phone number must be exactly 11 digits starting with 01"
                      type="tel"
                      onChange={(v) => setForm({ ...form, mobile: v })} />`;

content = content.replace(oldField, newField);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Updated phone validation to 11 digits');
