import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed_data import seed_database
from backend.app.routers import (
    dashboard, knowledge_base, claims, terminology, documents, reviews, audit, seed
)

# Create tables
Base.metadata.create_all(bind=engine)

# Auto-seed if database is empty
try:
    with SessionLocal() as db:
        seed_database(db, force=False)
except Exception as e:
    print(f"Initial seeding note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BrandGuard: Deterministic, evidence-backed brand compliance & content analysis platform."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(knowledge_base.router, prefix=settings.API_PREFIX)
app.include_router(claims.router, prefix=settings.API_PREFIX)
app.include_router(terminology.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(reviews.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)
app.include_router(seed.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs"
    }

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "docs": "/docs"
        }

