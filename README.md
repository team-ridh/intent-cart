# ⚡ Amazon Now OS

> **Reimagining urgent shopping.** Describe your situation — get a ready-to-buy cart in seconds.

Built for the **Amazon Hackathon 2025** — *Reimagine Shopping Experience*.

---

## The Idea

Traditional shopping: `Search → Browse → Compare → Cart`

**Amazon Now OS:** `Describe situation → AI generates cart`

Instead of asking *"What product do you want?"*, we ask **"What is happening right now?"**

---

## Features

- **🎙 Voice / Text / Photo input** — describe any situation naturally
- **⚡ AI-generated cart** — powered by Amazon Bedrock (Claude 3 Haiku)
- **💡 "Why included" reasoning** — every item comes with a context explanation
- **⇄ Substitute drawer** — Best Match / Fastest / Cheapest / Most Trusted per item
- **🔄 Urgency modes** — Fastest · Best Value · Most Trusted
- **🛒 Checkout preview** — full order summary with live ETA countdown

---

## Scenarios Supported

| Chip | Situation | Cart Generated |
|---|---|---|
| 👥 Guests arriving | Hosting in 30 min | Tea, Milk, Snacks, Cups, Napkins |
| 🤒 Fever care | Sick at home | Paracetamol, ORS, Soup, Tissues |
| 🪔 Pooja essentials | Evening pooja | Agarbatti, Camphor, Flowers, Ghee |
| 🌧️ Rainy day | Stuck indoors | Hot chocolate, Maggi, Bread, Candles |
| ✈️ Travel prep | Leaving soon | Water, Snacks, Sanitizer, Charger |
| ⚡ Power cut | Outage | Torch, Batteries, Candles, Power bank |
| 🎒 School project | Deadline | Pencils, Colour pencils, Fevicol, Scissors |
| ☕ Tea break | Afternoon break | Tea bags, Milk, Biscuits, Namkeen |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Vanilla CSS with design tokens |
| State | Zustand (persisted to localStorage) |
| AI | Amazon Bedrock — Claude 3 Haiku |
| Voice | Web Speech API (en-IN) |
| Hosting | AWS Amplify |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/intent-cart.git
cd intent-cart
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your AWS credentials (see below). The app works **without credentials** — the local intent engine handles all 8 scenarios.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Enabling Amazon Bedrock

1. Go to **AWS Console → IAM → Users → Security Credentials**
2. Create an access key
3. Attach this policy to the IAM user:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "bedrock:InvokeModel",
    "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
  }]
}
```

4. Add keys to `.env.local`:

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

5. Enable Claude 3 Haiku in **AWS Console → Bedrock → Model access**

---

## Deployment on AWS Amplify

1. Push this repo to GitHub
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click **New App → Host web app → GitHub**
4. Select this repo and the `main` branch
5. Add environment variables in Amplify → App settings → Environment variables
6. Deploy — the `amplify.yml` build config is already included

---

## Architecture

```
User Input (Text / Voice / Photo)
         ↓
 Next.js App Router (page.tsx)
         ↓
 POST /api/interpret
         ↓
 ┌───────────────────────────────┐
 │ Amazon Bedrock (Claude Haiku) │  ← with AWS keys
 │         OR                    │
 │  Local keyword engine         │  ← fallback (always works)
 └───────────────────────────────┘
         ↓
 ParsedIntent { scenario, urgency, confidence }
         ↓
 Cart Decision Engine (deterministic)
         ↓
 Generated Cart → Zustand store
         ↓
 /cart → /checkout
```

---

## Project Structure

```
intent-cart/
├── app/
│   ├── page.tsx              # Screen 1: Situation Capture
│   ├── cart/page.tsx         # Screen 2: AI Cart
│   ├── checkout/page.tsx     # Screen 3: Checkout Preview
│   ├── api/interpret/route.ts # Bedrock API + fallback
│   ├── layout.tsx
│   └── globals.css           # Design system
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── mockProducts.ts       # 50+ products, 8 scenarios
│   └── ai/
│       ├── intentParser.ts   # Bedrock client + local fallback
│       └── cartGenerator.ts  # Intent → cart mapping
├── store/cartStore.ts        # Zustand store
├── hooks/useSpeechRecognition.ts
├── .env.example              # Environment template
└── amplify.yml               # Amplify CI/CD config
```

---

## North Star Metric

**Time To Cart (TTC)** — from identifying a need to a purchase-ready cart.

Target: **< 8 seconds** (vs. 3–5 minutes with traditional search).

---

*Built with ❤️ for the Amazon Hackathon 2025*
