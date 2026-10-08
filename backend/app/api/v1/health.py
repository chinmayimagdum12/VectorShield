from fastapi import APIRouter
from app.core.config import settings
from app.vector_store import get_vector_store

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
@router.get("/")
def get_health():

    vs = get_vector_store()
    doc_count = vs.count()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "vector_backend": settings.VECTOR_DB_BACKEND,
        "indexed_chunks": doc_count,
        "block_threshold": settings.BLOCK_RISK_THRESHOLD,
        "quarantine_threshold": settings.QUARANTINE_THRESHOLD,
        "canary_active": bool(settings.CANARY_TOKEN)
    }
