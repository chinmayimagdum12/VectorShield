import os
import json
import sqlite3
import numpy as np
from typing import List, Dict, Any, Optional

from app.vector_store.base import BaseVectorStore, VectorRecord
from app.vector_store.embedder import embedder

class VectorShieldEngine(BaseVectorStore):
    """
    Bulletproof Persistent Vector Engine using SQLite + NumPy.
    Guarantees zero-dependency failure rate, high performance cosine search,
    metadata filtering, and atomic disk persistence.
    """
    def __init__(self, db_path: str = "./data/vectorshield_native.db"):
        self.db_path = os.path.abspath(db_path)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS vector_index (
                    id TEXT PRIMARY KEY,
                    document TEXT,
                    metadata_json TEXT,
                    embedding_blob BLOB
                )
            """)
            conn.commit()

    def add(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]) -> None:
        if not ids:
            return
        embeddings = embedder.embed_texts(documents)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            for doc_id, doc_text, meta, emb in zip(ids, documents, metadatas, embeddings):
                arr = np.array(emb, dtype=np.float32)
                cursor.execute("""
                    INSERT OR REPLACE INTO vector_index (id, document, metadata_json, embedding_blob)
                    VALUES (?, ?, ?, ?)
                """, (doc_id, doc_text, json.dumps(meta), arr.tobytes()))
            conn.commit()

    def query(self, query_text: str, n_results: int = 4, where: Optional[Dict[str, Any]] = None) -> List[VectorRecord]:
        total = self.count()
        if total == 0:
            return []

        q_vec = np.array(embedder.embed_query(query_text), dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 1e-8:
            q_vec = q_vec / q_norm

        records: List[VectorRecord] = []
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, document, metadata_json, embedding_blob FROM vector_index")
            rows = cursor.fetchall()

        scores = []
        for row in rows:
            rec_id, doc_text, meta_json, blob = row
            meta = json.loads(meta_json) if meta_json else {}

            # Apply where filter if specified
            if where:
                match = True
                for k, v in where.items():
                    if meta.get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            vec = np.frombuffer(blob, dtype=np.float32)
            v_norm = np.linalg.norm(vec)
            if v_norm > 1e-8:
                vec = vec / v_norm
            similarity = float(np.dot(q_vec, vec))
            distance = float(1.0 - similarity)
            scores.append((similarity, distance, rec_id, doc_text, meta, vec.tolist()))

        # Sort descending by cosine similarity
        scores.sort(key=lambda x: x[0], reverse=True)
        top = scores[:n_results]

        for sim, dist, rec_id, doc_text, meta, emb in top:
            records.append(VectorRecord(
                id=rec_id,
                text=doc_text,
                metadata=meta,
                embedding=emb,
                distance=dist,
                similarity=max(0.0, min(1.0, sim))
            ))
        return records

    def delete(self, ids: List[str]) -> None:
        if not ids:
            return
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.executemany("DELETE FROM vector_index WHERE id = ?", [(i,) for i in ids])
            conn.commit()

    def count(self) -> int:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM vector_index")
            row = cursor.fetchone()
            return row[0] if row else 0

    def get_all(self, limit: int = 100) -> List[VectorRecord]:
        records = []
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, document, metadata_json, embedding_blob FROM vector_index LIMIT ?", (limit,))
            rows = cursor.fetchall()
            for rec_id, doc_text, meta_json, blob in rows:
                meta = json.loads(meta_json) if meta_json else {}
                vec = np.frombuffer(blob, dtype=np.float32)
                records.append(VectorRecord(
                    id=rec_id,
                    text=doc_text,
                    metadata=meta,
                    embedding=vec.tolist(),
                    similarity=1.0
                ))
        return records
