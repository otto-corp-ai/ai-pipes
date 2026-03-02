# AI Pipes — Visual AI Workflow Builder
## Product Specification v1.0

---

## Vision
**Zapier for AI models.** Drag-and-drop interface to chain AI models, tools, and data sources into automated workflows — zero code required. Built for solopreneurs, content creators, marketers, and lean teams who use AI daily but can't code.

---

## Core Value Proposition
- **No code required** — visual drag-and-drop canvas
- **Multi-model** — chain Claude, GPT, Gemini, Llama, Mistral in one workflow
- **Real automation** — scheduled runs, webhooks, API triggers
- **Affordable** — $29-79/mo vs Zapier's $49-299+ for AI workflows

---

## Target Users
1. **Solopreneurs** — automate content, lead gen, customer support
2. **Content creators** — multi-step content pipelines (research → draft → edit → format → publish)
3. **Marketers** — campaign generation, A/B copy, social scheduling
4. **Small agencies** — client deliverable automation
5. **Non-technical founders** — prototype AI features without developers

---

## Feature Map

### 1. Workflow Canvas (Core)
- **Drag-and-drop editor** with node-based visual graph
- **Node types:**
  - 🤖 **AI Model** — Claude, GPT-4o, Gemini, Llama, Mistral, Deepseek
  - 📝 **Text Input** — static text, variables, templates
  - 📎 **File Input** — upload PDF, CSV, images, audio
  - 🔀 **Router** — conditional branching (if/else based on AI output)
  - 🔄 **Loop** — iterate over lists (e.g., process each row of CSV)
  - 🧩 **Transform** — extract JSON, parse, format, combine text
  - 📤 **Output** — display result, download file, send email, webhook
  - ⏱️ **Delay** — wait between steps (rate limiting)
  - 🗄️ **Memory/Context** — store and retrieve data across runs
  - 📊 **Summarize** — condense long outputs for next step
- **Connections** — drag wires between nodes to define data flow
- **Variables** — `{{step1.output}}` syntax for referencing previous outputs
- **Canvas controls** — zoom, pan, minimap, snap-to-grid, undo/redo
- **Node groups** — visually group related nodes with labels
- **Copy/paste nodes** — duplicate sections of workflows
- **Node comments** — annotate nodes with notes

### 2. AI Model Configuration
- **Model selector** — dropdown per AI node with all supported models
- **System prompt** — define persona/instructions per node
- **Temperature** — slider 0.0 - 2.0
- **Max tokens** — configurable output length
- **Response format** — text, JSON, markdown, structured output
- **Image input** — for vision-capable models (GPT-4o, Gemini, Claude)
- **Streaming preview** — watch output generate in real-time during test runs
- **Fallback model** — auto-switch if primary model fails or times out
- **Cost estimate** — show estimated token cost per node before running

### 3. Templates & Marketplace
- **Starter templates:**
  - Blog Post Pipeline (research → outline → draft → edit → SEO optimize)
  - Email Campaign Generator (audience → subject lines → body copy → A/B variants)
  - Social Media Content Calendar (topic → 30 posts → schedule)
  - Customer Support Auto-Responder (classify ticket → draft response → quality check)
  - Competitor Analysis (scrape → summarize → compare → report)
  - Meeting Notes → Action Items (transcribe → extract → assign → email)
  - Resume Screener (upload resumes → score → rank → summary)
  - Product Description Generator (features → benefits → SEO copy → variants)
  - Lead Qualifier (input lead data → research → score → personalized outreach)
  - Document Translator (input → translate → review → format)
- **Community marketplace** — users can publish and share templates
- **One-click clone** — fork any template and customize
- **Template categories** — content, marketing, sales, support, research, operations

### 4. Integrations & Triggers
- **Trigger types:**
  - ⏰ Schedule (cron — every hour, daily, weekly, custom)
  - 🌐 Webhook (POST endpoint — connect from any app)
  - 📧 Email (forward email → triggers workflow)
  - 📁 File upload (drag file to trigger)
  - 🖱️ Manual (click "Run" button)
  - 📋 Form (embeddable form → triggers workflow)
- **Output integrations:**
  - 📧 Email (send via SMTP/SendGrid)
  - 📱 SMS (Twilio)
  - 💬 Slack / Discord webhook
  - 📊 Google Sheets (append row)
  - 📝 Notion (create page)
  - 🐦 Twitter/X (post)
  - 📁 Google Drive / Dropbox (save file)
  - 🌐 Webhook (POST to any URL)
  - 📋 Airtable (create record)
