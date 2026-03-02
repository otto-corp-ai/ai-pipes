# AI Pipes — Visual AI Workflow Builder

Drag-and-drop interface to chain AI models into automated pipelines. Like Zapier, but built for AI.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + React Flow
- **Backend:** Express + TypeScript + Drizzle ORM + PostgreSQL
- **AI:** OpenAI, Anthropic, Google GenAI SDKs
- **Auth:** JWT + bcrypt
- **Payments:** Stripe

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- API keys for OpenAI, Anthropic, or Google (for running workflows)

### Setup
```bash
# Clone and install
git clone https://github.com/otto-corp-ai/ai-pipes.git
cd ai-pipes
cp .env.example server/.env

# Edit server/.env with your database URL and secrets

# Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Generate and run database migrations
cd server && npm run db:generate && npm run db:migrate && cd ..

# Start development
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

Visit http://localhost:5173

### Deploy to Render
Push to GitHub and connect with the `render.yaml` blueprint.

## Features
- Visual drag-and-drop canvas (React Flow)
- 5 node types: AI Model, Text Input, Transform, Router, Output
- 6 AI models: GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude 3 Haiku, Gemini 1.5 Flash/Pro
- BYOK (bring your own API keys)
- Per-node cost tracking
- Run history with step-by-step output
- 5 starter templates
- Scheduled workflow triggers (cron)
- Stripe billing (Free/Starter/Pro/Business)
- Dark theme UI

## License
Proprietary — Otto Corp
