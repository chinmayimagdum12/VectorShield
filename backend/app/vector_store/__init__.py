from app.core.config import settings
from app.vector_store.base import BaseVectorStore, VectorRecord
from app.vector_store.chroma_store import ChromaVectorStore
from app.vector_store.fallback_store import VectorShieldEngine

_vector_store_instance = None

def get_vector_store() -> BaseVectorStore:
    global _vector_store_instance
    if _vector_store_instance is not None:
        return _vector_store_instance

    if settings.VECTOR_DB_BACKEND == "chroma":
        try:
            _vector_store_instance = ChromaVectorStore()
            return _vector_store_instance
        except Exception as e:
            print(f"[VectorShield Warning] ChromaDB initialization encountered: {e}. Falling back to high-resilience VectorShieldEngine.")
            _vector_store_instance = VectorShieldEngine()
            return _vector_store_instance
    else:
        _vector_store_instance = VectorShieldEngine()
        return _vector_store_instance
