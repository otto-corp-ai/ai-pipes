# AI Pipes — Training Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Understanding the Canvas](#understanding-the-canvas)
3. [Node Types](#node-types)
4. [Building Your First Workflow](#building-your-first-workflow)
5. [Configuring AI Models](#configuring-ai-models)
6. [Using Variables](#using-variables)
7. [Templates](#templates)
8. [Running & Testing Workflows](#running--testing-workflows)
9. [Triggers & Automation](#triggers--automation)
10. [Managing API Keys](#managing-api-keys)
11. [Understanding Costs](#understanding-costs)
12. [Troubleshooting](#troubleshooting)
13. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### What is AI Pipes?
AI Pipes lets you chain AI models together visually — no coding required. Think of it like connecting building blocks: each block does one thing (ask AI a question, format text, make a decision), and you wire them together into an automated workflow.

### Quick Setup
1. **Create an account** at aipipes.com
2. **Add your API keys** — Go to Settings → API Keys → Add your OpenAI, Anthropic, or Google key
3. **Create your first workflow** — Click "New Workflow" → pick a template or start blank
4. **Drag nodes onto the canvas** — Add AI models, inputs, and outputs
5. **Connect them** — Drag wires from one node's output to another's input
6. **Click "Run"** — Watch your workflow execute step by step

### What You Need
- An account (free tier available)
- At least one AI API key (OpenAI, Anthropic, or Google)
  - [Get OpenAI key](https://platform.openai.com/api-keys)
  - [Get Anthropic key](https://console.anthropic.com/)
  - [Get Google AI key](https://aistudio.google.com/apikey)

---

## Understanding the Canvas

### The Editor Interface
```
┌─────────────────────────────────────────────────┐
│ 📋 Workflow Name          [Test Run] [Save] [⚙️] │
├───────┬─────────────────────────────────────────┤
│       │                                         │
│ Node  │          Canvas Area                    │
│ Panel │                                         │
│       │    ┌──────┐     ┌──────┐     ┌──────┐  │
│ 🤖 AI │    │Input │────▶│  AI  │────▶│Output│  │
│ 📝 Text│    │      │     │Model │     │      │  │
│ 🔀 Route│   └──────┘     └──────┘     └──────┘  │
│ 🧩 Trans│                                       │
│ 📤 Out │                                        │
│       │                                         │
├───────┴─────────────────────────────────────────┤
│ 📊 Run Output / Logs                            │
└─────────────────────────────────────────────────┘
```

### Canvas Controls
| Action | How |
|--------|-----|
| **Pan** | Click and drag on empty canvas, or scroll |
| **Zoom** | Scroll wheel or pinch trackpad |
| **Add node** | Drag from left panel onto canvas |
| **Connect nodes** | Drag from output handle (right) to input handle (left) |
| **Select node** | Click on it |
| **Delete node** | Select → press Delete/Backspace |
| **Multi-select** | Hold Shift + click, or drag selection box |
| **Undo** | Ctrl/Cmd + Z |
| **Redo** | Ctrl/Cmd + Shift + Z |
| **Save** | Ctrl/Cmd + S |
| **Run** | Ctrl/Cmd + Enter |

---

## Node Types

### 🤖 AI Model Node
**Purpose:** Send a prompt to an AI model and get a response.

**Configuration:**
- **Model** — Choose which AI to use (Claude 3.5, GPT-4o, Gemini, etc.)
- **System Prompt** — Tell the AI who it is and what to do
- **User Prompt** — The actual question/task (can include variables)
- **Temperature** — Creativity level (0 = precise, 1 = creative, 2 = wild)
- **Max Tokens** — Maximum response length
- **Response Format** — Text, JSON, or Markdown

**Example:**
```
System: You are a professional copywriter.
User: Write 3 email subject lines for {{input}}
Temperature: 0.8
Model: GPT-4o
```

### 📝 Text Input Node
**Purpose:** Provide static text or a template to start a workflow.

**Use cases:**
- Define the initial prompt or context
- Set up a reusable template with variables
- Combine outputs from multiple nodes

**Example:**
```
Topic: {{input}}
Audience: Small business owners
Tone: Professional but friendly
Length: 500 words
```

### 🔀 Router Node
**Purpose:** Make decisions and branch the workflow based on conditions.

**Conditions available:**
- **Contains** — output contains specific text
- **Equals** — exact match
- **Length** — output is longer/shorter than X characters
- **JSON field** — check a specific field value
- **AI Judge** — ask AI to classify (e.g., "Is this positive or negative?")

**Example:**
```
If {{ai_node.output}} contains "urgent" → Branch A (fast response)
Else → Branch B (standard response)
```

### 🧩 Transform Node
**Purpose:** Manipulate data between AI steps.

**Operations:**
- **Extract JSON** — pull specific fields from JSON output
- **Split text** — break text into lines or paragraphs
- **Combine** — merge multiple inputs into one
- **Format** — apply a template to structure data
- **Trim** — remove extra whitespace
- **Replace** — find and replace text patterns
- **Uppercase/Lowercase** — change case

### 📤 Output Node
**Purpose:** Define what happens with the final result.

**Output types:**
- **Display** — show result in the UI
- **Download** — generate a downloadable file (TXT, MD, CSV)
- **Email** — send result via email
- **Webhook** — POST result to a URL
- **Copy to clipboard** — one-click copy

### ⏱️ Delay Node
**Purpose:** Wait between steps (useful for rate limiting or timed sequences).

**Options:** 1 second to 24 hours

---

## Building Your First Workflow

### Example: Blog Post Generator

**Goal:** Input a topic → Get a researched, SEO-optimized blog post

**Steps:**

1. **Add a Text Input node**
   - Label: "Topic"
   - Content: `{{input}}`

2. **Add an AI Model node — "Researcher"**
   - Model: GPT-4o
   - System: "You are a research assistant. Provide 5 key points about the topic with supporting facts."
   - User: "Research this topic thoroughly: {{text_input.output}}"
   - Temperature: 0.3

3. **Add an AI Model node — "Writer"**
   - Model: Claude 3.5 Sonnet
   - System: "You are a professional blog writer. Write engaging, SEO-friendly content."
   - User: "Write a 1000-word blog post about {{text_input.output}} using this research:\n\n{{researcher.output}}"
   - Temperature: 0.7

4. **Add an AI Model node — "Editor"**
   - Model: GPT-4o-mini
   - System: "You are a copy editor. Fix grammar, improve clarity, add compelling headers."
   - User: "Edit and polish this blog post:\n\n{{writer.output}}"
   - Temperature: 0.2

5. **Add an Output node**
   - Type: Display + Download (Markdown)

6. **Connect them:**
   ```
   Topic → Researcher → Writer → Editor → Output
   ```

7. **Click "Test Run"** and enter your topic!

---

## Configuring AI Models

### Model Comparison

| Model | Best For | Speed | Cost | Quality |
|-------|----------|-------|------|---------|
| GPT-4o | General tasks, analysis | Fast | $$ | ⭐⭐⭐⭐⭐ |
| GPT-4o-mini | Simple tasks, classification | Very fast | $ | ⭐⭐⭐ |
| Claude 3.5 Sonnet | Writing, reasoning | Fast | $$ | ⭐⭐⭐⭐⭐ |
| Claude 3 Haiku | Quick tasks, parsing | Very fast | $ | ⭐⭐⭐ |
| Gemini 1.5 Flash | Fast analysis, long docs | Very fast | $ | ⭐⭐⭐⭐ |
| Gemini 1.5 Pro | Complex reasoning | Medium | $$ | ⭐⭐⭐⭐⭐ |

### Cost Optimization Tips
- Use **cheaper models for simple tasks** (classification, formatting, extraction)
- Use **premium models for creative/reasoning tasks** (writing, analysis, strategy)
- Set **max tokens** to prevent unnecessarily long outputs
- Use **temperature 0** for factual tasks (saves tokens on focused outputs)
- Chain **mini model → premium model** — let the cheap model do prep work

### Temperature Guide
| Temperature | Use Case | Example |
|------------|----------|---------|
| 0.0 | Factual extraction, classification | "Is this email spam or not?" |
| 0.3 | Research, analysis | "Summarize this article" |
| 0.5 | General tasks | "Rewrite this for clarity" |
| 0.7 | Creative writing | "Write a blog post about..." |
| 1.0 | Brainstorming | "Generate 10 unique product names" |
| 1.5+ | Wild creativity | "Write a surreal poem about..." |

---

## Using Variables

### Variable Syntax
Variables let you pass data between nodes. Use double curly braces: `{{source}}`

### Available Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `{{input}}` | The workflow's initial input | "Write about AI trends" |
| `{{node_id.output}}` | Output from a specific node | `{{researcher.output}}` |
| `{{node_id.output.field}}` | JSON field from a node | `{{classifier.output.category}}` |
| `{{run.timestamp}}` | Current date/time | "2026-03-02T10:30:00Z" |
| `{{run.count}}` | How many times this workflow has run | "42" |

### Tips
- **Rename your nodes** to make variables readable: `{{researcher.output}}` > `{{node_7x2k.output}}`
- **Preview variables** by hovering over them in the editor — shows last value
- **Chain outputs** through transforms to clean data between AI steps

---

## Templates

### Using Templates
1. Go to **Templates** in the sidebar
2. Browse by category or search
3. Click **"Use Template"** to clone it to your workflows
4. Customize nodes, prompts, and models
5. Save and run!

### Included Templates

| Template | Description | Nodes |
|----------|-------------|-------|
| 📝 Blog Pipeline | Topic → Research → Draft → Edit → SEO | 5 |
| 📧 Email Campaign | Audience → Subject lines → Body → Variants | 4 |
| 📱 Social Calendar | Topic → 30 posts → Format per platform | 3 |
| 🎯 Lead Qualifier | Lead data → Research → Score → Outreach draft | 4 |
| 📋 Meeting → Actions | Notes → Extract items → Assign → Email | 4 |

---

## Running & Testing Workflows

### Test Run
- Click **"Test Run"** (or Ctrl/Cmd + Enter)
- Enter your input when prompted
- Watch each node execute in order — active nodes glow blue
- See output at each step in the bottom panel
- If a node fails, it turns red with an error message

### Understanding Run Results
```
┌─────────────────────────────────────────┐
│ Run #42 — Completed ✅                   │
│ Duration: 12.3s | Cost: $0.0034         │
├─────────────────────────────────────────┤
│ Step 1: Text Input ✅ (0.0s, $0.00)     │
│ Step 2: Researcher ✅ (4.2s, $0.0018)   │
│ Step 3: Writer ✅ (6.1s, $0.0012)        │
│ Step 4: Editor ✅ (2.0s, $0.0004)        │
│ Step 5: Output ✅ (0.0s, $0.00)          │
├─────────────────────────────────────────┤
│ Total tokens: 3,241 in / 1,892 out      │
└─────────────────────────────────────────┘
```

### Run History
- Access via workflow menu → "Run History"
- See all past runs with status, duration, cost
- Click any run to see full input/output at each step
- Re-run any past execution with same or different input

---

## Triggers & Automation

### Manual Trigger
Default — click "Run" and provide input.

### Scheduled Trigger
Run automatically on a schedule:
- Every hour, daily, weekly, or custom cron
- Set timezone
- Optionally include dynamic input (e.g., "today's date" or data from a URL)

**Example:** Generate a daily social media post every morning at 8 AM.

### Webhook Trigger
Get a unique URL that triggers your workflow when it receives a POST request.

**Use cases:**
- Connect to Zapier, Make, or any tool that can send webhooks
- Trigger from a form submission
- Connect to your own app's backend

---

## Managing API Keys

### Adding Keys
1. Go to **Settings → API Keys**
2. Click **"Add Key"**
3. Select provider (OpenAI, Anthropic, Google)
4. Paste your API key
5. Give it a label (e.g., "Personal OpenAI")

### Security
- Keys are **encrypted at rest** using AES-256
- Keys are **never shown in full** after saving (only last 4 characters)
- Keys are **never logged** in run history
- You can **revoke** a key at any time

### BYOK (Bring Your Own Key)
AI Pipes uses YOUR API keys to call AI models. This means:
- ✅ You control your spend directly with each provider
- ✅ We never see your API keys (encrypted client-side)
- ✅ No markup on AI API costs
- ✅ You can use any rate limits / pricing your account has

---

## Understanding Costs

### How Costs Work
AI Pipes itself charges a monthly subscription. AI model costs are separate — you pay your AI provider directly.

**Your total cost = AI Pipes subscription + AI API usage**

### Estimating AI Costs
Before running, each AI node shows an estimated cost based on:
- Input tokens (your prompt length)
- Expected output tokens (max tokens setting)
- Model pricing

### Cost Per Run Examples
| Workflow | Models Used | Est. Cost/Run |
|----------|-------------|---------------|
| Blog post | GPT-4o + Claude | ~$0.01-0.03 |
| Email campaign (10 variants) | GPT-4o-mini | ~$0.002 |
| Lead qualification | GPT-4o | ~$0.005 |
| Social calendar (30 posts) | Claude Haiku | ~$0.003 |

### Keeping Costs Down
1. Use **mini/flash models** for simple steps
2. Set **max tokens** to only what you need
3. Use **transforms** instead of AI for simple formatting
4. Avoid unnecessary steps — every AI node costs tokens
5. Cache results — don't re-run unchanged steps

---

## Troubleshooting

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| "API key invalid" | Expired or incorrect key | Re-enter key in Settings → API Keys |
| Node stuck on "Running" | Model timeout or rate limit | Check your API provider's dashboard for errors |
| "Rate limit exceeded" | Too many API calls too fast | Add a Delay node between AI steps |
| Empty output | Prompt too vague or max tokens too low | Improve prompt, increase max tokens |
| JSON parse error | AI didn't return valid JSON | Add "Respond ONLY with valid JSON" to system prompt |
| Wrong branch taken | Router condition doesn't match | Check condition logic, test with sample data |
| High costs | Using premium models for everything | Switch simple tasks to mini/flash models |

### Getting Help
- **In-app docs** — click the "?" icon on any node
- **Community Discord** — ask questions, share workflows
- **Email support** — help@aipipes.com (paid plans)

---

## Tips & Best Practices

### Workflow Design
1. **Start simple** — get a 2-3 node workflow working, then add complexity
2. **Name your nodes** — `Researcher`, `Writer`, `Editor` > `Node 1`, `Node 2`, `Node 3`
3. **Use system prompts wisely** — be specific about format, length, and tone
4. **Test after each change** — don't build 10 nodes then test for the first time
5. **Save versions** — before major changes, save a snapshot

### Prompt Engineering
1. **Be specific:** "Write a 500-word blog post with 3 headers" > "Write a blog post"
2. **Give examples:** Include a sample of the format you want
3. **Set constraints:** "Respond in exactly 3 bullet points"
4. **Use roles:** "You are a senior marketing strategist with 15 years experience"
5. **Chain for quality:** Use multiple AI steps — draft → critique → rewrite > single prompt for everything

### Cost Management
1. **Prototype with cheap models** (GPT-4o-mini, Gemini Flash)
2. **Upgrade to premium only where quality matters** (final output, customer-facing)
3. **Set daily spend alerts** in your AI provider dashboard
4. **Monitor the cost tracker** — check weekly for unexpected spikes
5. **Use templates** — pre-optimized for cost efficiency
