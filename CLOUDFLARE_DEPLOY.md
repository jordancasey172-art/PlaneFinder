# Deploy Plane Finder to Cloudflare Pages - Full Guide

Cloudflare Pages runs on Workers, not Node.js. Your current app uses:
- `pg` (TCP Postgres) -> not supported on Workers
- `sharp` (native libvips) -> not supported on Workers
- `pdfkit` (Node streams) -> needs nodejs_compat

## You CAN deploy, but you need 2 changes:

### Option 1: Keep Postgres, use Cloudflare Hyperdrive + OpenNext (Recommended)

1. **Install Cloudflare adapter:**
```bash
npm install -D @opennextjs/cloudflare wrangler
npm install @neondatabase/serverless
```

2. **Create Neon free Postgres** (neon.tech) - gives you HTTP connection string that works on Workers:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```
Or use Supabase + Hyperdrive:
- Cloudflare Dashboard -> Hyperdrive -> Create -> paste your Supabase connection string
- Copy Hyperdrive ID -> put in wrangler.toml

3. **Make DB Cloudflare-compatible**
Create `src/db/neon.ts`:
```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```
Then in `src/db/index.ts` switch based on env:
```ts
export { db } from "./neon"; // when CLOUDFLARE=true
```

4. **Fix image route** (already patched with fallback)
The current `/api/tickets/[ticketNumber]/image` now tries `sharp`, and if it fails (on Cloudflare) returns SVG directly. SVG works perfectly as boarding pass.

5. **Build for Cloudflare:**
```bash
npx @opennextjs/cloudflare build
npx wrangler deploy
# or
npx opennextjs-cloudflare deploy
```

6. **Set secrets:**
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_ACCESS_CODE # Goldenticket
npx wrangler secret put ADMIN_TOKEN # Goldenticket
```

### Option 2: Deploy Frontend to Cloudflare, Backend to Vercel/Render

Keep heavy Node.js routes on Vercel, deploy only static pages to Cloudflare:

- Frontend (Home, Live Map, Airlines) -> Cloudflare Pages
- API routes (/api/radar, /api/tickets/pdf) -> Vercel
Set `NEXT_PUBLIC_APP_URL` to Vercel URL.

### Option 3: Use Cloudflare Pages BUT disable sharp/pdf (Quickest)

If you just want to show live map without PDF generation:
- Comment out sharp import, return SVG instead of PNG
- PDF route will need `nodejs_compat` flag (already in wrangler.toml)

Already done: `src/app/api/tickets/[ticketNumber]/image/route.ts` has try/catch fallback to SVG.

### Why Vercel is still easier

- Vercel supports full Node.js, `pg`, `sharp`, `pdfkit` out of box
- Cloudflare Pages needs Neon HTTP or Hyperdrive
- Firebase App Hosting also supports full Node.js

If you give me a Cloudflare API token + Account ID, I can run the deploy for you directly.

### Current status
- ✅ White theme professional
- ✅ Admin hidden at /ops-console-secure-access / password Goldenticket
- ✅ 70 worldwide flights (no Africa), live map enhanced
- ✅ Ticket PNG now has Cloudflare fallback (SVG)
- ✅ Build passes for Vercel/Firebase
- ⚠️ For Cloudflare Pages: switch DB to Neon HTTP + use wrangler deploy
