# Persona Hire — AI-Powered Placement Preparation Portal

> **Your potential. Your next opportunity.**  
> A full-stack career preparation SaaS platform helping college students assess their resumes, build ATS-friendly resumes, optimize for target job descriptions, and practice personalized one-to-one AI mock interviews.

---

## 🚀 Key Features

1. **AI Resume Analyzer**
   - Upload PDF or DOCX resumes (PyMuPDF & python-docx extraction with VLM/OCR detection).
   - Explainable rubric scoring out of 100 across 6 weighted categories:
     - *Skills & Technical Relevance (20%)*
     - *Projects & Practical Depth (25%)*
     - *Work Experience & Honors (20%)*
     - *ATS Readability & Structure (15%)*
     - *Education & Accreditations (10%)*
     - *Writing Impact & Google XYZ Formula (10%)*
   - Concrete before-and-after bullet rewrites, missing measurable metrics, and prioritized action checklist.

2. **AI Resume Studio (Resume Builder)**
   - Interactive structured editor for contact details, summary, education, experience, projects, and skills.
   - Live side-by-side preview with real-time updates.
   - Template switcher (*Modern*, *Classic*, *Minimal*).
   - In-editor AI Bullet Enhancer with action verb and impact metric injection.
   - High-fidelity paginated PDF export with print CSS.

3. **Job Description Matcher**
   - Match candidate resumes against live job descriptions.
   - Transparent fit rubric score, matched vs. missing skills, and keyword coverage.
   - Tailored resume section recommendations and role-specific predicted interview questions.

4. **One-to-One AI Mock Interview**
   - Multi-turn interactive interview with adaptive context awareness referencing actual resume projects.
   - Web Speech API speech-to-text input with live recording indicator + text-only fallback.
   - Optional speech synthesis (TTS) reading questions aloud.
   - Immediate per-answer feedback (technical accuracy, communication clarity, STAR format adherence).
   - Post-interview evaluation scorecard with comprehensive coaching feedback.

5. **Placement Readiness Dashboard & Roadmap**
   - Multidimensional readiness radar chart.
   - Dynamic "Your Next Best Action" recommendation engine.
   - Prioritized roadmap with persistent task completion tracking.

---

## 🛠 Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Lucide Icons, Recharts, Canvas Confetti.
- **Backend:** Python FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PyMuPDF, python-docx, JWT authentication.
- **AI Engine:**
  - **Primary Provider:** Groq API (`llama-3.3-70b-versatile`)
  - **Automatic Failover:** OpenRouter API (`meta-llama/llama-3.3-70b-instruct`)
  - **Heuristic Engine:** Intelligent rule-based evaluator when offline or API keys are unconfigured.
- **Database & Storage:** PostgreSQL 16 (with automatic local SQLite fallback for standalone native dev), Redis 7.
- **Containerization:** Docker & Docker Compose.

---

## 🐳 Docker-First Development Environment

Developers can start the entire stack using Docker Compose without installing Python, Node.js, or PostgreSQL on their host machine.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ensure the WSL2 backend is enabled on Windows).

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Insert your `GROQ_API_KEY` or `OPENROUTER_API_KEY` in `.env` if you wish to use live provider APIs. Otherwise, the built-in intelligent heuristic engine handles all requests automatically).*

### 3. Start Development Services
Build and start all containers (Frontend, Backend, PostgreSQL, Redis, Worker):
```bash
docker compose up --build
```

To run in the background (detached mode):
```bash
docker compose up --build -d
```

### 4. Verify Services
Check running containers:
```bash
docker compose ps
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/v1/diagnostics/health](http://localhost:8000/api/v1/diagnostics/health)

### 5. Follow Container Logs
```bash
# Follow backend logs
docker compose logs -f backend

# Follow worker logs
docker compose logs -f worker

# Follow frontend logs
docker compose logs -f frontend
```

### 6. Run Database Migrations
Database tables are automatically created on container boot. To explicitly execute Alembic migrations:
```bash
docker compose exec backend alembic upgrade head
```

### 7. Stop Services
Stop containers while **preserving** database data:
```bash
docker compose down
```

> ⚠️ **CAUTION:** To reset and delete the development database volume:
> ```bash
> docker compose down -v
> ```

---

## 💻 Standalone Host Development (Without Docker)

You can also run Persona Hire directly on Windows, macOS, or Linux:

### Backend Setup:
```bash
# 1. Open a terminal in the backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start FastAPI server with live reload (defaults to persona_hire.db SQLite fallback if PostgreSQL is not running)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup:
```bash
# 1. Open a terminal in the frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🧪 Automated Testing

Run the comprehensive API test suite covering registration, auth, resume analysis scoring, bullet rewriting, and the multi-turn mock interview lifecycle:

```bash
python -m pytest backend/tests/test_api.py -v
```

All 7 test suites validate:
- System diagnostics & AI provider status
- Instant demo student login
- User registration & JWT verification
- Resume document creation & explainable rubric analysis
- AI bullet point rewriting (XYZ formula)
- End-to-end mock interview session flow & evaluation report

---

## 🎨 Visual Identity & Brand System

- **Primary Canvas:** Light theme only (`#F8FAFC` background, `#FFFFFF` surface)
- **Primary Indigo:** `#4F46E5` (Hover: `#4338CA`, Deep Indigo: `#3730A3`)
- **Typography:** Inter
- **Alert Tiers:** Success `#16A34A`, Warning `#D97706`, Error `#DC2626`
- **Design Philosophy:** Restrained shadows, compact cards, generous whitespace, zero decorative clutter.

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5173 in use** | Another Vite or web server is running | Kill the process occupying port 5173 or pass `--port 5174`. |
| **Port 8000 in use** | Another Uvicorn/Python process running | Terminate old Uvicorn process or configure a different port. |
| **Docker named pipe error** | Docker Desktop engine is stopped | Launch Docker Desktop and verify the whale icon shows "Engine running". |
| **Microphone not capturing** | Browser permission or non-HTTPS/localhost | Grant microphone permissions in your browser's site settings pill. |

---

## 📄 License
MIT License. Built for university placement preparation and campus hiring excellence.
