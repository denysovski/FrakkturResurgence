# Deployment checklist

## 1) Database (phpMyAdmin)
Import:
- `sql/FULL_IMPORT_ENDORA_SHARED.sql`

## 2) Frontend + PHP API (Endora WebFTP)
Upload the contents of `dist/` into `/web/frakkturresurgence/`:
- `index.html`
- `.htaccess`
- `assets/`
- `favicon.ico`
- `robots.txt`
- `placeholder.svg`
- `api/`

## 3) Configure frontend base
In root `.env.production` set:
- `VITE_PUBLIC_BASE=/frakkturresurgence/`

Then run:
- `npm run build`

Upload `dist/` contents again to Endora.
