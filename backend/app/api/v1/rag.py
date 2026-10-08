import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import (
    RAGQueryRequest, RAGQueryResponse, SideBySideCompareResponse,
    IncidentRecordModel
)
from app.rag.victim_rag import victim_rag
from app.rag.shielded_rag import shielded_rag

router = APIRouter(prefix="/rag", tags=["RAG"])

@router.post("/victim/query", response_model=RAGQueryResponse)
def query_victim(req: RAGQueryRequest):
    return victim_rag.query(question=req.question, top_k=req.top_k)

@router.post("/shield/query", response_model=RAGQueryResponse)
def query_shield(req: RAGQueryRequest, db: Session = Depends(get_db)):
    res = shielded_rag.query(question=req.question, top_k=req.top_k, active_policy_id=req.active_policy_id)

    # If attack detected or blocked, persist incident record
    if res.is_attack_detected or res.exfiltration_blocked:
        report = res.security_report
        incident = IncidentRecordModel(
            id=f"inc_{uuid.uuid4().hex[:8]}",
            request_id=report.request_id if report else f"req_{uuid.uuid4().hex[:6]}",
            timestamp=datetime.utcnow(),
            attack_family="ADVERSARIAL_QUERY",
            query_text=req.question,
            action_taken=report.action if report else "sanitize",
            risk_score=report.risk_score if report else 70.0,
            layers_triggered=[l.layer for l in (report.layers if report else []) if l.status == "triggered"],
            reason_codes=[c for l in (report.layers if report else []) for c in l.reason_codes],
            dropped_chunks=report.dropped_chunks if report else [],
            forensic_hash=report.forensic_hash if report else "none",
            latency_breakdown=report.latency_ms if report else {}
        )
        db.add(incident)
        db.commit()

    return res

@router.post("/compare", response_model=SideBySideCompareResponse)
def compare_query(req: RAGQueryRequest, db: Session = Depends(get_db)):
    # Run both simultaneously
    victim_res = victim_rag.query(question=req.question, top_k=req.top_k)
    shield_res = shielded_rag.query(question=req.question, top_k=req.top_k, active_policy_id=req.active_policy_id)

    attack_detected = shield_res.is_attack_detected or victim_res.is_breached
    attack_prevented = victim_res.is_breached and not shield_res.is_breached

    summary = ""
    if attack_prevented:
        summary = (
            "DEFENSE SUCCESS: The undefended victim RAG succumbed to the prompt injection payload, "
            "triggering instructions override / canary leakage. VectorShield successfully detected, "
            "filtered poisoned chunks, and sanitized outbound output, preserving safe grounded operation."
        )
    elif shield_res.is_attack_detected:
        summary = (
            "THREAT DETECTED: VectorShield identified suspicious retrieval patterns and neutralized "
            "potential exfiltration vectors while returning a secure factual response."
        )
    else:
        summary = "CLEAN QUERY: Both victim and shielded pipelines processed the benign query reliably."

    # Record incident if attack attempted
    if attack_detected:
        report = shield_res.security_report
        incident = IncidentRecordModel(
            id=f"inc_{uuid.uuid4().hex[:8]}",
            request_id=report.request_id if report else f"req_{uuid.uuid4().hex[:6]}",
            timestamp=datetime.utcnow(),
            attack_family="SANDBOX_DUEL",
            query_text=req.question,
            action_taken=report.action if report else "mitigate",
            risk_score=report.risk_score if report else 75.0,
            layers_triggered=[l.layer for l in (report.layers if report else []) if l.status == "triggered"],
            reason_codes=[c for l in (report.layers if report else []) for c in l.reason_codes],
            dropped_chunks=report.dropped_chunks if report else [],
            forensic_hash=report.forensic_hash if report else "none",
            latency_breakdown=report.latency_ms if report else {}
        )
        db.add(incident)
        db.commit()

    return SideBySideCompareResponse(
        question=req.question,
        victim_response=victim_res,
        shielded_response=shield_res,
        attack_detected=attack_detected,
        attack_prevented=attack_prevented,
        mitigation_summary=summary
    )
