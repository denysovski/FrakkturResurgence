# ENDORA DEPLOYMENT CHECKLIST - New Build Files

**Build Date:** May 2026
**Git Commit:** d40a94b (i18n + currency + auth fixes)
**Status:** ✅ Ready for Production

---

## 📦 NEW FILES TO UPLOAD (from `dist/` folder)

### Priority 1: CRITICAL - Upload First
- [ ] **index.html** → `/public_html/index.html`
  - Main HTML file (2.38 KB)
  - References all CSS/JS with cache-busting hashes
  - Contains SEO meta tags

### Priority 2: JAVASCRIPT FILES - Upload Second
- [ ] **assets/index-B4Ew6KXW.js** → `/public_html/assets/index-B4Ew6KXW.js`
  - Main app bundle (352.47 KB)
  - Contains all React components + business logic
  - **REPLACES:** Old vendor-ui.js

- [ ] **assets/vendor-react-erz9qOrx.js** → `/public_html/assets/vendor-react-erz9qOrx.js`
  - React library bundle (162.46 KB)
  - **REPLACES:** Old vendor-react.js

- [ ] **assets/vendor-ui-6RLSfnSX.js** → `/public_html/assets/vendor-ui-6RLSfnSX.js`
  - UI components bundle (13.76 KB)
  - shadcn/ui components pre-compiled

### Priority 3: STYLESHEETS - Upload Third
- [ ] **assets/index-D2p5FaiX.css** → `/public_html/assets/index-D2p5FaiX.css`
  - Main stylesheet (76.03 KB)
  - Contains all Tailwind CSS + custom styles
  - **REPLACES:** Old index.css

