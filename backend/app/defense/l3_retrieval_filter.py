import numpy as np
from typing import List, Tuple, Dict, Any
from app.models.schemas import RetrievedChunk, SecurityLayerReport
from app.defense.l1_sanitizer import l1_sanitizer

class L3RetrievalFilter:
    """
    Layer 3: Retrieval Filter & Adversarial Anomaly Detector
    Performs runtime post-retrieval verification, anomaly outlier checks,
    near-duplicate flood suppression, and source trust diversity reranking.
    """
    def __init__(self, sigma_threshold: float = 2.2, max_chunks_per_doc: int = 2):
        self.sigma_threshold = sigma_threshold
        self.max_chunks_per_doc = max_chunks_per_doc

    def filter(self, chunks: List[RetrievedChunk]) -> Tuple[List[RetrievedChunk], List[str], SecurityLayerReport]:
        if not chunks:
            return [], [], SecurityLayerReport(layer="L3", status="pass", reason_codes=[], evidence=[])

        dropped_chunk_ids = []
        reason_codes = []
        evidence = []
        filtered_chunks: List[RetrievedChunk] = []

        # 1. Real-time L1 rescan on retrieved chunks
        for chunk in chunks:
            scan_res = l1_sanitizer.scan(chunk.text)
            if scan_res.risk_score >= 65.0:
                chunk.is_dropped = True
                chunk.drop_reason = f"L1_INJECTION_DETECTED ({scan_res.risk_score:.1f})"
                chunk.risk_score = scan_res.risk_score
                dropped_chunk_ids.append(chunk.chunk_id)
                for f in scan_res.findings:
                    if f.reason_code not in reason_codes:
                        reason_codes.append(f.reason_code)
                evidence.append({
                    "chunk_id": chunk.chunk_id,
                    "reason": "L1_SCAN_FLAG",
                    "risk_score": scan_res.risk_score,
                    "findings": [f.model_dump() for f in scan_res.findings]
                })

        # 2. Similarity Outlier Check (if 3+ chunks retrieved)
        active_chunks = [c for c in chunks if not c.is_dropped]
        if len(active_chunks) >= 3:
            scores = [c.score for c in active_chunks]
            mean_score = float(np.mean(scores))
            std_score = float(np.std(scores))

            if std_score > 0.05:
                # For small retrieval sizes (e.g. k=4), sample z-score is mathematically bounded by (n-1)/sqrt(n)
                effective_sigma = min(self.sigma_threshold, 1.45) if len(active_chunks) <= 5 else self.sigma_threshold
                for chunk in active_chunks:
                    z_score = (chunk.score - mean_score) / std_score
                    if z_score >= effective_sigma:
                        chunk.is_dropped = True
                        chunk.drop_reason = f"SIMILARITY_OUTLIER (z={z_score:.2f})"
                        dropped_chunk_ids.append(chunk.chunk_id)

                        if "RETR_OUTLIER" not in reason_codes:
                            reason_codes.append("RETR_OUTLIER")
                        evidence.append({
                            "chunk_id": chunk.chunk_id,
                            "reason": "SIMILARITY_OUTLIER",
                            "score": chunk.score,
                            "z_score": z_score
                        })

        # 3. Near-Duplicate Flood Check (Repetition stuffing)
        active_chunks = [c for c in chunks if not c.is_dropped]
        for i in range(len(active_chunks)):
            for j in range(i + 1, len(active_chunks)):
                c1 = active_chunks[i]
                c2 = active_chunks[j]
                if c2.is_dropped:
                    continue
                # Simple token overlap Jaccard
                tokens1 = set(c1.text.lower().split())
                tokens2 = set(c2.text.lower().split())
                if tokens1 and tokens2:
                    jaccard = len(tokens1 & tokens2) / len(tokens1 | tokens2)
                    if jaccard > 0.85:
                        c2.is_dropped = True
                        c2.drop_reason = f"NEAR_DUP_FLOOD (jaccard={jaccard:.2f})"
                        dropped_chunk_ids.append(c2.chunk_id)
                        if "DUP_FLOOD" not in reason_codes:
                            reason_codes.append("DUP_FLOOD")
                        evidence.append({
                            "chunk_id": c2.chunk_id,
                            "reason": "NEAR_DUPLICATE_FLOOD",
                            "partner_id": c1.chunk_id,
                            "jaccard": jaccard
                        })

        # 4. Source Diversity Cap & Trust Rerank
        active_chunks = [c for c in chunks if not c.is_dropped]
        doc_chunk_counts: Dict[str, int] = {}
        
        for chunk in active_chunks:
            # Trust weighting: low-trust tier penalizes rank
            if chunk.trust_tier == "tier_2":
                chunk.score *= 0.85

            count = doc_chunk_counts.get(chunk.doc_id, 0)
            if count >= self.max_chunks_per_doc:
                chunk.is_dropped = True
                chunk.drop_reason = "SOURCE_DIVERSITY_CAP_EXCEEDED"
                dropped_chunk_ids.append(chunk.chunk_id)
                if "SOURCE_DIVERSITY_CAP" not in reason_codes:
                    reason_codes.append("SOURCE_DIVERSITY_CAP")
            else:
                doc_chunk_counts[chunk.doc_id] = count + 1
                filtered_chunks.append(chunk)

        # Sort filtered chunks by adjusted score descending
        filtered_chunks.sort(key=lambda x: x.score, reverse=True)

        status = "triggered" if dropped_chunk_ids else "pass"
        layer_report = SecurityLayerReport(
            layer="L3",
            status=status,
            reason_codes=reason_codes,
            evidence=evidence
        )

        return filtered_chunks, dropped_chunk_ids, layer_report

l3_filter = L3RetrievalFilter()