- **API keys** — users bring their own keys (BYOK) for AI models
  - We also offer hosted API access for convenience (usage-based billing)

### 5. Data & File Handling
- **File upload** — PDF, CSV, XLSX, DOCX, TXT, images, audio
- **PDF parsing** — extract text from uploaded PDFs
- **CSV processing** — parse rows, loop over data, reference columns
- **Image handling** — pass to vision models, resize, compress
- **Audio transcription** — auto-transcribe via Whisper before passing to AI
- **Output formatting** — markdown, HTML, plain text, PDF export
- **Data preview** — see intermediate outputs at each step

### 6. Execution & Monitoring
- **Test run** — run workflow with sample data, see output at each node
- **Step-by-step debug** — pause at any node, inspect input/output
- **Live logs** — real-time execution log with timestamps and token counts
- **Run history** — searchable log of all past executions with inputs/outputs
- **Error handling** — retry logic, fallback paths, error notifications
- **Parallel execution** — nodes without dependencies run simultaneously
- **Rate limiting** — configurable delays between API calls
- **Timeout settings** — per-node and per-workflow timeouts
- **Cost tracking** — per-run cost breakdown by model and node

### 7. Collaboration
- **Team workspaces** — invite team members
- **Role-based access** — owner, editor, viewer
- **Workflow sharing** — share via link (view-only or editable)
- **Version history** — see changes, revert to previous versions
- **Comments** — leave feedback on specific nodes

### 8. User Experience
- **Dashboard** — overview of all workflows with status, last run, next scheduled run
- **Quick actions** — duplicate, archive, export/import workflows
- **Search & filter** — find workflows by name, tag, status
- **Dark/light mode**
- **Mobile responsive** — view run results on mobile (editing is desktop)
- **Keyboard shortcuts** — common actions (save, run, undo, zoom)
- **Onboarding wizard** — guided first workflow with tooltips
- **Help panel** — contextual docs, video tutorials, example prompts

### 9. Security & Privacy
- **API keys encrypted at rest** (AES-256)
- **Keys never logged** — masked in UI and logs
- **Data retention controls** — auto-delete run data after X days
- **SOC 2 roadmap** — for enterprise customers
- **BYOK model** — we never see your AI API keys (client-side encryption)
- **Rate limiting** — per-user API call limits to prevent abuse

### 10. Billing & Plans
| Feature | Free | Starter ($29/mo) | Pro ($49/mo) | Business ($79/mo) |
|---------|------|-------------------|--------------|-------------------|
| Workflows | 3 | 15 | 50 | Unlimited |
| Runs/month | 50 | 500 | 2,000 | 10,000 |
| AI models | GPT-4o-mini only | All models | All models | All models |
| Integrations | Manual trigger only | 3 integrations | All integrations | All + API access |
| Team members | 1 | 1 | 3 | 10 |
| File uploads | 5MB | 25MB | 100MB | 500MB |
| Run history | 7 days | 30 days | 90 days | 1 year |
| Support | Community | Email | Priority email | Dedicated |
| Templates | Basic only | All | All + marketplace | All + custom |

---

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Canvas:** React Flow (node-based graph editor)
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL (Drizzle ORM)
- **Queue:** BullMQ (optional, inline fallback for MVP)
- **AI SDKs:** OpenAI, Anthropic, Google GenAI
- **Auth:** JWT + bcrypt
- **Payments:** Stripe
- **Hosting:** Render (static site + API + Postgres)
- **File storage:** Local disk (MVP), S3 (later)

---

## Database Schema

