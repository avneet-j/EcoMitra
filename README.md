# EcoMitra — AI Campus Sustainability Copilot

Built for the 1M1B x IBM SkillsBuild AI for Sustainability Virtual Internship.
Stack: React (Vite) · Gemini API (aistudio.google.com, free tier) · MongoDB Atlas (free tier, incl. Vector Search) · Vercel (hosting + cron) — no credit card required anywhere.

## What's in this folder

```
ecomitra-app/
├── src/
│   ├── App.jsx                 # main dashboard shell
│   ├── components/
│   │   ├── UsageChart.jsx      # per-category usage vs. history/block average
│   │   ├── TipCard.jsx         # this week's personalized recommendation
│   │   ├── ChatWidget.jsx      # RAG-grounded sustainability copilot chat
│   │   └── DigestCard.jsx      # weekly auto-generated digest
│   └── main.jsx
├── api/                         # Vercel serverless functions
│   ├── chat.js                 # RAG: embed query -> vector search -> Gemini answer
│   ├── recommend.js            # personalized tip generation from usage_logs
│   └── cron-digest.js          # weekly agent job (Vercel Cron)
├── lib/
│   ├── gemini.js                # Gemini generate + embed helpers
│   └── mongodb.js                # Atlas connection helper
├── scripts/
│   └── embed-docs.js            # one-time script: embeds docs/*.md into Atlas Vector Search
├── docs/
│   └── sustainability-policy-sample.md   # sample source doc for the RAG layer — replace/add real ones
├── vercel.json                  # cron schedule config
├── .env.example
└── package.json
```

## Setup, step by step

### 1. Get your free Gemini API key
Go to https://aistudio.google.com → "Get API key" → create key. No card needed.

### 2. Set up MongoDB Atlas (free tier)
1. Create a free M0 cluster at https://www.mongodb.com/cloud/atlas
2. Create a database called `ecomitra` with collections: `users`, `usage_logs`, `recommendations`, `docs_chunks`
3. On `docs_chunks`, create an **Atlas Vector Search index** (Atlas UI → your cluster → Search → Create Search Index → JSON Editor):

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" }
  ]
}
```
Name the index `vector_index` — the code below expects that name.

4. Copy your connection string (Atlas → Connect → Drivers).

### 3. Environment variables
Copy `.env.example` to `.env` and fill in:
```
GEMINI_API_KEY=your_key_here
MONGODB_URI=your_atlas_connection_string
```

### 4. Install and run locally
```bash
npm install
npm run dev          # starts the Vite frontend
vercel dev           # or use Vercel CLI to also run the /api functions locally
```

### 5. Seed the RAG knowledge base (one time)
Add a few real docs to `docs/` (SDG descriptions, your campus's actual energy/water policy if you have one, waste segregation guidelines — plain `.md` or `.txt` is fine), then:
```bash
node scripts/embed-docs.js
```
This chunks each doc, embeds it with Gemini's `text-embedding-004`, and stores the vectors in `docs_chunks`.

### 6. Seed sample usage data (for the demo)
Since you likely don't have real IoT sensors yet, seed `usage_logs` with a realistic mock dataset for a hostel block — a small Node script writing a few weeks of plausible daily numbers per category is enough for judges. This is expected at this stage of the project.

### 7. Deploy
```bash
vercel
```
Add the same two environment variables in the Vercel dashboard (Project → Settings → Environment Variables) before your first deploy — this is also where the weekly cron job in `vercel.json` will run from.

## What to screenshot for your submission
- The dashboard with the usage chart populated by your seed data
- A chat exchange with the copilot, showing the cited source document
- The "this week's tip" card
- One weekly digest output (you can trigger `api/cron-digest.js` manually to generate one before the deadline)
