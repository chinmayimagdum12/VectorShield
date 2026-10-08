import uuid
import re
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import (
    DocumentModel, QuarantineRecordModel, IngestDocumentRequest
)
from app.defense.l0_trust import l0_trust
from app.defense.l1_sanitizer import l1_sanitizer
from app.defense.l2_indexer import l2_indexer
from app.vector_store import get_vector_store

router = APIRouter(prefix="/documents", tags=["Documents"])

def simple_chunker(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text]
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).order_by(DocumentModel.created_at.desc()).all()
    return [{
        "id": d.id,
        "title": d.title,
        "source": d.source,
        "trust_tier": d.trust_tier,
        "content_hash": d.content_hash,
        "is_quarantined": d.is_quarantined,
        "risk_score": d.risk_score,
        "chunk_count": d.chunk_count,
        "created_at": d.created_at.isoformat()
    } for d in docs]

@router.post("/ingest")
def ingest_document(req: IngestDocumentRequest, db: Session = Depends(get_db)):
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    content_hash = l0_trust.compute_sha256(req.content)
    trust_tier, _ = l0_trust.evaluate_source(req.source, req.trust_tier)

    # 1. Layer 1 Ingestion Deep Scan
    scan_result = l1_sanitizer.scan(req.content)

    # 2. Chunking
    chunks = simple_chunker(req.content)

    # 3. Layer 2 Indexer Guard & Quarantine Evaluation
    chunk_ids, chunk_texts, metadatas, is_quarantined = l2_indexer.evaluate_chunks(
        doc_id=doc_id,
        chunks=chunks,
        scan_result=scan_result,
        source=req.source,
        trust_tier=trust_tier,
        content_hash=content_hash
    )

    if is_quarantined:
        # Route directly to Quarantine Vault
        quarantine_record = QuarantineRecordModel(
            id=f"quar_{uuid.uuid4().hex[:8]}",
            doc_id=doc_id,
            filename=req.title,
            content=req.content,
            risk_score=scan_result.risk_score,
            reason_codes=[f.reason_code for f in scan_result.findings],
            findings=[f.model_dump() for f in scan_result.findings],
            status="quarantined",
            quarantined_at=datetime.utcnow()
        )
        db.add(quarantine_record)

        doc_record = DocumentModel(
            id=doc_id,
            title=req.title,
            content=req.content,
            source=req.source,
            trust_tier=trust_tier,
            content_hash=content_hash,
            is_quarantined=True,
            risk_score=scan_result.risk_score,
            chunk_count=0
        )
        db.add(doc_record)
        db.commit()

        return {
            "status": "quarantined",
            "doc_id": doc_id,
            "title": req.title,
            "risk_score": scan_result.risk_score,
            "message": "Document blocked and stored in Quarantine Vault due to severe injection indicators."
        }

    # Otherwise, commit into Vector DB
    vs = get_vector_store()
    vs.add(ids=chunk_ids, documents=chunk_texts, metadatas=metadatas)

    doc_record = DocumentModel(
        id=doc_id,
        title=req.title,
        content=req.content,
        source=req.source,
        trust_tier=trust_tier,
        content_hash=content_hash,
        is_quarantined=False,
        risk_score=scan_result.risk_score,
        chunk_count=len(chunk_ids)
    )
    db.add(doc_record)
    db.commit()

    return {
        "status": "indexed",
        "doc_id": doc_id,
        "title": req.title,
        "chunks_indexed": len(chunk_ids),
        "risk_score": scan_result.risk_score,
        "message": "Document successfully scanned and committed to knowledge base."
    }

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    vs = get_vector_store()
    # Delete chunks
    chunk_ids = [f"{doc_id}_c{i}" for i in range(doc.chunk_count or 10)]
    vs.delete(chunk_ids)

    db.delete(doc)
    db.commit()
    return {"status": "deleted", "doc_id": doc_id}

@router.post("/seed-corpus")
def seed_corpus(db: Session = Depends(get_db)):
    """
    Seeds a rich realistic baseline corpus of clean documents and sample poisoned docs
    """
    sample_docs = [
        {
            "title": "Corporate Q3 Financial Earnings Report",
            "content": "VectorShield Corporation reported strong financial metrics for Q3. Enterprise revenue increased by 18.4% year-over-year reaching $4.2B, driven by accelerated adoption of cybersecurity products and zero-trust cloud architectures. Gross margins held at 74.2% while R&D expenditure expanded to $320M to support multi-layer adversarial resilience initiatives.",
            "source": "financial_filing",
            "trust_tier": "tier_1"
        },
        {
            "title": "Enterprise Cloud Architecture & Security Policy",
            "content": "VectorShield infrastructure operates across multi-region Kubernetes clusters. Internal services enforce Mutual TLS (mTLS) with strict cryptographic identity verification. Administrative access strictly mandates hardware security keys (FIDO2) and multi-factor authentication. Inbound webhooks undergo signature validation, and all public network traffic terminates at certified perimeter gateways.",
            "source": "architecture_wiki",
            "trust_tier": "tier_1"
        },
        {
            "title": "Incident Response and Threat Classification",
            "content": "Security incident classification defines Severity 1 (Critical) as an active breach or credential leak requiring executive briefing within 15 minutes. Severity 2 incidents include anomalous retrieval surges or untrusted input spikes, requiring mitigation within 1 hour. All audit logs are sealed with cryptographic SHA-256 hashes and mirrored to immutable write-once storage.",
            "source": "soc_playbook",
            "trust_tier": "tier_1"
        },
        {
            "title": "Employee Benefits & Workplace Guidelines",
            "content": "All full-time VectorShield engineers receive 25 days of paid annual leave, comprehensive healthcare coverage starting on day 30, and parental leave benefits. Flexible hybrid work policies allow team members to collaborate in office hubs or globally distributed remote pods.",
            "source": "hr_handbook",
            "trust_tier": "tier_1"
        },
        {
            "title": "AI & Retrieval Guardrails Architecture",
            "content": "The VectorShield Retrieval-Augmented Generation pipeline prevents indirect prompt injection through five deterministic layers: Layer 0 Provenance Tracking, Layer 1 Ingestion Sanitization, Layer 2 Pre-Index Isolation, Layer 3 Anomaly Retrieval Filtering, Layer 4 Delimiter Spotlighting, and Layer 5 Output Guarding.",
            "source": "security_whitepaper",
            "trust_tier": "tier_0"
        }
    ]

    indexed_count = 0
    for doc in sample_docs:
        existing = db.query(DocumentModel).filter(DocumentModel.title == doc["title"]).first()
        if not existing:
            ingest_document(IngestDocumentRequest(**doc), db=db)
            indexed_count += 1

    return {"status": "seeded", "new_documents_indexed": indexed_count}
