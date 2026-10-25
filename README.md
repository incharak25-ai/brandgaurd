# BrandGuard: Evidence-Backed Brand Compliance Platform

BrandGuard is a brand compliance and content governance platform designed to ensure all marketing, legal, and technical communications adhere to brand guidelines, legal policies, and approved empirical claims.

Built entirely with **deterministic analysis** and **ground truth policy substantiation**, BrandGuard requires no external AI services, paid APIs, or cloud credentials.

---

## Architecture

* **Backend**: FastAPI (Python 3.14)
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Database**: SQLite with SQLAlchemy ORM
* **Migrations**: Alembic
* **Testing**: pytest and FastAPI TestClient

---

## Directory Structure

```
brandguard/
├── backend/
│   ├── .venv/                   # Project-local Python virtual environment
│   ├── requirements.txt         # Backend Python dependencies
│   ├── alembic/                 # Alembic migration environment
│   ├── alembic/versions/        # Schema migration revisions
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint
│   │   ├── config.py            # Settings and configurations
│   │   ├── database.py          # SQLAlchemy SQLite connection and session
│   │   ├── models.py            # Database schema models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── seed_data.py         # Rich fictional demo data seeder
│   │   ├── engine/
│   │   │   ├── analyzer.py      # Deterministic content-analysis engine
│   │   │   ├── extractor.py     # PDF, DOCX, and text file extractor
│   │   │   └── audit_service.py # Immutable audit logging service
│   │   └── routers/
│   │       ├── dashboard.py     # Real database metrics API
│   │       ├── knowledge_base.py# Source upload, extraction & versioning
│   │       ├── claims.py        # Claims Register CRUD
│   │       ├── terminology.py   # Prohibited & preferred terms CRUD
│   │       ├── documents.py     # Document creation, revisions & analysis
│   │       ├── reviews.py       # Human review workflow & approval queue
│   │       ├── audit.py         # Complete audit history trail
│   │       └── seed.py          # Demo data reset & seeding endpoint
│   └── tests/
│       ├── test_analyzer.py     # Unit tests for deterministic engine
│       └── test_api.py          # Integration tests for all API endpoints
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # Typed API client
│   │   ├── types/index.ts       # TypeScript interface models
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Header navigation & quick actions
│   │   │   ├── DashboardView.tsx      # Real-time metrics & recent stream
│   │   │   ├── DocumentListView.tsx   # Searchable document table & filters
│   │   │   ├── DocumentDetailView.tsx # Interactive editor, findings & review
│   │   │   ├── ApprovalQueueView.tsx  # Compliance review & approval queue
│   │   │   ├── KnowledgeBaseView.tsx  # Ground truth policy repository
│   │   │   ├── ClaimsRegisterView.tsx # Verified claims with substantiation
│   │   │   ├── TerminologyView.tsx    # Prohibited/preferred terms
│   │   │   ├── AuditLogView.tsx       # Immutable audit event history
│   │   │   └── NewDocumentModal.tsx   # Live draft testing & creation
│   │   ├── App.tsx              # Main application shell
│   │   └── main.tsx             # React DOM entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── brandguard.db                # SQLite database (auto-created & migrated)
└── alembic.ini                  # Alembic configuration
```

---

## Quick Start Instructions

### 1. Backend (FastAPI)

Activate the project-local virtual environment and run the server:

```bash
# From /Users/incharak/Downloads/brandguard
PYTHONPATH=. backend/.venv/bin/python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

* API Root: `http://127.0.0.1:8000`
* Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite + Tailwind CSS)

In a separate terminal tab:

```bash
cd frontend
npm run dev
```

* Frontend UI: `http://localhost:5173`

---

## Running Automated Tests

Run the test suite using pytest inside the virtual environment:

```bash
PYTHONPATH=. backend/.venv/bin/pytest backend/tests -v
```

All 11 tests cover:
* Prohibited term matching and replacement suggestions
* Prohibited claim detection
* Unsubstantiated quantitative and superlative claims detection
* Clean compliant copy validation (100% score)
* Dashboard metrics calculation
* Claims register CRUD operations
* Terminology rules CRUD operations
* Document creation and automated deterministic analysis
* Human review approval workflow & status transitions
* Immutable audit logging

---

## Database Migrations (Alembic)

To apply or verify schema migrations:

```bash
PYTHONPATH=. backend/.venv/bin/alembic upgrade head
```

---

## Key Features Implemented

1. **Dashboard with Real Database Metrics**: Real-time stats on document volume, compliance scores, approval queue size, findings severity distribution, and top prohibited terms.
2. **Knowledge Base Repository**: Ground truth policy manager supporting upload and text extraction from `.txt`, `.md`, `.pdf`, and `.docx` files with versioning and approval statuses.
3. **Claims Register**: Empirically verified claims repository containing substantiated evidence citations, category classifications, and confidence requirements.
4. **Terminology Rules Management**: Prohibited, preferred, competitor, and sensitive terms dictionary with preferred alternatives and legal contextual rationale.
5. **Deterministic Content-Analysis Engine**: Fully offline rule and pattern analysis engine checking word boundaries, prohibited terms, prohibited claims, absolute guarantees, and unsubstantiated metrics.
6. **Evidence-Backed Findings & Grounded Suggestions**: Flags violations with exact text coordinates, grounded policy citations, and one-click replacement suggestions.
7. **Document Creation & Revision History**: Multi-version tracking (`v1`, `v2`, etc.) with changelog notes and compliance score progression.
8. **Human Review Workflow & Approval Queue**: Dedicated approval queue for reviewers to record formal decisions (`approved`, `changes_requested`, `rejected`) accompanied by mandatory compliance rationales.
9. **Comments & Discussion**: Contextual review comments thread per document.
10. **Immutable Audit History**: Granular audit log capturing user actions, timestamps, entity types, and details.
11. **Fictional Demo Data**: Pre-seeded with ApexCore Technologies guidelines, claims, terminology, documents, decisions, and audit entries.
