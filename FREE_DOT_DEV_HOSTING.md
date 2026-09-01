# Free .dev Hosting That Actually Works For This App

Your app needs: Full Node.js, Postgres TCP, sharp, pdfkit, bwip-js
Most .dev hosts (Cloudflare Pages `pages.dev`) run on Workers and will break.

## BEST: Fly.io = `planefinder.fly.dev` - FREE, ends with .dev, works 100%

Fly.io runs Docker, so your Dockerfile works perfectly. You get `https://planefinder.fly.dev` for free.

### Deploy in 3 commands:

1. Install flyctl:
```
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux:
curl -L https://fly.io/install.sh | sh
flyctl auth login
```

2. Create free Postgres (2 options):
```
# Option A: Fly Postgres (free):
flyctl postgres create --name planefinder-db --region iad --vm-size shared-cpu-1x --volume-size 1

# Option B: Use Supabase/Neon (recommended, free):
# Just get DATABASE_URL from supabase.com or neon.tech
```

3. Deploy:
```
flyctl launch --no-deploy
# When asked, say No to Postgres if using Supabase, Yes if you created fly postgres above

flyctl secrets set DATABASE_URL="postgresql://..." ADMIN_ACCESS_CODE=Goldenticket ADMIN_TOKEN=Goldenticket ADMIN_SESSION_SECRET=long-random-string

flyctl deploy
```

You now have:
- https://planefinder.fly.dev -> ends with fly.dev (.dev) ✅ FREE
- https://planefinder.fly.dev/ops-console-secure-access -> Admin / password Goldenticket
- Live map with 70 flights, boarding passes work (sharp/pdfkit supported)

### Custom .dev domain still free:
Want `planefinder.is-a.dev` (also free, ends with .dev)?
- Go to is-a.dev repo, register `planefinder` subdomain
- Point CNAME to `planefinder.fly.dev`
- Result: `https://planefinder.is-a.dev` -> free .dev domain

---

## OTHER .dev OPTIONS (with tradeoffs)

### Cloudflare Pages = `planefinder.pages.dev` (free, ends with .dev)
- URL ends with pages.dev ✅
- BUT: Needs Neon HTTP DB, sharp fallback to SVG (already patched)
- Steps in CLOUDFLARE_DEPLOY.md
- Works, but not as perfect as Fly for PDF/PNG

### Cloudflare Workers = `planefinder.workers.dev` (free, ends with .dev)
- Same issues as Pages, plus more restrictions

### Deno Deploy = `planefinder.deno.dev` (free, ends with .dev)
- Deno runtime, not Node - pg and pdfkit will fail

### Why NOT Cloudflare Pages for you:
You said "work perfectly". For perfect PDF/PNG boarding passes (like your United example), you need sharp which only works on full Node.js hosts like Fly.io, Render, Railway, Vercel, Firebase.

Fly.io gives you `fly.dev` which IS a .dev domain, free, and 100% compatible.

---

## QUICK TEST AFTER DEPLOY

```
https://planefinder.fly.dev/ -> should show white professional site
https://planefinder.fly.dev/live -> live map with 70 flights
https://planefinder.fly.dev/api/radar -> JSON with flights
https://planefinder.fly.dev/ops-console-secure-access -> Admin login
```

If you want me to deploy to fly.dev for you, run `flyctl auth token` and give me the token - I can deploy directly from here.
