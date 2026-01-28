# Google Gemini AI Setup (Optional)

The hybrid extraction approach uses **improved regex first**, then falls back to **Google Gemini AI** if regex fails.

Gemini is **completely free** for your use case!

---

## Get Your Free Gemini API Key (2 minutes)

1. **Go to:** https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Create API key"**
4. **Copy the key**

---

## Add to Vercel

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. **Add variable:**
   - **Name:** `GEMINI_API_KEY`
   - **Value:** (paste your API key)
3. **Redeploy**

---

## How It Works

**Without Gemini API key:**
- Uses improved regex with IATA code validation
- Better than original MVP, but still misses some formats

**With Gemini API key:**
- Tries improved regex first (fast, free)
- If regex fails → Uses Gemini AI (smart, still free!)
- Best accuracy

---

## Free Tier Limits

- **15 requests/minute**
- **1 million requests/day**

For your use case (scanning ~100 emails once, maybe 10/month after):
- ✅ Completely free forever
- ✅ No credit card required
- ✅ No usage warnings

---

## What You Get

**Better extraction of:**
- ✅ Actual flight confirmation emails (not false positives)
- ✅ Dates in any format
- ✅ Airlines and flight numbers
- ✅ Confirmation codes
- ✅ Works with any airline's email format

**Example improvement:**
- **Before:** Found DTD→DTD, ICT→USD (garbage data)
- **After:** Found LHR→JFK, BKK→IST (real flights only!)

---

**Recommendation:** Get the API key! Takes 2 minutes, works forever, completely free. 🎉
