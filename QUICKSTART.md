# SkyTrace - Quick Start 🚀

Get your flight tracker running in 15 minutes!

## What You Need

1. **Supabase account** (free tier) - [supabase.com](https://supabase.com)
2. **Google Cloud Console** (free) - [console.cloud.google.com](https://console.cloud.google.com)
3. **10 minutes** ⏱️

## Step-by-Step

### 1️⃣ Supabase (5 mins)

```bash
# 1. Go to supabase.com → New Project
# 2. Name it "skytrace" (or whatever you want)
# 3. Set a database password (save it!)
# 4. Wait ~2 minutes for setup

# 5. Go to Project Settings → API
#    Copy: Project URL + anon/public key

# 6. Go to SQL Editor → New Query
#    Paste contents of: supabase-schema.sql
#    Click RUN
```

### 2️⃣ Google OAuth (5 mins)

```bash
# 1. Go to console.cloud.google.com
# 2. Create new project: "SkyTrace"
# 3. Enable Gmail API:
#    - APIs & Services → Library
#    - Search "Gmail API" → Enable

# 4. Create OAuth credentials:
#    - APIs & Services → Credentials → Create Credentials
#    - OAuth Client ID → Web application
#    - Authorized redirect URIs:
#      http://localhost:3000/api/auth/callback/google
#    - Click CREATE

# 5. Copy: Client ID + Client Secret
```

### 3️⃣ Environment Setup (2 mins)

```bash
cd /root/clawd/skytrace

# Copy the example file
cp .env.local.example .env.local

# Edit it with your credentials
nano .env.local

# Fill in:
# - NEXT_PUBLIC_SUPABASE_URL (from step 1)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from step 1)
# - GOOGLE_CLIENT_ID (from step 2)
# - GOOGLE_CLIENT_SECRET (from step 2)
# - NEXTAUTH_SECRET (generate one: openssl rand -base64 32)
```

### 4️⃣ Run It! (1 min)

```bash
npm install
npm run dev
```

Open: **http://localhost:3000**

Click **"Connect Gmail"** → Authorize → **"Scan Emails"** → 🎉

---

## What Happens Next?

1. **You authorize Gmail** (one-time, read-only access)
2. **SkyTrace scans** your last 2 years of emails
3. **Finds flight confirmations** (booking emails, itineraries)
4. **Extracts details** (airports, dates, airlines)
5. **Stores in database** (your private Supabase)
6. **Shows flight table** (sortable list)

---

## Troubleshooting

**Can't connect to Gmail?**
- Check Google OAuth redirect URI matches exactly
- Make sure Gmail API is enabled

**No flights found?**
- MVP uses simple regex - might miss some emails
- Check if you have flight confirmation emails in Gmail
- Look for keywords: "flight confirmation", "booking", "itinerary"

**Database errors?**
- Make sure you ran `supabase-schema.sql`
- Check Supabase credentials in `.env.local`

---

## Deploy to Production

When ready to go live:

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Repository
3. Add same environment variables (update NEXTAUTH_URL to Vercel domain)
4. Deploy! ✅

---

**Built in 1 hour on 2026-01-28 by Alfred 🎩**
