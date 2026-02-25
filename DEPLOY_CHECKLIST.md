# Deployment checklist

## 1) Frontend (Endora WebFTP)
Upload the contents of `dist/` into `/web/frakkturresurgence/`:
- `index.html`
- `.htaccess`
- `assets/`
- `favicon.ico`
- `robots.txt`
- `placeholder.svg`

## 2) Backend (Node host like Render/Railway)
Deploy folder: `server/`

Required environment variables:
- `PORT=4000`
- `CLIENT_ORIGIN=https://testdomain-pp.mzf.cz`
- `APP_BASE_URL=https://testdomain-pp.mzf.cz/frakkturresurgence`
- `JWT_SECRET=<long random secret>`
- `DB_HOST=<your mysql host>`
- `DB_PORT=3306`
- `DB_USER=<your mysql user>`
- `DB_PASSWORD=<your mysql password>`
- `DB_NAME=<your mysql db>`
- `EMAIL_FROM=<sender>`
- `EMAIL_HOST=<smtp host>`
- `EMAIL_PORT=587`
- `EMAIL_USER=<smtp username>`
- `EMAIL_PASS=<smtp password>`
- `EMAIL_SECURE=false`

Start command:
- `npm run start`

## 3) Connect frontend to backend API
In root `.env.production` set:
- `VITE_PUBLIC_BASE=/frakkturresurgence/`
- `VITE_API_URL=https://<your-backend-domain>`

Then run:
- `npm run build`

Upload `dist/` contents again to Endora.
