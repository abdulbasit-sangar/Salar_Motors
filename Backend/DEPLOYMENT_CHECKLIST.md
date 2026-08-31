# 🚀 Deployment Checklist — Car Marketplace Backend

## Before deploying, verify every item below.

---

## 1. Environment Variables
Set ALL of these in your platform dashboard (Render / Railway). Never commit .env.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | Set by platform automatically |
| `MONGODB_URI` | Your Atlas production connection string |
| `ACCESS_TOKEN_SECRET` | Random 64-char hex string |
| `REFRESH_TOKEN_SECRET` | Different random 64-char hex string |
| `ACCESS_TOKEN_EXPIRY` | `15m` |
| `REFRESH_TOKEN_EXPIRY` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `FRONTEND_URL` | `https://your-frontend-domain.com` (no trailing slash) |

### Generate secure secrets (run locally):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run twice — use different values for ACCESS and REFRESH secrets.

---

## 2. MongoDB Atlas
- [ ] Created a production cluster (M0 free tier is fine to start)
- [ ] Whitelist deployment server IP under **Network Access**
  - Render/Railway: whitelist `0.0.0.0/0` (they use dynamic IPs)
  - VPS: whitelist your specific VPS IP
- [ ] Created a DB user with read/write permissions
- [ ] Connection string uses the correct DB name: `car-marketplace`
- [ ] Tested connection string locally before deploying

---

## 3. Cloudinary
- [ ] Created a Cloudinary account
- [ ] Verified `cars/` folder appears after a test upload
- [ ] API credentials copied to platform env vars (never in code)

---

## 4. CORS
- [ ] `FRONTEND_URL` set to your exact production frontend URL
- [ ] No trailing slash: ✅ `https://frontend.com` ❌ `https://frontend.com/`
- [ ] NOT set to `*` in production

---

## 5. Platform Setup (Render)
1. Connect GitHub repo
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `node server.js`
4. Set **Node version**: 18+ (under Environment)
5. Add all env vars under **Environment** tab
6. Deploy

---

## 6. Post-Deploy Verification (Postman)
Switch Postman environment to Production URL and run:

| Test | Expected |
|---|---|
| `GET /` | `{ success: true, message: "Server running..." }` |
| `POST /api/admin/login` | `200` with `accessToken` |
| `GET /api/cars` | `200` with cars array |
| `POST /api/cars` (with image) | `201` — image appears in Cloudinary |
| `GET /api/cars/search?keyword=Toyota` | `200` with results |
| Spam login 11 times | `429 Too Many Requests` |

---

## 7. Security Checklist
- [ ] `.env` is in `.gitignore` — confirmed not pushed to GitHub
- [ ] `NODE_ENV=production` is set — disables stack traces in error responses
- [ ] `helmet()` applied — visible in response headers (`X-Frame-Options` etc.)
- [ ] Rate limiter active — test by spamming login endpoint
- [ ] `mongoSanitize()` applied — `$` and `.` stripped from inputs
- [ ] CORS restricted to frontend domain only
- [ ] Passwords stored as bcrypt hashes — verify in Atlas (never plain text)
- [ ] Refresh token in HttpOnly cookie — not visible in browser JS console
- [ ] Access token expiry: 15m — not days or weeks
