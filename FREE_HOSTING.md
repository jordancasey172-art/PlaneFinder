# Free hosting that actually works (like Supabase)

Supabase is free for **Postgres**.
This app still needs a free **Node.js server** for Next.js, maps, tickets, PDF, and admin.

Use this stack:

1. **Supabase** = free database
2. **Render** = free website hosting

You get a URL like:

`https://planefinder.onrender.com`

No Vercel. No paid plan. Full Node.js, so boarding-pass PDF/PNG and live tracking work.

---

## Step 1. Free database on Supabase

1. Go to https://supabase.com
2. Create a free project
3. Open **Project Settings → Database**
4. Copy **URI** connection string
5. Replace `[YOUR-PASSWORD]` with your database password

It looks like:

```
postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Use the **pooler / Transaction** URL if Render later shows too many connections.

Then from this project folder, push the tables once:

```bash
npx drizzle-kit push
```

If asked, make sure `DATABASE_URL` in `.env` is that Supabase URL first.

---

## Step 2. Free website on Render

1. Push this project to GitHub (public or private)
2. Go to https://render.com and sign up with GitHub
3. Click **New → Blueprint**
4. Select this repo
5. Render reads `render.yaml` and creates the web service on the **free** plan
6. Add these two values when asked:

```
DATABASE_URL = your Supabase URI
NEXT_PUBLIC_APP_URL = https://YOUR-SERVICE.onrender.com
```

7. Deploy

Admin is already set:

- URL: `https://YOUR-SERVICE.onrender.com/ops-console-secure-access`
- Password: `Goldenticket`

---

## Manual Render setup (if you skip Blueprint)

New → Web Service → this GitHub repo

| Setting | Value |
|---|---|
| Runtime | Node |
| Plan | Free |
| Build command | `npm install && npm run build` |
| Start command | `npm run start` |
| Node version | `20` |

Environment variables:

```
DATABASE_URL=postgresql://...supabase...
ADMIN_ACCESS_CODE=Goldenticket
ADMIN_TOKEN=Goldenticket
ADMIN_SESSION_SECRET=any-long-random-string
NEXT_PUBLIC_APP_URL=https://YOUR-SERVICE.onrender.com
NODE_ENV=production
```

---

## After first deploy

Open:

- Site: `https://YOUR-SERVICE.onrender.com`
- Health: `https://YOUR-SERVICE.onrender.com/api/health`
- Live map: `https://YOUR-SERVICE.onrender.com/live`
- Admin: `https://YOUR-SERVICE.onrender.com/ops-console-secure-access`

If health is `{ ok: false }`, the database URL is wrong or tables were not pushed.

If the map is empty, run locally once with the **same** Supabase URL:

```bash
npx drizzle-kit push
```

Then reload the live site. Seeded flights appear automatically.

---

## Free plan notes

Render free services sleep after about 15 minutes with no traffic.
The first visit after sleep can take 30–60 seconds. After that it is normal.

That is the same kind of free-tier limit Supabase has.

---

## Why not Cloudflare Pages?

Cloudflare Pages is also free, but it is Workers, not Node.js.
This app needs `pg`, `sharp`, and `pdfkit`, so PDF tickets will not work perfectly there.

Render + Supabase is the free combo that matches this project.