# Plane Finder - Deploy in 5 Minutes (Fixes all common errors)

If `npm run build` or Vercel/Firebase failed before, it was because:
1. `DATABASE_URL` was missing at build time -> now fixed with dummy fallback
2. Leaflet was rendered on server -> now fixed with dynamic imports
3. `sharp`/`bwip-js` need to be external -> now fixed in next.config.ts

## Option A: Vercel + Supabase (Recommended, 100% free, no Docker)

### 1. Create free Postgres
- Go to supabase.com -> New Project -> free tier
- Project Settings -> Database -> Connection string -> copy `DATABASE_URL` (URI tab, with password)

### 2. Push your code to GitHub
```bash
git init
git add .
git commit -m "Plane Finder"
git branch -M main
git remote add origin https://github.com/YOURNAME/planefinder.git
git push -u origin main
```

### 3. Deploy to Vercel
- vercel.com -> Add New Project -> Import your repo
- Add Environment Variables:
```
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-...pooler.supabase.com:6543/postgres
ADMIN_ACCESS_CODE=Goldenticket
ADMIN_TOKEN=Goldenticket
ADMIN_SESSION_SECRET=any-long-random-string-at-least-32-chars
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```
- Click Deploy

### 4. Seed DB (first time only)
After deploy, open:
`https://your-project.vercel.app/api/health`
If it says ok:false, run locally once:
```
DATABASE_URL="your supabase url" npx drizzle-kit push
```
Then reload home - 70 flights appear automatically.

### 5. Admin
`https://your-project.vercel.app/ops-console-secure-access`
Password: Goldenticket

## Option B: Firebase App Hosting (Next.js native)

Firebase now supports Next.js directly:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Choose "Use an existing project" or create new
# When asked: Use framework? Yes
# Source directory: .
```

Add env vars:
```bash
firebase apphosting:secrets:set DATABASE_URL
firebase apphosting:secrets:set ADMIN_ACCESS_CODE
firebase apphosting:secrets:set ADMIN_TOKEN
```

Deploy:
```bash
firebase deploy
```

Admin: `https://your-project.web.app/ops-console-secure-access`

## Option C: Docker / Cloud Run / Render / Railway

```bash
docker build -t planefinder .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e ADMIN_ACCESS_CODE=Goldenticket \
  -e ADMIN_TOKEN=Goldenticket \
  planefinder
```

For Google Cloud Run:
```bash
gcloud run deploy planefinder --source . --region us-central1 \
  --set-env-vars DATABASE_URL=...,ADMIN_ACCESS_CODE=Goldenticket,ADMIN_TOKEN=Goldenticket \
  --allow-unauthenticated
```

## Common Errors Fixed

| Error | Fix |
|-------|-----|
| `DATABASE_URL is required` at build | Now uses dummy placeholder at build time, real DB only at runtime |
| `window is not defined` / Leaflet | Map components are dynamically imported with ssr:false |
| `sharp` / `bwip-js` module not found | Added to serverExternalPackages + standalone output |
| Admin shows 307 redirect loop | Clear cookies, ensure ADMIN_ACCESS_CODE set |
| 0 flights on map | Call `npx drizzle-kit push` with prod DATABASE_URL once |

## Live Tracking Explained

Flight status is automatic based on dates:
- Before departure: Scheduled/Boarding
- After departure: En Route (aircraft moves along route)
- After arrival: Arrived (alt 0, speed 0)

No cron needed - every request to `/api/radar` or tracker page computes progress = (now - departure)/(arrival - departure).

If you want me to host permanently, give me a Vercel or Firebase project token and I can deploy directly.
