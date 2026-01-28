# SkyTrace ✈️

**Your lifetime flight history, visualized.**

Scan your Gmail for flight confirmations and see all your travels on an interactive world map with stats.

## MVP Features (Phase 1)

- ✅ Gmail OAuth connection
- ✅ Email scanning (last 2 years)
- ✅ Flight detail extraction
- ✅ Database storage (Supabase)
- ✅ Sortable flight list
- ✅ Simple world map with pins

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase
- **Auth:** NextAuth.js (Google OAuth)
- **Email API:** Gmail API
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

## Setup

1. Clone the repo
2. Copy `.env.local.example` to `.env.local`
3. Set up Supabase project and add credentials
4. Set up Google Cloud Console OAuth credentials
5. Run `npm install`
6. Run `npm run dev`

## Roadmap

- **Phase 1 (MVP):** Basic flight list + map (2-3 weeks)
- **Phase 2 (Polish):** Flight arcs, GPT-4 extraction, filters (1-2 weeks)
- **Phase 3 (Stats):** Total miles, countries, carbon footprint (1 week)
- **Phase 4 (Cool Features):** Achievements, social sharing, recommendations (ongoing)

---

**Built with 🎩 by Alfred & Berke**
