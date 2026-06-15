# ⚡ Intent Cart

> **Reimagining urgent shopping.** Describe your situation — get a ready-to-buy cart in seconds.

Built for the **Amazon Hackathon 2025** — *Reimagine Shopping Experience*.

---

## The Idea

Traditional shopping: `Search → Browse → Compare → Cart`

**Intent Cart:** `Describe situation → AI generates cart`

Instead of asking *"What product do you want?"*, we ask **"What is happening right now?"**

---

## Features

- **🎙 Voice / Text / Photo input** — describe any situation naturally
- **⚡ AI-generated cart** — Amazon Bedrock (Amazon Nova 2 Lite) for real intent extraction — supports text, voice, and **multimodal photo** input
- **🗃 DynamoDB sessions** — cart persists across refreshes and devices
- **📷 S3 photo uploads** — real presigned PUT URL, uploaded directly to S3
- **💡 "Why included" reasoning** — every item has a context explanation
- **⇄ Substitute drawer** — Best Match / Fastest / Cheapest / Most Trusted per item
- **🔄 Urgency modes** — Fastest · Best Value · Most Trusted (server-synced)
- **🛒 Checkout confirm** — order saved as `confirmed` in DynamoDB

---

## AWS Resource Setup

> **Required before running** — the app has no local fallbacks. All three AWS services must be provisioned.

### 1. DynamoDB Table

**AWS Console → DynamoDB → Tables → Create table**

| Field | Value |
|---|---|
| Table name | `intent-cart-sessions` |
| Partition key | `sessionId` (String) |
| Billing mode | On-demand (PAY_PER_REQUEST) |

Enable TTL: **Table → Additional settings → Time to Live → Enable → attribute: `expiresAt`**

### 2. S3 Bucket

**AWS Console → S3 → Create bucket**

| Field | Value |
|---|---|
| Bucket name | `intent-cart-uploads-{your-12-digit-account-id}` |
| Region | Same as `BEDROCK_REGION` |
| Block all public access | ON (we use presigned URLs) |

Add **CORS configuration** (Bucket → Permissions → CORS):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-amplify-domain.amplifyapp.com"
    ],
    "ExposeHeaders": []
  }
]
```

### 3. IAM Policy

Attach to the IAM user whose keys go in your env vars:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:us-east-1:*:inference-profile/us.amazon.nova-2-lite-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/intent-cart-sessions"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::intent-cart-uploads-*/*"
    }
  ]
}
```

### 4. Environment Variables

Copy `.env.example` → `.env.local` and fill in:

```bash
BEDROCK_ACCESS_KEY_ID=your-key-id
BEDROCK_SECRET_ACCESS_KEY=your-secret
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-2-lite-v1:0
DYNAMO_TABLE=intent-cart-sessions
S3_BUCKET=intent-cart-uploads-{accountId}
NEXT_PUBLIC_S3_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=intent-cart-uploads-{accountId}
```

**Amplify Console**: Add these same vars under **App Settings → Environment variables**.
> ⚠️ Never use `AWS_` prefix — it's reserved by Amplify and causes a build error.

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
| Frontend | Next.js 16.2.9 (App Router) + TypeScript |
| Styling | Vanilla CSS with design tokens |
| State | Zustand (session state — DynamoDB is the source of truth) |
| AI | Amazon Bedrock — Amazon Nova 2 Lite (multimodal) |
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
3. Attach the IAM policy from the **AWS Resource Setup** section above
4. Add keys to `.env.local` (use `BEDROCK_` prefix — `AWS_` is reserved by Amplify):

```env
BEDROCK_ACCESS_KEY_ID=your_key
BEDROCK_SECRET_ACCESS_KEY=your_secret
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-2-lite-v1:0
```

5. Enable **Amazon Nova 2 Lite** in **AWS Console → Bedrock → Model access → Amazon**

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
 │ Amazon Bedrock (Nova 2 Lite)  │  ← with AWS keys
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
