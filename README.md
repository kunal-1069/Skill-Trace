# AI Career Coach (Skill Trace)

> A lightweight, standalone Node.js port of the n8n AI Career Coach workflow. Requires **no n8n instance** and has **zero heavy dependencies** beyond `pdfkit`.

The AI Career Coach continuously audits student GitHub portfolios against real-time job market requirements, identifies skill gaps, detects repository commits incrementally, and produces verifiable reports with line-level code citations.

---

## 🌟 Highlights & Architecture

This project replaces the original n8n workflow with clean, modular ECMAScript modules (ESM) in native Node.js:

```
                  ┌────────────────────────────────────────┐
                  │          Trigger Entry Points          │
                  │  * Web UI Dashboard (GET /)            │
                  │  * HTTP API (POST /analyze)            │
                  │  * Background Poller (every N min)     │
                  │  * GitHub Webhooks (POST /github-push) │
                  └───────────────────┬────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│  Real Job Market Demand   │                   │  Student GitHub Portfolio │
│  - Jobicy Remote API      │                   │  - GitHub Trees API       │
│  - Arbeitnow Jobs API     │                   │  - File SHA diffing       │
│  - 25-skill tech taxonomy │                   │  - Candidate code scoring │
└─────────────┬─────────────┘                   └─────────────┬─────────────┘
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │      Audit & Judging      │
                        │  - OpenAI LLM Judge       │
                        │  - Heuristic Fallback     │
                        │  - Evidence Citations     │
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │    Multi-Format Reports   │
                        │  - PDF Report (PDFKit)    │
                        │  - Responsive HTML View   │
                        │  - Machine-readable JSON  │
                        └───────────────────────────┘
```

1. **Market-Driven Taxonomy**: Queries live job postings from Jobicy and Arbeitnow to detect high-demand skills for target roles (e.g. *Software Engineer Intern*, *Backend Developer*).
2. **Repository & Code Auditing**: Scans public repositories, inspecting project manifests (`package.json`, `requirements.txt`, `Dockerfile`) and code files matching role taxonomy.
3. **Dual Judge Engine**:
   - **OpenAI LLM Judge** (`gpt-4o-mini` or your model of choice) for semantic evaluation of usage depth.
   - **Rule-Based Heuristic Judge** fallback: works completely offline without an OpenAI key!
4. **Incremental Change Detection**: Tracks tree SHAs to only re-inspect files that actually changed across commits, carrying forward historical evidence for untouched repos.
5. **Reassessment Loop Diffing**: Detects and highlights status transitions (e.g. `SQL: not_demonstrated -> demonstrated`) and cites exact file lines.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20.6.0 or later (Node v24 recommended)
- **npm**: standard npm package manager

> **Windows Tip**: If PowerShell execution policy restricts scripts (`npm.ps1 cannot be loaded`), run `npm.cmd` or run PowerShell as Administrator and execute `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### 2. Installation

Clone or open the repository directory:
```bash
cd "c:\Users\Kunal Chavan\Documents\Skill Trace"
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your settings:
```ini
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_optional

# OpenRouter (Qwen 2.5 7B model)
OPENROUTER_API_KEY=your_openrouter_api_key_optional
OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct

# Optional: Direct OpenAI fallback if desired
# OPENAI_API_KEY=your_openai_key
# OPENAI_MODEL=gpt-4o-mini

POLL_MINUTES=10
```

* **`GITHUB_TOKEN`** *(Recommended)*: GitHub public repo read access. Without a token, GitHub limits unauthenticated requests to 60/hour. With a token, you get 5,000/hour.
* **`OPENROUTER_API_KEY`** *(Recommended)*: Uses OpenRouter to query Alibaba's high-speed, cost-effective `qwen/qwen-2.5-7b-instruct` model.
* **Fallback**: If no API key is provided, the coach automatically falls back to the deterministic rule-based judge.
* **`POLL_MINUTES`**: Interval for background scanning of tracked student profiles.

---

## 🏃 Running the Application

