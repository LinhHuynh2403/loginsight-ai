# LogInsight AI — AI-Powered Log Observability Platform

A lightweight observability tool that ingests raw application logs, uses Gemini 2.5 Flash to auto-diagnose `ERROR`/`WARN` events with root-cause analysis, and visualizes system health in real time. Built to replicate the core workflow of tools like Datadog/Sentry on a small scale.

## Architecture

```
Log file (.log/.txt)
      │
      ▼
FastAPI upload endpoint
      │
      ▼
Regex parsing engine → structured JSON (timestamp, level, message)
      │
      ▼
Conditional AI routing:
  INFO  → skipped (saves latency + API cost)
  ERROR/WARN/CRITICAL → deduplicated → Gemini 2.5 Flash
      │                                (root cause + severity, capped at
      │                                 20 calls/upload, dedup via cache)
      ▼
JSON response → React dashboard
      │
      ▼
Recharts (error-rate timeline, level distribution) + interactive table
with click-to-inspect AI diagnostics
```

## Tech Stack
**Backend:** FastAPI, Uvicorn, `google-genai` SDK, regex-based log parser
**Frontend:** React, Vite, Tailwind CSS, Recharts

## Key Engineering Decisions
- **Conditional AI routing** — `INFO` logs never touch the LLM. Only `ERROR`/`WARN`/`CRITICAL` trigger a Gemini call, cutting both cost and response latency on noisy log files.
- **Deduplication + call cap** — identical error messages are diagnosed once and cached; AI calls are capped per upload (20) to keep cost and latency predictable on large files.
- **Parallel AI dispatch** — diagnostic calls run concurrently via `asyncio.gather` instead of sequentially, so a file with many unique errors doesn't serialize into a slow waterfall.
- **Environment-driven CORS** — allowed origins are read from `ALLOWED_ORIGINS` so the same codebase runs locally and in production without code changes.

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # then fill in GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Visit `http://localhost:5173`, upload a `.log`/`.txt` file (see `test_server.log` for a sample format), and watch it parse, analyze, and visualize.

## Sample Log Format
```
2026-06-29 10:00:00 [INFO] Connection to gateway established successfully.
2026-06-29 10:01:15 [ERROR] OperationalError: (psycopg2.OperationalError) FATAL: password authentication failed for user "admin"
```