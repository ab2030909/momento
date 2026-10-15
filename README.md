# Memento — AI-Powered Visual Memory

> **"Your files remember where they are. Memento remembers what they contain."**

Memento is a visual memory application powered by Cloudinary and multimodal AI. It is designed for developers, architects, researchers, and creators who accumulate thousands of screenshots, system architecture diagrams, receipts, hardware snapshots, and visual research notes.

---

## 🌟 Key Features

1. **Natural-Language Semantic & OCR Retrieval**
   - Natural query support (e.g. *"AWS architecture diagram"*, *"receipts containing $49.99"*, *"blue mechanical keyboard"*, *"desk before renovation"*).
   - Multi-signal ranking combining OCR text extraction, visual category classification, indexed tag clusters, and vector cosine similarity.
   - Transparent ranking indicators explaining exactly why each image matched.

2. **Cloudinary Integration**
   - Secure signed direct uploads from the client browser via server-side signing (`/api/cloudinary/sign`).
   - Dynamic transformations with automatic format (`f_auto`) and quality optimization (`q_auto`).
   - Optimized thumbnail and preview delivery without exposing API secrets.

3. **Multi-Stage Processing Pipeline**
   - Modular architecture: Cloudinary CDN storage ➔ basic metadata extraction ➔ OCR text indexing ➔ AI vision descriptions ➔ vector embeddings.
   - Built-in heuristic and lexical fallback ensuring 100% functionality even when external AI API keys are not yet configured.

4. **Visual Exploration Suite**
   - **Visual Timeline**: Chronological browsing by date with side-by-side comparison mode.
   - **Similar Images Explorer**: Find related images based on embedding vector proximity and shared entities.
   - **Collections**: Group memories into customizable thematic workspaces.
   - **Detail Intelligence View**: Inspect original resolution, extracted OCR text, detected tags, and image metrics.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Cloudinary Credentials (Server-side signed uploads & CDN delivery)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# AI Multimodal Vision (Optional - intelligent fallback active if empty)
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** Memento runs out-of-the-box in **Demo & Local Sandbox Mode** with rich sample data even without any API keys configured!

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Architecture

- `app/` — Next.js App Router pages:
  - `/` — Overview spotlight & natural search hero
  - `/memories` — Full visual gallery with category and collection filters
  - `/search` — Multi-signal ranked search results with match explanations
  - `/timeline` — Chronological timeline with image comparison
  - `/collections` — Collection manager
  - `/similar` — Visual similarity explorer
  - `/settings` — Real-time telemetry and pipeline status
- `app/api/` — Backend API routes:
  - `/api/cloudinary/sign` — Secure server-side signature generator
  - `/api/assets` — Asset indexing and retrieval
  - `/api/search` — Semantic and OCR search engine
  - `/api/similar` — Vector similarity matching
  - `/api/collections` — Collection operations
  - `/api/status` — Integration health check
- `lib/cloudinary/` — Cloudinary SDK configuration and URL transformation utilities
- `lib/ai/` — Vision analysis, OCR extraction, and vector embedding adapters
- `lib/search/` — Multi-signal ranking engine
- `lib/data/` — Persistence layer & rich sample datasets
- `types/` — Shared TypeScript data models
