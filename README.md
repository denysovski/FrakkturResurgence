# FrakkturResurgence

React + Tailwind CSS ecommerce project.

## Repository

https://github.com/denysovski/FrakkturResurgence

## Tech stack

- React
- TypeScript
- Tailwind CSS
- Vite

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

## Deploy to shared hosting (WebFTP)

### 1) Configure frontend API URL (before build)

Create `.env.production` in the project root:

```dotenv
VITE_API_URL=https://api.your-domain.com
VITE_PUBLIC_BASE=/
```

Use `VITE_PUBLIC_BASE=/` when app is in domain root. If app is inside a subfolder, set it to that folder with leading/trailing slash (example: `VITE_PUBLIC_BASE=/shop/`).

If your API is served from the same domain under `/api`, you can also use:

```dotenv
VITE_API_URL=
```

### 2) Build

```sh
npm run build
```

### 3) Upload via WebFTP

Upload the **contents** of `dist/` to your hosting web root (`public_html` or `www`):

- `dist/index.html`
- `dist/assets/`
- `dist/.htaccess`
- `dist/favicon.ico`
- `dist/robots.txt`
- `dist/placeholder.svg`

Do **not** upload source/dev files like `src/`, `server/`, `node_modules/`, `.env*`, `package.json`.

### Blank page quick fix checklist

1. Open browser DevTools → Network and reload. If `assets/index-*.js` is 404, base path is wrong.
2. Set correct `VITE_PUBLIC_BASE` in `.env.production`, rebuild, and re-upload full `dist/` contents.
3. Ensure `index.html` is in web root, not inside an extra nested `dist` folder.
4. Keep `.htaccess` present in web root for SPA routing.

### 4) Backend requirement

This app uses API endpoints (`/api/...`) for auth, products, cart, and wishlist. The Node server must be hosted separately (or reverse-proxied) and CORS/origin must be configured.

## GitHub Pages deployment

This repository now includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

After enabling GitHub Pages in repository settings (Build and deployment source: **GitHub Actions**), every push to `main` deploys the latest build automatically.
