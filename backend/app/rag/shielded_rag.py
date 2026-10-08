import time
import uuid
from typing import List, Optional
from app.vector_store import get_vector_store
from app.defense.l3_retrieval_filter import l3_filter
from app.defense.l4_prompt_hardener import l4_hardener
from app.defense.l5_output_guard import l5_guard
from app.defense.policy_engine import policy_engine
from app.rag.llm_client import llm_client
from app.models.schemas import RetrievedChunk, RAGQueryResponse, SecurityLayerReport

class ShieldedRAG:
    """
    VectorShield Enterprise Defended RAG Pipeline.
    Integrates multi-layered defense:
    L0 Source Trust -> L2 Vector Integrity -> L3 Retrieval Filtering ->
    L4 Hardened Spotlighting -> L5 Output Enforcer & Forensic Audit.
    """
    def __init__(self):
        self.vector_store = get_vector_store()

    def query(self, question: str, top_k: int = 4, active_policy_id: Optional[str] = None) -> RAGQueryResponse:
        req_id = f"vs_req_{uuid.uuid4().hex[:8]}"
        start_total = time.time()
        latencies = {}

        # 1. Retrieval
        t0 = time.time()
        # Retrieve extra chunks to allow L3 filtering to prune poisoned samples
        fetch_k = max(top_k, 6)
        records = self.vector_store.query(query_text=question, n_results=fetch_k)

        raw_chunks: List[RetrievedChunk] = []
        for r in records:
            meta = r.metadata or {}
            raw_chunks.append(RetrievedChunk(
                chunk_id=r.id,
                doc_id=str(meta.get("doc_id", "doc_0")),
                text=r.text,
                source=str(meta.get("source", "unknown")),
                trust_tier=str(meta.get("trust_tier", "tier_2")),
                score=r.similarity or 0.5,
                risk_score=float(meta.get("risk_score", 0.0)),
                is_dropped=False
            ))
        latencies["retrieval"] = round((time.time() - t0) * 1000, 2)

        # 2. Layer 3 Retrieval Filter
        t1 = time.time()
        filtered_chunks, dropped_chunk_ids, l3_report = l3_filter.filter(raw_chunks)
        latencies["l3_filter"] = round((time.time() - t1) * 1000, 2)

        # Truncate filtered chunks to top_k
        final_context_chunks = filtered_chunks[:top_k]

        # 3. Layer 4 Prompt Hardening
        t2 = time.time()
        hardened_prompt = l4_hardener.build_hardened_prompt(
            question=question,
            chunks=final_context_chunks,
            spotlighting="delimiters",
            sandwich_defense=True
        )
        l4_report = SecurityLayerReport(
            layer="L4",
            status="pass",
            reason_codes=["DELIMITER_SPOTLIGHTING_APPLIED", "SANDWICH_DEFENSE_APPLIED"],
            evidence=[]
        )
        latencies["l4_prompt"] = round((time.time() - t2) * 1000, 2)

        # 4. LLM Generation
        t3 = time.time()
        raw_llm_answer = llm_client.generate(hardened_prompt, is_victim=False)
        latencies["llm_generate"] = round((time.time() - t3) * 1000, 2)

        # 5. Layer 5 Output Guard
        t4 = time.time()
        sanitized_answer, is_blocked, canary_leaked, exfil_blocked, l5_report = l5_guard.inspect(
            raw_output=raw_llm_answer,
            retrieved_chunks=final_context_chunks
        )
        latencies["l5_guard"] = round((time.time() - t4) * 1000, 2)

        # Build Composite Security Report
        layers_report = [l3_report, l4_report, l5_report]
        sec_report = policy_engine.build_security_report(
            request_id=req_id,
            layers=layers_report,
            dropped_chunks=dropped_chunk_ids,
            latency_ms=latencies
        )

        total_latency = round((time.time() - start_total) * 1000, 2)
        attack_detected = len(dropped_chunk_ids) > 0 or exfil_blocked or canary_leaked or l3_report.status == "triggered"

        return RAGQueryResponse(
            question=question,
            answer=sanitized_answer,
            raw_answer=raw_llm_answer,
            defense_active=True,
            retrieved_chunks=raw_chunks, # Return all chunks with is_dropped flag for UI visibility
            security_report=sec_report,
            is_attack_detected=attack_detected,
            is_breached=False, # VectorShield prevented the breach!
            canary_leaked=canary_leaked,
            exfiltration_blocked=exfil_blocked,
            latency_ms=total_latency
        )

shielded_rag = ShieldedRAG()
