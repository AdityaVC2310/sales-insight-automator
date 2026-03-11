# 🐇 RabbitAI — Sales Insight Automator

> **AI-powered sales data analysis and email delivery platform.**
> Upload a `.csv` or `.xlsx` file, and an LLM generates a professional narrative report delivered straight to any inbox.

[![CI](https://github.com/YOUR_USERNAME/RabbitAI/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/RabbitAI/actions/workflows/ci.yml)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Running Locally with Docker](#running-locally-with-docker)
- [Running Without Docker](#running-without-docker)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)

---

## Overview

RabbitAI is a "Quick-Response Tool" built for the Rabbitt AI engineering sprint. Sales teams upload bulky CSV/Excel exports and receive a concise, AI-generated executive summary by email — no manual analysis required.

**Flow:**
1. User uploads `.csv` / `.xlsx` on the frontend SPA  
2. Backend validates, parses, and sends data to an LLM (Groq Llama 3 or Google Gemini)  
3. AI returns an HTML narrative report  
4. Nodemailer delivers the report to the recipient's inbox  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI Engine | Groq (Llama 3.3 70B) **or** Google Gemini 2.0 Flash |
| Email | Nodemailer (SMTP — Gmail / Brevo / Resend) |
| API Docs | Swagger / OpenAPI 3.0 |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend) · Render (backend) |

---

## Live Demo

| | URL |
|---|---|
| 🌐 Frontend | `https://YOUR_FRONTEND_URL.vercel.app` |
| 📡 Backend API | `https://YOUR_BACKEND_URL.onrender.com` |
| 📄 Swagger Docs | `https://YOUR_BACKEND_URL.onrender.com/api-docs` |

---

## Running Locally with Docker

> **Fastest way to spin up the full stack.**

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/RabbitAI.git
cd RabbitAI

# 2. Create your backend environment file
cp .env.example server/.env
# Edit server/.env and fill in your API keys and SMTP credentials

# 3. Build and start both services
docker-compose up --build
```

**Services started:**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api-docs |

```bash
# Stop all containers
docker-compose down
```

> **Note:** On the first run, Docker pulls base images and installs dependencies — this takes 2–3 minutes. Subsequent starts are instant.

---

## Running Without Docker

### Backend

```bash
cd server
cp ../.env.example .env   # then fill in your values
npm install
npm start                 # runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:4000 npm run dev   # runs on http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `server/.env` and fill in the values:

```env
PORT=4000

# ── AI Provider ─────────────────────────────────────────────────
# Choose: "groq" or "gemini"
AI_PROVIDER=groq

# Groq (https://console.groq.com → API Keys)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Google Gemini (https://aistudio.google.com → Get API key)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# ── SMTP / Email ─────────────────────────────────────────────────
# Gmail: enable 2FA → generate an App Password (not your real password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your_email@gmail.com

# ── CORS ─────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000
```

> **Frontend variable:** Set `VITE_API_URL` in Vercel's environment settings (or in `frontend/.env` locally) to point to your deployed backend URL.

---

## Security

The backend is hardened against common vulnerabilities:

| Mechanism | Implementation |
|-----------|---------------|
| **HTTP security headers** | [`helmet`](https://helmetjs.github.io/) sets `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, etc. |
| **Rate limiting** | `express-rate-limit` — 100 requests per IP per 15 minutes. Returns `429 Too Many Requests` on breach. |
| **CORS** | Configurable origin whitelist via `CORS_ORIGIN` env var. Defaults to `*` in development. |
| **File validation** | Only `.csv`, `.xlsx`, `.xls` accepted; hard 10 MB cap enforced by Multer. |
| **Input sanitisation** | Email regex validation before any processing. |
| **No credential exposure** | All secrets live in `.env` (gitignored); `.env.example` ships with placeholder values only. |

---

## API Documentation

Interactive Swagger UI is available at `/api-docs`:

- **Local:** http://localhost:4000/api-docs  
- **Production:** `https://YOUR_BACKEND_URL.onrender.com/api-docs`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |
| `POST` | `/api/upload` | Upload a file + email → triggers AI analysis + email delivery |

---

## CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every **Pull Request to `main`**:

1. **Lint** — ESLint on the backend source  
2. **Build** — Vite production build of the frontend  
3. **Docker build** — validates both Dockerfiles build successfully  

No secrets are required for the CI checks; deployment is handled manually via Vercel and Render's Git integration.

---

## Project Structure

```
RabbitAI/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── docker-compose.yml          # Full-stack local orchestration
├── .env.example                # Template for required env vars
├── frontend/                   # React + Vite SPA
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx             # Main UI component
│   │   └── index.css           # Global styles
│   └── vite.config.js
└── server/                     # Express API
    ├── Dockerfile
    ├── src/
    │   ├── index.js            # App entry — security middleware, routes
    │   ├── routes/
    │   │   └── upload.js       # POST /api/upload handler
    │   ├── services/
    │   │   ├── aiService.js    # Groq / Gemini integration
    │   │   └── emailService.js # Nodemailer delivery
    │   └── config/
    │       └── swagger.js      # OpenAPI spec
    └── .env.example
```

---

## Deployment Guide

### Frontend → Vercel
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://YOUR_BACKEND_URL.onrender.com`
5. Deploy

### Backend → Render
1. Go to [render.com](https://render.com) → **New Web Service** → connect the repo
2. Set **Root Directory** to `server`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add all environment variables from `.env.example` in the Render dashboard
6. Deploy — your API URL + `/api-docs` is your Swagger endpoint

---

*Built for the Rabbitt AI Cloud DevOps Engineering Sprint.*

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- A **Groq** or **Google Gemini** API key (free tiers available)
- SMTP credentials for sending emails (Gmail App Password, Brevo, Resend, etc.)

---

### 1. Clone the Repository

```bash
git clone https://github.com/kunalbhatia2601/RabbitAI.git
cd RabbitAI
```

### 2. Setup the Backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your credentials (see [Environment Variables](#-environment-variables) below).

```bash
npm install
npm run dev
```

The backend will start at **http://localhost:4000**.
Swagger API docs are available at **http://localhost:4000/api-docs**.

### 3. Setup the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:5173**.

---

## 🔐 Environment Variables

Create a `server/.env` file (copy from `server/.env.example`) and configure:

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | Port the backend server runs on |

### AI Provider

| Variable | Required | Default | Description |
|---|---|---|---|
| `AI_PROVIDER` | No | `groq` | Which AI to use: `groq` or `gemini` |
| `GROQ_API_KEY` | Yes (if groq) | — | Get it free from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model to use |
| `GEMINI_API_KEY` | Yes (if gemini) | — | Get it from [aistudio.google.com](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Gemini model to use |

### Email (SMTP)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SMTP_HOST` | Yes | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | Yes | `587` | SMTP port |
| `SMTP_USER` | Yes | — | SMTP username / email address |
| `SMTP_PASS` | Yes | — | SMTP password or app-specific password |
| `SMTP_FROM` | No | Same as `SMTP_USER` | "From" address on sent emails |

> **Gmail Users:** Enable 2FA on your Google account, then generate an [App Password](https://myaccount.google.com/apppasswords) to use as `SMTP_PASS`.

---

## 🐳 Docker

Run the entire stack in containers:

```bash
# 1. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# 2. Build and run
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api-docs |

---

## 📡 API Reference

Interactive Swagger UI is available at `/api-docs` when the server is running.

### `POST /api/upload`

Upload a sales data file and receive an AI-generated report via email.

**Request:** `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| `file` | File | `.csv` or `.xlsx` file (max 10 MB) |
| `email` | String | Recipient email address |

**Response (200):**
```json
{
  "success": true,
  "message": "Report generated and sent to user@example.com",
  "report": "<h2>Executive Summary</h2>..."
}
```

### `GET /api/health`

Returns server health status.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| AI Engine | Groq (Llama 3.3) / Google Gemini |
| Email | Nodemailer (SMTP) |
| API Docs | Swagger / OpenAPI 3.0 |
| Security | Helmet, CORS, Rate Limiting |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions |