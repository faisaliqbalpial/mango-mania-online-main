const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. We need to add the upazila JSON file import and upazila state.
// Find the imports
content = content.replace(
  'import { Check, Leaf, Phone, ShieldCheck, Truck, User, MapPin, Mail, Home, Languages } from "lucide-react";',
  'import { Check, Leaf, Phone, ShieldCheck, Truck, User, MapPin, Mail, Home, Languages } from "lucide-react";\nimport UPAZILAS_DATA from "./upazilas.json";'
);

// 2. Update DISTRICTS to match upazilas.json keys exactly so mapping works.
const newDistrictsDecl = `const DISTRICTS = Object.keys(UPAZILAS_DATA).sort();`;

// Replace old DISTRICTS array
content = content.replace(/const DISTRICTS = \[\s*[\s\S]*?\];/, newDistrictsDecl);

// 3. Add upazila state to form state
content = content.replace(
  'const [form, setForm] = useState({ name: "", mobile: "", email: "", area: "", address: "" });',
  'const [form, setForm] = useState({ name: "", mobile: "", email: "", area: "", upazila: "", address: "" });'
);

// 4. Reset upazila when district changes
content = content.replace(
  '<Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>^{^}^{^}',
  '<Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v, upazila: "" })}>'
);

// We need to write a string replace for the Area dropdown
const areaDropdown = `<div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      {t.area} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>`;

const areaDropdownNew = `<div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      {t.area} (District) <span className="text-destructive">*</span>
                    </Label>
                    <Select required value={form.area} onValueChange={(v) => setForm({ ...form, area: v, upazila: "" })}>`;

content = content.replace(areaDropdown, areaDropdownNew);

// 5. Add Upazila dropdown right after District dropdown
const districtSelectContentEnd = `</SelectContent>
                    </Select>
                  </div>`;

const upazilaDropdown = `</SelectContent>
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
                  )}`;

content = content.replace(districtSelectContentEnd, upazilaDropdown);

// 6. Update hidden inputs to include Upazila
content = content.replace(
  '<input type="hidden" name="Area" value={form.area} />',
  '<input type="hidden" name="District" value={form.area} />\n                  <input type="hidden" name="Upazila" value={form.upazila} />'
);

// 7. Update form validation
const formCheckOld = `if (!form.name || !form.mobile || !form.area || !form.address) {`;
const formCheckNew = `if (!form.name || !form.mobile || !form.area || !form.upazila || !form.address) {`;
content = content.replace(formCheckOld, formCheckNew);

// 8. Update Field component to pass standard HTML5 validation attributes
const fieldOld = `function Field({ label, value, onChange, placeholder, icon, prefix, required, optional, optionalLabel }: any) {
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
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={cn("h-11", icon && !prefix && "pl-9", prefix && "rounded-l-none")} />
      </div>
    </div>
  );
}`;

const fieldNew = `function Field({ label, value, onChange, placeholder, icon, prefix, required, optional, optionalLabel, type, pattern, title }: any) {
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
        <Input type={type || "text"} required={required} pattern={pattern} title={title} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={cn("h-11", icon && !prefix && "pl-9", prefix && "rounded-l-none")} />
      </div>
    </div>
  );
}`;

content = content.replace(fieldOld, fieldNew);

// 9. Add HTML5 pattern validation to mobile and email Field usage
const mobileOld = `<Field label={t.mobile} required icon={<span className="text-base">🇧🇩</span>}
                      prefix="+880" placeholder="1XXXXXXXXX" value={form.mobile}
                      onChange={(v) => setForm({ ...form, mobile: v })} />`;

const mobileNew = `<Field label={t.mobile} required icon={<span className="text-base">🇧🇩</span>}
                      prefix="+880" placeholder="1XXXXXXXXX" value={form.mobile}
                      pattern="^(?:\\+8801|01|1)[3-9]\\d{8}$" title="Please enter a valid Bangladeshi mobile number"
                      type="tel"
                      onChange={(v) => setForm({ ...form, mobile: v })} />`;

content = content.replace(mobileOld, mobileNew);

const emailOld = `<Field label={t.email} optional optionalLabel={t.optional}
                      icon={<Mail className="h-4 w-4" />} placeholder="you@example.com"
                      value={form.email} onChange={(v) => setForm({ ...form, email: v })} />`;

const emailNew = `<Field label={t.email} optional optionalLabel={t.optional}
                      type="email"
                      icon={<Mail className="h-4 w-4" />} placeholder="you@example.com"
                      value={form.email} onChange={(v) => setForm({ ...form, email: v })} />`;

content = content.replace(emailOld, emailNew);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Added upazilas dropdown and native HTML5 validation constraints');