### Option A: Unified Full-Stack Server (Recommended)
Builds the frontend and runs the complete app on a single port:
```bash
# Build the Figma React frontend
npm run build:frontend

# Start the Node.js server
npm start
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser. The Node.js backend serves the compiled, full Figma React dashboard, handles API audits, generates PDFs, and listens for webhooks!

### Option B: Frontend Hot-Reload Development Mode
If you are tweaking the UI and want instant Vite HMR (Hot Module Replacement):
1. **Terminal 1** (Backend API):
   ```bash
   npm start
   ```
2. **Terminal 2** (Frontend with Vite Proxy):
   ```bash
   npm run dev:frontend
   ```
   Open **http://localhost:5173** (Vite automatically proxies `/analyze`, `/report`, `/api`, and `/github-push` to backend port 3000).

---

### 🎨 Integrated Figma UI Features
- **Overview Dashboard**: High-level match rate, demonstrated vs missing skills, and live requirement cards.
- **Run Analysis**: Enter any GitHub handle (e.g. `demo-candidate`, `octocat`) and target role to launch live background audits.
- **Repository Evidence**: Inspect matching code snippets with exact line citations, file paths, and instant PDF download.
- **Webhook Simulator**: Test simulated Git pushes and watch the live terminal logs reflect incremental reassessment.
- **Analysis History**: View completed portfolio audits and compare candidate matches.

---

## 🧪 5-Minute Demo Script

Want to see the entire feedback loop in action without needing to commit code to GitHub manually? Run the built-in demo script:

```bash
npm run demo
```
*(Or `node demo.js`)*

**What this demonstrates:**
1. Establishes a baseline student profile where **SQL** and **Docker** are *not demonstrated*, and **Python** is *partial*.
2. Simulates candidate commits adding `schema.sql` (with joins and constraints), `app/main.py` (FastAPI), and a multi-stage `Dockerfile`.
3. Runs the incremental reassessment loop.
4. Outputs the diff comparison (`SQL: not_demonstrated -> demonstrated`).
5. Generates an actual PDF report saved to `data/demo-assessment-report.pdf`.

---

## 🚦 Automated Test Suite

Run the full end-to-end test suite:
```bash
npm test
```
*(Or `node test.js`)*

Tests verify:
- Skill taxonomy normalization and keyword tokenization.
- Heuristic rule-based judging logic.
- Graceful OpenAI fallback behavior.
- Live Jobicy and Arbeitnow API requirement discovery.
- Reassessment diffing and status progression.
- PDF generation and piping to writable streams.
- HTTP server endpoints (`/`, `/analyze`, `/github-push`, `/report`).

---

## 📡 API Reference

### 1. Trigger Audit
**`POST /analyze`**
Starts an audit for a candidate.

**Request Body:**
```json
{
  "github_username": "octocat",
  "target_role": "Backend Developer"
}
```

**Response (HTTP 202 Accepted):**
```json
{
  "status": "accepted",
  "report_pdf": "/report?github_username=octocat",
  "report_html": "/report?format=html&github_username=octocat",
  "report_json": "/report?format=json&github_username=octocat"
}
```

---

### 2. View Assessment Reports
**`GET /report?github_username=<username>&format=<pdf|html|json>`**

- **PDF (Default)**: `GET /report?github_username=octocat` (or `format=pdf`)
  Streams a formatted PDF generated dynamically via PDFKit.
- **HTML Dashboard**: `GET /report?github_username=octocat&format=html`
  Interactive browser view with skill status cards, code snippets, direct links to lines on GitHub, and gap closure advice.
- **JSON**: `GET /report?github_username=octocat&format=json`
  Full structured report data including summary counts, timeline, and cited evidence.

---

### 3. GitHub Push Webhook
**`POST /github-push`**
Receives standard GitHub webhook `push` events for real-time reassessment.

1. In your GitHub repository: **Settings &rarr; Webhooks &rarr; Add webhook**.
2. **Payload URL**: `https://<your-public-url>/github-push`
3. **Content type**: `application/json`
4. **Events**: Just the `push` event.
*(For local testing with webhooks, use a tunnel like ngrok: `ngrok http 3000`)*.

---

## 🔄 The Real GitHub Commit Loop Walkthrough

1. Start your server:
   ```bash
   npm start
   ```
2. Trigger the initial assessment for your GitHub account:
   ```bash
   curl -X POST http://localhost:3000/analyze -H "Content-Type: application/json" -d '{"github_username":"YOUR_GITHUB_USER","target_role":"Backend Developer"}'
   ```
3. Open `http://localhost:3000/report?github_username=YOUR_GITHUB_USER&format=html`.
   - If you don't have SQL code in your public repositories, `SQL` will show as **NOT DEMONSTRATED**.
4. In any of your public repositories, commit a file named `db/schema.sql` containing:
   ```sql
   CREATE TABLE students (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE submissions (
       id SERIAL PRIMARY KEY,
       student_id INT REFERENCES students(id),
       skill VARCHAR(50),
       score NUMERIC(5,2)
   );

   SELECT s.name, AVG(sub.score) AS average_score
   FROM students s
   INNER JOIN submissions sub ON s.id = sub.student_id
   GROUP BY s.name;
   ```
5. Wait for the background poller (or trigger the webhook).
6. Refresh the report.
   - `SQL` will now transition to **DEMONSTRATED**.
   - The "What changed since first assessment" section will highlight the upgrade and cite `db/schema.sql#L1`.

---

## 🔒 Security & Data Persistence

- **Secrets**: Tokens and keys are read exclusively from environment variables or `.env`. `.env` and `data/` are listed in `.gitignore` to prevent committing sensitive keys.
- **Storage**: State is maintained in `data/db.json`. It is automatically initialized on startup and safely written with error handling.

---

## 📄 License
MIT
