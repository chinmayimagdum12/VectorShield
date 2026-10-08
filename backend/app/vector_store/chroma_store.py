import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings
from app.vector_store.base import BaseVectorStore, VectorRecord
from app.vector_store.embedder import embedder

class ChromaVectorStore(BaseVectorStore):
    def __init__(self, collection_name: str = "vectorshield_corpus"):
        self.collection_name = collection_name
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        os.makedirs(self.persist_dir, exist_ok=True)
        
        # Configure Chroma persistent client
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False, is_persistent=True)
        )
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]) -> None:
        if not ids:
            return
        # Pre-compute embeddings using resilient embedder
        embeddings = embedder.embed_texts(documents)
        
        # Sanitize metadata for ChromaDB (no nested lists/dicts)
        clean_metadatas = []
        for m in metadatas:
            clean_m = {}
            for k, v in m.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_m[k] = v
                elif isinstance(v, list):
                    clean_m[k] = ",".join(str(x) for x in v)
                else:
                    clean_m[k] = str(v)
            clean_metadatas.append(clean_m)

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=clean_metadatas
        )

    def query(self, query_text: str, n_results: int = 4, where: Optional[Dict[str, Any]] = None) -> List[VectorRecord]:
        total = self.count()
        if total == 0:
            return []
        
        k = min(n_results, total)
        query_embedding = embedder.embed_query(query_text)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where,
            include=["documents", "metadatas", "distances", "embeddings"]
        )

        records: List[VectorRecord] = []
        if results and results.get("ids") and len(results["ids"][0]) > 0:
            count = len(results["ids"][0])
            for i in range(count):
                rec_id = results["ids"][0][i]
                doc_text = results["documents"][0][i] if results.get("documents") else ""
                meta = results["metadatas"][0][i] if results.get("metadatas") else {}
                dist = results["distances"][0][i] if results.get("distances") else 0.0
                emb = results["embeddings"][0][i] if results.get("embeddings") and results["embeddings"] is not None else None
                
                # Cosine similarity calculation: cosine distance d = 1 - sim => sim = 1 - d
                sim = max(0.0, min(1.0, 1.0 - (dist if dist is not None else 0.5)))

                records.append(VectorRecord(
                    id=rec_id,
                    text=doc_text,
                    metadata=meta,
                    embedding=emb,
                    distance=dist,
                    similarity=sim
                ))
        return records

    def delete(self, ids: List[str]) -> None:
        if ids:
            try:
                self.collection.delete(ids=ids)
            except Exception:
                pass

    def count(self) -> int:
        try:
            return self.collection.count()
        except Exception:
            return 0

    def get_all(self, limit: int = 100) -> List[VectorRecord]:
        try:
            results = self.collection.get(
                limit=limit,
                include=["documents", "metadatas", "embeddings"]
            )
            records = []
            if results and results.get("ids"):
                for i in range(len(results["ids"])):
                    rec_id = results["ids"][i]
                    doc_text = results["documents"][i] if results.get("documents") else ""
                    meta = results["metadatas"][i] if results.get("metadatas") else {}
                    emb = results["embeddings"][i] if results.get("embeddings") is not None and len(results["embeddings"]) > i else None
                    records.append(VectorRecord(
                        id=rec_id,
                        text=doc_text,
                        metadata=meta,
                        embedding=emb,
                        similarity=1.0
                    ))
            return records
        except Exception:
            return []
