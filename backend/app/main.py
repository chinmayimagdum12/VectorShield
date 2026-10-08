import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models.schemas as schemas

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto-seed baseline documents on startup if empty
def startup_seed():
    db = SessionLocal()
    try:
        from app.models.schemas import DocumentModel, DefensePolicyModel
        doc_count = db.query(DocumentModel).count()
        if doc_count == 0:
            from app.api.v1.documents import seed_corpus
            seed_corpus(db=db)
        
        pol_count = db.query(DefensePolicyModel).count()
        if pol_count == 0:
            default_pol = DefensePolicyModel(
                id="pol_default",
                name="Default Enterprise Defense Policy",
                is_active=True,
                l0_enabled=True,
                l1_enabled=True,
                l2_enabled=True,
                l3_enabled=True,
                l4_enabled=True,
                l5_enabled=True,
                block_threshold=settings.BLOCK_RISK_THRESHOLD,
                quarantine_threshold=settings.QUARANTINE_THRESHOLD,
                similarity_sigma=settings.SIMILARITY_OUTLIER_SIGMA,
                canary_token=settings.CANARY_TOKEN,
                allowed_domains=settings.ALLOWED_DOMAINS
            )
            db.add(default_pol)
            db.commit()
    except Exception as e:
        print(f"[VectorShield Seed Notice] {e}")
    finally:
        db.close()

startup_seed()

app = FastAPI(
    title="VectorShield Defense Platform API",
    description="Enterprise Multi-Layered Defense & Evaluation Platform for RAG Applications",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api.v1.health import router as health_router
from app.api.v1.rag import router as rag_router
from app.api.v1.scanner import router as scanner_router
from app.api.v1.documents import router as documents_router
from app.api.v1.quarantine import router as quarantine_router
from app.api.v1.attacks import router as attacks_router
from app.api.v1.benchmark import router as benchmark_router
from app.api.v1.vector import router as vector_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.policies import router as policies_router

API_V1_STR = "/api/v1"
app.include_router(health_router, prefix=API_V1_STR)
app.include_router(rag_router, prefix=API_V1_STR)
app.include_router(scanner_router, prefix=API_V1_STR)
app.include_router(documents_router, prefix=API_V1_STR)
app.include_router(quarantine_router, prefix=API_V1_STR)
app.include_router(attacks_router, prefix=API_V1_STR)
app.include_router(benchmark_router, prefix=API_V1_STR)
app.include_router(vector_router, prefix=API_V1_STR)
app.include_router(incidents_router, prefix=API_V1_STR)
app.include_router(policies_router, prefix=API_V1_STR)

# Mount Frontend static build if available
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "platform": "VectorShield Multi-Layered Defense Platform",
            "version": settings.VERSION,
            "status": "operational",
            "docs": "/docs",
            "api_prefix": API_V1_STR
        }
