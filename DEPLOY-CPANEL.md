# Deploy Amerbari to cPanel (leave Netlify)

This site is a **static React app** (Vite build). cPanel only needs the built files in `public_html` — no Node.js on the server required.

## 1. Build on your computer

```bash
npm install
npm run build
```

This creates a `dist/` folder. The `.htaccess` file is copied into `dist/` automatically from `public/.htaccess`.

## 2. Upload to cPanel

1. Log in to **cPanel** → **File Manager**
2. Open **`public_html`** (or the folder for `ammerbari.com` / `www.ammerbari.com`)
3. **Delete old site files** in that folder (keep backups if needed), or use a subfolder only if you know what you're doing
4. Upload **everything inside `dist/`** — not the `dist` folder itself

   Example — `public_html` should contain:

   - `index.html`
   - `.htaccess`
   - `assets/` (JS, CSS, images)
   - `amerbari-logo.png`
   - `fonts/` (if present in dist)

   Easiest: zip `dist` contents locally, upload zip to cPanel, **Extract** in `public_html`.

## 3. Domain & SSL

1. In cPanel → **Domains** — point `ammerbari.com` to `public_html` (or addon domain docroot)
2. At your domain registrar, set nameservers to your host’s cPanel nameservers (or A record to server IP)
3. Enable **SSL** (cPanel → **SSL/TLS Status** → Run **AutoSSL**)

## 4. Turn off Netlify (after cPanel works)

1. In [Netlify](https://app.netlify.com) → your site → **Domain management** — remove custom domain `ammerbari.com` (or delete site)
2. At registrar/DNS, stop pointing the domain to Netlify (remove Netlify DNS / ALIAS records)
3. Wait for DNS to propagate (minutes to 48 hours)

## 5. Quick checks after upload

- Home page loads: `https://ammerbari.com/`
- Order flow works (add to cart, form submit)
- Confirmation page: place a test order → `/order-confirmation`
- PDF download works (fonts are bundled in JS — no `/fonts/` required, but upload full `dist` anyway)

## 6. Updating the site later

Each time you change code:

```bash
git pull
npm install
npm run build
```

Then re-upload **contents of `dist/`** to `public_html` (overwrite files).

Optional — create a zip on Windows:

```powershell
npm run build
npm run pack:cpanel
```

Upload `amerbari-cpanel-deploy.zip` from the project root and extract in File Manager.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| 404 on refresh (`/order-confirmation`) | Ensure `.htaccess` is in `public_html` and **AllowOverride** / `mod_rewrite` is enabled (ask host) |
| Blank page | Open browser DevTools → Console; often a wrong path — site must be at domain **root** or set Vite `base` in `vite.config.ts` |
| Old Netlify site still shows | DNS still points to Netlify — update nameservers/A record to cPanel |
| PDF fails | Hard refresh; ensure latest `dist` uploaded (fonts are inside JS bundle) |

## GitHub

Code stays on GitHub: `https://github.com/faisaliqbalpial/mango-mania-online-main`

cPanel does **not** replace GitHub — it only **hosts the built website**. You can keep using Git for source control and build locally (or on any machine with Node), then upload `dist/`.
