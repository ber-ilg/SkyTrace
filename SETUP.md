# SkyTrace Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Cloud Console account

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Project Settings → API
3. Copy your **Project URL** and **anon/public key**
4. Go to SQL Editor and run the contents of `supabase-schema.sql`

## Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the **Gmail API**:
   - Go to APIs & Services → Library
   - Search for "Gmail API"
   - Click Enable
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: SkyTrace
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
   - Click Create
5. Copy your **Client ID** and **Client Secret**

## Step 3: Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in the values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here
```

To generate `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## Step 4: Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test the Flow

1. Click "Connect Gmail"
2. Authorize with Google
3. Click "Scan Emails"
4. View your flights in the table

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local` but update `NEXTAUTH_URL` to your Vercel domain)
5. Deploy!

## Troubleshooting

**"Invalid credentials"**
- Make sure your Google OAuth redirect URI matches exactly
- Check that Gmail API is enabled

**"Database error"**
- Verify Supabase credentials are correct
- Make sure you ran the schema SQL
- Check that RLS policies are set up

**"No flights found"**
- The regex patterns are basic MVP - some emails might not be detected
- Check your Gmail for flight confirmation emails
- Try searching manually: look for emails with keywords like "flight confirmation", "booking", "itinerary"

## Next Steps (After MVP)

- [ ] Improve flight extraction with GPT-4 API
- [ ] Add world map with flight pins
- [ ] Add flight arc paths
- [ ] Implement stats dashboard (total miles, countries, etc.)
- [ ] Add filters and search
- [ ] Mobile responsive improvements