### users
- id, email, password_hash, name, avatar_url
- tier (free/starter/pro/business), stripe_customer_id, stripe_subscription_id
- api_keys_encrypted (JSON — user's own AI API keys)
- workflows_count, runs_this_month
- created_at, updated_at

### workflows
- id, user_id, name, description, tags
- canvas_data (JSON — full React Flow graph with nodes, edges, positions)
- is_template, is_public, category
- trigger_type, trigger_config (JSON)
- last_run_at, run_count, status (draft/active/paused/archived)
- version, created_at, updated_at

### workflow_runs
- id, workflow_id, user_id
- status (queued/running/completed/failed/cancelled)
- trigger_type (manual/scheduled/webhook/email)
- input_data (JSON), output_data (JSON)
- node_results (JSON — per-node input/output/timing/cost)
- total_tokens, total_cost, duration_ms
- error_message, error_node_id
- created_at, completed_at

### workflow_versions
- id, workflow_id, version_number
- canvas_data (JSON), change_description
- created_by, created_at

### api_keys
- id, user_id, provider (openai/anthropic/google/etc)
- encrypted_key, label, is_active
- created_at

### integrations
- id, user_id, provider (slack/sheets/notion/etc)
- config_encrypted (JSON — OAuth tokens, webhook URLs)
- status, created_at

---

## Node Processing Engine

### Execution Flow
1. Topologically sort the node graph
2. Execute nodes in dependency order (parallelize independent branches)
3. For each node:
   a. Resolve input variables from upstream outputs
   b. Execute node logic (API call, transform, condition)
   c. Store output
   d. Pass output to downstream nodes
4. Handle errors: retry (configurable), fallback path, or fail

### Variable Resolution
- `{{input}}` — workflow input
- `{{node_id.output}}` — specific node's output
- `{{node_id.output.field}}` — JSON field from node output
- `{{env.VARIABLE}}` — environment variable
- `{{run.timestamp}}` — runtime metadata

### Node Types (Internal)
```typescript
interface BaseNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
}

type NodeType = 
  | 'ai_model'      // Call AI API
  | 'text_input'    // Static/template text
  | 'file_input'    // Upload file
  | 'router'        // Conditional branch
  | 'loop'          // Iterate over array
  | 'transform'     // Parse, format, extract
  | 'output'        // Final output action
  | 'delay'         // Wait timer
  | 'memory'        // Key-value store
  | 'summarize'     // Condense text
  | 'webhook_trigger' // Incoming webhook
  | 'http_request'  // Outbound HTTP call
  | 'code'          // Custom JavaScript (Pro+)
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing page with demo, features, pricing |
| `/login` | Login | Email/password login |
| `/register` | Register | Sign up |
| `/dashboard` | Dashboard | All workflows, stats, quick actions |
| `/workflow/new` | New Workflow | Template picker → canvas |
| `/workflow/:id` | Workflow Editor | Main canvas editor |
| `/workflow/:id/runs` | Run History | Past executions with details |
| `/workflow/:id/settings` | Workflow Settings | Triggers, sharing, versioning |
| `/templates` | Template Gallery | Browse & clone templates |
| `/settings` | User Settings | Profile, API keys, billing |
| `/settings/integrations` | Integrations | Connect Slack, Sheets, etc. |
| `/docs` | Documentation | In-app docs & tutorials |

---

## MVP Scope (Phase 1 — Ship in 12-14 days)

### Include
- ✅ Visual canvas with React Flow
- ✅ Node types: AI Model, Text Input, Transform, Output, Router
- ✅ 5 AI models: Claude, GPT-4o, GPT-4o-mini, Gemini Flash, Gemini Pro
- ✅ BYOK (bring your own API keys)
- ✅ Test run with step-by-step output preview
- ✅ Run history with cost tracking
- ✅ 5 starter templates
- ✅ Manual trigger + scheduled trigger
- ✅ User auth + free/paid tiers
- ✅ Stripe billing
- ✅ Landing page
- ✅ Basic docs/help

### Defer to Phase 2
- ❌ File upload nodes (PDF, CSV, audio)
- ❌ Loop nodes
- ❌ Memory/context nodes
- ❌ Third-party integrations (Slack, Sheets, etc.)
- ❌ Team collaboration
- ❌ Marketplace
- ❌ Custom code nodes
- ❌ Webhook triggers
- ❌ Version history

---

## Competitive Positioning

| Feature | AI Pipes | Zapier | n8n | Langflow |
|---------|----------|--------|-----|----------|
| AI-first design | ✅ | ❌ (bolted on) | ❌ | ✅ |
| No-code | ✅ | ✅ | ⚠️ (technical) | ❌ (developer tool) |
| Multi-model | ✅ | ⚠️ (limited) | ✅ | ✅ |
| Price | $29-79/mo | $49-299/mo | Free (self-host) | Free (self-host) |
| Hosted (no setup) | ✅ | ✅ | ❌ | ❌ |
| Templates | ✅ | ✅ | ✅ | ❌ |
| Target user | Non-technical | Business ops | Developers | ML engineers |

**Our moat:** Simplest AI workflow tool for non-developers. Not competing with n8n/Langflow (developer tools). Competing with "I use ChatGPT manually for 5 steps" — we automate that.

---

## Success Metrics
- **Week 1:** 100 signups, 50 workflows created
- **Month 1:** 500 users, 20 paid ($580-1,580 MRR)
- **Month 3:** 2,000 users, 100 paid ($2,900-7,900 MRR)
- **Month 6:** 10,000 users, 500 paid ($14,500-39,500 MRR)
