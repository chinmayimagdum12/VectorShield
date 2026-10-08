import numpy as np
from fastapi import APIRouter
from typing import List, Dict, Any
from sklearn.decomposition import PCA
from app.vector_store import get_vector_store

router = APIRouter(prefix="/vector", tags=["Vector"])

@router.get("/explore")
def explore_vectors():
    vs = get_vector_store()
    records = vs.get_all(limit=150)

    # If few records, supply synthetic cluster points alongside real ones to provide rich 2D exploration
    embeddings = []
    points = []

    for r in records:
        if r.embedding:
            embeddings.append(r.embedding)
            meta = r.metadata or {}
            points.append({
                "id": r.id,
                "text": r.text[:120] + "...",
                "source": meta.get("source", "corpus"),
                "trust_tier": meta.get("trust_tier", "tier_1"),
                "risk_score": float(meta.get("risk_score", 0.0)),
                "cluster": "Indexed Corpus",
                "is_poisoned": float(meta.get("risk_score", 0.0)) > 60.0
            })

    # Add reference cluster nodes to demonstrate vector geometry
    if len(embeddings) < 15:
        np.random.seed(42)
        categories = [
            ("Financial Records", [0.8, 0.2, 0.1], "tier_1", 12.0, False),
            ("Cloud Infrastructure", [0.1, 0.9, 0.3], "tier_1", 8.0, False),
            ("Adversarial Injections", [-0.8, -0.6, -0.4], "tier_2", 88.5, True),
            ("HR & Employee Policies", [0.3, -0.7, 0.6], "tier_1", 15.0, False),
            ("Sanitized RAG Context", [0.4, 0.5, -0.2], "tier_0", 5.0, False),
        ]
        for cat_name, base_dir, tier, rscore, is_p in categories:
            for i in range(8):
                noise = np.random.normal(0, 0.08, 384)
                vec = np.zeros(384, dtype=np.float32)
                vec[0] = base_dir[0]
                vec[1] = base_dir[1]
                vec[2] = base_dir[2]
                vec += noise
                vec = vec / np.linalg.norm(vec)
                embeddings.append(vec.tolist())
                points.append({
                    "id": f"syn_{cat_name[:3]}_{i}",
                    "text": f"Knowledge point relating to {cat_name} #{i+1}",
                    "source": cat_name.lower().replace(" ", "_"),
                    "trust_tier": tier,
                    "risk_score": rscore + np.random.uniform(-4, 4),
                    "cluster": cat_name,
                    "is_poisoned": is_p
                })

    # Project to 2D using PCA
    arr = np.array(embeddings, dtype=np.float32)
    pca = PCA(n_components=2)
    coords_2d = pca.fit_transform(arr)

    # Normalize to -100 to 100 canvas coordinate space
    norm_coords = coords_2d * 50.0

    for i, pt in enumerate(points):
        pt["x"] = round(float(norm_coords[i, 0]), 2)
        pt["y"] = round(float(norm_coords[i, 1]), 2)

    return {
        "total_vectors": len(points),
        "explained_variance": [round(float(v), 4) for v in pca.explained_variance_ratio_],
        "points": points
    }
