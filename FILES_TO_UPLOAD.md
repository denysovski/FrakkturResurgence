# Frakktur Endora - Files to Upload

**Build Version:** d40a94b (May 2026)
**Total Size:** ~3.4 MB
**Type:** Vite React Build

---

## Step 1: Delete Old Files
```
/public_html/index.js          DELETE
/public_html/index.css         DELETE
/public_html/vendor-react.js   DELETE
/public_html/vendor-ui.js      DELETE
```

## Step 2: Upload New Files

### Main Files (Priority 1-3)
```
From: dist/index.html
To:   /public_html/index.html

From: dist/assets/index-B4Ew6KXW.js
To:   /public_html/assets/index-B4Ew6KXW.js

From: dist/assets/index-D2p5FaiX.css
To:   /public_html/assets/index-D2p5FaiX.css

From: dist/assets/vendor-react-erz9qOrx.js
To:   /public_html/assets/vendor-react-erz9qOrx.js

From: dist/assets/vendor-ui-6RLSfnSX.js
To:   /public_html/assets/vendor-ui-6RLSfnSX.js

From: dist/.htaccess
To:   /public_html/.htaccess
```

### All Image Files (Priority 4)
```
Copy entire folder:
From: dist/assets/
To:   /public_html/assets/

This includes 46 image files:
- *.webp (optimized product images)
- *.jpg (background/landing images)
- *.png (logos/icons)
```

---

## File Manifest

### Critical Files (Must Upload)
- [x] index.html (2.38 KB)
- [x] index-B4Ew6KXW.js (352.47 KB)
- [x] index-D2p5FaiX.css (76.03 KB)
- [x] vendor-react-erz9qOrx.js (162.46 KB)
- [x] vendor-ui-6RLSfnSX.js (13.76 KB)
- [x] .htaccess (rewrite rules)

### Image Assets (46 files)
```
Product Images:
- tee1-DTvMjhw6.webp
- tee2-BbtxnJnk.webp
- tee3-Dvt0ncTJ.webp
- tee4-BJTwcFac.webp
- tee5-B4HzNCJN.webp
- tee6-D_xfEHZH.webp
- tee7-DFoLuRSz.webp
- tee8-DO1pSope.webp
- tee9-BGGOMpy0.webp
- tee10-D7zsup-z.webp

Background Images:
- landing1-CB2S2J6W.png (2.4 MB)
- landing2-BFGo_ZY3.jpg (688 KB)
- landing3-Dy12-0LB.jpg (221 KB)
- image1-ca2CjfEL.jpg (202 KB)
- image2-DmNhS5y-.jpg (117 KB)
- image3-DtqwGxnU.jpg (163 KB)
- image4-BeiRbRqv.jpg (111 KB)
- image5-Biwmbout.jpg (193 KB)
- image6-CDkEx5u4.jpg (162 KB)
- image7-BwQukezN.jpg (129 KB)
- image8-BSfqOVy2.jpg (60 KB)

Logos:
- frakktur-logo-DqD8pVne.png (138 KB)
- frakktur-icon-invert-yfrm1TRx.png (12 KB)

Product Collections (20+ more .webp files):
- [All automatically included in assets/ folder]
```

---

## SFTP Commands Reference

**Connect:**
```bash
sftp your_username@your_host.endora.cz
# Enter password when prompted
```

**Navigate & Delete Old:**
```bash
cd /public_html
rm index.js
rm index.css
rm vendor-react.js
rm vendor-ui.js
```

**Upload New Files:**
```bash
put index.html
put .htaccess
put -r assets/
```

**Verify Upload:**
```bash
ls -lah index.html
ls -lah assets/ | head -20
exit
```

---

## Browser Test After Upload

Open: `https://your-domain.cz`

Test these:
1. [ ] Page loads with styles
2. [ ] Language dropdown (top right) - shows 6 options
3. [ ] Currency dropdown (top right) - shows 5 options
4. [ ] Add product to cart
5. [ ] Go to checkout
6. [ ] Click "Sign up" button → routes to /club
7. [ ] Try login
8. [ ] Refresh page → language/currency saved
9. [ ] F12 → Console → No red errors

---

## If Something's Wrong

**Checklist:**
- [ ] All files in correct folders?
- [ ] File names exactly match (case-sensitive on Linux)?
- [ ] .htaccess in root (/public_html/)?
- [ ] assets/ folder has 46 files?
- [ ] Old files deleted?
- [ ] Browser cache cleared (Ctrl+F5)?

**Common Issues:**

| Problem | Solution |
|---------|----------|
| White page | Check browser console (F12). Missing JS file? |
| Unstyled page | CSS file missing. Is `index-D2p5FaiX.css` uploaded? |
| 404 on routing | .htaccess missing or mod_rewrite disabled |
| Old styles still showing | Clear browser cache: Ctrl+F5 |
| Language dropdown empty | Clear browser local storage / cookies |

---

## Backend (Unchanged)

These stay on server, don't replace:
- `/public/auth.php` (keep local version)
- `/public/lib/db.php` 
- Database tables (orders, order_items)
- `.env` file (with DB credentials)

---

**Ready? Let's deploy! 🚀**

For questions: See `ENDORA_UPLOAD_CHECKLIST.md` or `DEPLOYMENT.md`