### Priority 4: ASSETS - Upload Fourth
- [ ] **assets/** (entire folder) → `/public_html/assets/`
  - All images, fonts, webp files
  - Copy ALL files (46 image files total)
  - Includes product photos, logos, backgrounds

### Priority 5: ROUTING - Upload Fifth
- [ ] **.htaccess** → `/public_html/.htaccess`
  - Apache rewrite rules for SPA routing
  - Ensures all routes redirect to index.html

### Priority 6: HELPERS - Upload Last (Optional)
- [ ] **robots.txt** → `/public_html/robots.txt`
  - SEO robots configuration

---

## 🎯 UPLOAD STRATEGY

### Via SFTP (Recommended)
```
Connect to: sftp://your-endora-host.cz
Username: your_sftp_user
Password: your_sftp_password

Navigate to: /public_html/

Upload these in order:
1. Delete old files:
   - OLD: index.js (if exists)
   - OLD: index.css (if exists)
   - OLD: vendor-react.js
   - OLD: vendor-ui.js

2. Upload new files:
   - index.html (replaces old)
   - assets/* (all files, including subfolders)
   - .htaccess (replaces old)
   - robots.txt (replaces old)
```

### Via File Manager (Endora Control Panel)
1. Go to Files → public_html
2. Upload `dist/index.html`
3. Upload entire `dist/assets/` folder
4. Upload `.htaccess`

---

## 🗑️ FILES TO DELETE ON ENDORA

Delete these OLD files from `/public_html/`:
- [ ] `index.js` (old file)
- [ ] `index.css` (old file)
- [ ] `vendor-react.js` (old file)
- [ ] `vendor-ui.js` (old file)

**Note:** Removing old files prevents conflicts and cache issues.

---

## ✅ VERIFICATION CHECKLIST

After uploading, verify:

- [ ] Homepage loads (https://your-domain.cz)
- [ ] Styles load correctly (no unstyled page)
- [ ] Navigation works (not just home page)
- [ ] Language dropdown shows 6 languages (top right)
- [ ] Currency dropdown shows 5 currencies (top right)
- [ ] Add item to cart works
- [ ] Checkout form appears
- [ ] Login/Register works
- [ ] Orders page loads (if logged in)
- [ ] No JavaScript errors (press F12 → Console tab)
- [ ] Refresh page → language/currency preference persists (cookies work)
- [ ] Login session persists (no "unauthorized" errors on refresh)

---

## 🔍 FILE SIZE REFERENCE

| File | Size | Type |
|------|------|------|
| index.html | 2.38 KB | HTML |
| index-B4Ew6KXW.js | 352.47 KB | JavaScript |
| index-D2p5FaiX.css | 76.03 KB | Stylesheet |
| vendor-react-erz9qOrx.js | 162.46 KB | JS (React) |
| vendor-ui-6RLSfnSX.js | 13.76 KB | JS (UI) |
| assets/ (all images) | ~2.8 MB | Images/WebP |
| **TOTAL** | **~3.4 MB** | All files |

---

## 🆕 NEW FEATURES IN THIS BUILD

✅ **Internationalization (i18n)**
- 6 languages: English (US), Czech, Slovak, German, Japanese, Chinese
- Language choice saved in cookie (365 days)
- All UI text translated

✅ **Multi-Currency Support**
- 5 currencies: EUR, CZK, USD, JPY, CNY
- Real exchange rates applied
- Currency choice saved in cookie (365 days)
- Prices auto-convert based on selected currency

✅ **Session Management Fix**
- App now verifies user session with server on load
- Fixes: "logged in but unauthorized" errors
- No more stale session issues

✅ **UI Improvements**
- Cart sidebar scrollbar no longer causes twitching/layout shift
- Smooth, stable scrolling experience
- "Sign up" button on landing page now routes to `/club`

---

## 📝 BACKEND REQUIREMENTS

**Still needed on Endora (already there):**
- [ ] `/public/auth.php` - Keep your local copy (don't upload new one)
- [ ] `/public/lib/db.php` - Database connection
- [ ] `/public/lib/` folder - Backend utilities
- [ ] `.env` file - With DB credentials filled in
- [ ] Database tables created (orders, order_items)

**Check these are still present:**
```bash
ls -la /public/
ls -la /public/lib/
cat /. env | grep DB_
```

---

## 🚨 TROUBLESHOOTING

### "White page" after upload
- Solution: Clear browser cache (Ctrl+F5)
- Check: Are all JS files in assets/ folder?
- Check: Is index.html in root?

### Styles not loading (unstyled page)
- Solution: Verify `index-D2p5FaiX.css` is in `/assets/`
- Solution: Check file is not truncated (should be 76 KB)
- Check browser console (F12) for 404 errors

### Language/Currency dropdowns not working
- Solution: May need to clear browser cache
- Check: Cookies enabled in browser?
- Check: JavaScript errors in console?

### Checkout failing with "invalid auth action"
- Solution: Verify `public/auth.php` is on server
- Solution: Check `.env` has correct DB credentials
- Check: Error logs on Endora

### Routes not working (404 on navigation)
- Solution: Verify `.htaccess` is in `/public_html/`
- Solution: Check Apache has mod_rewrite enabled
- Check: If Nginx, use nginx config from DEPLOYMENT.md

---

## 📋 BEFORE YOU START

1. **Backup your current site:**
   ```bash
   tar -czf backup_$(date +%Y%m%d).tar.gz /public_html/
   ```

2. **Get Endora credentials:**
   - [ ] SFTP host
   - [ ] SFTP username
   - [ ] SFTP password
   - [ ] Database host
   - [ ] Database user
   - [ ] Database password

3. **Have these ready:**
   - [ ] dist/ folder (from your local machine)
   - [ ] .env file (with DB credentials)
   - [ ] public/auth.php (keep local, don't upload new)

---

## ✅ POST-DEPLOYMENT

1. **Monitor error logs** (first 24 hours):
   - Check Endora error logs daily
   - Monitor payment processing
   - Check database for new orders

2. **Notify user** of new features:
   - Language options available
   - Currency options available
   - Better session handling

3. **Performance check:**
   - Page load time < 3 seconds
   - No console errors
   - All images load
   - Mobile responsive

---

## 🎯 QUICK REFERENCE

**Local Command to Prep Files:**
```bash
cd FrakkturResurgence
npm run build
# Files ready in dist/ folder
```

**SFTP Upload Command:**
```bash
sftp your_user@your-host.cz << EOF
cd /public_html
put -r dist/* .
put dist/.htaccess .
EOF
```

**Verify Upload:**
```bash
curl https://your-domain.cz -I
# Should return 200 OK
```

---

**Ready for Endora! 🚀**

Questions? Check DEPLOYMENT.md for full guide.

