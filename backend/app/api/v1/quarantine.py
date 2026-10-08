from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import QuarantineRecordModel, DocumentModel
from app.vector_store import get_vector_store

router = APIRouter(prefix="/quarantine", tags=["Quarantine"])

@router.get("/")
def list_quarantine(db: Session = Depends(get_db)):
    records = db.query(QuarantineRecordModel).order_by(QuarantineRecordModel.quarantined_at.desc()).all()
    return [{
        "id": r.id,
        "doc_id": r.doc_id,
        "filename": r.filename,
        "risk_score": r.risk_score,
        "reason_codes": r.reason_codes,
        "findings": r.findings,
        "status": r.status,
        "snippet": r.content[:200] + ("..." if len(r.content) > 200 else ""),
        "quarantined_at": r.quarantined_at.isoformat()
    } for r in records]

@router.post("/{record_id}/release")
def release_quarantine(record_id: str, db: Session = Depends(get_db)):
    record = db.query(QuarantineRecordModel).filter(QuarantineRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Quarantine record not found")

    record.status = "released"
    record.resolved_at = datetime.utcnow()

    # If associated document exists, mark active and index into vector store
    doc = db.query(DocumentModel).filter(DocumentModel.id == record.doc_id).first()
    if doc:
        doc.is_quarantined = False
        vs = get_vector_store()
        chunk_id = f"{doc.id}_c0"
        vs.add(
            ids=[chunk_id],
            documents=[doc.content],
            metadatas=[{
                "doc_id": doc.id,
                "chunk_id": chunk_id,
                "source": doc.source,
                "trust_tier": doc.trust_tier,
                "content_hash": doc.content_hash,
                "risk_score": record.risk_score,
                "reason_codes": record.reason_codes or [],
                "quarantined": False
            }]
        )
        doc.chunk_count = 1

    db.commit()
    return {"status": "released", "record_id": record_id, "message": "Document released from quarantine and indexed."}

@router.delete("/{record_id}/purge")
def purge_quarantine(record_id: str, db: Session = Depends(get_db)):
    record = db.query(QuarantineRecordModel).filter(QuarantineRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Quarantine record not found")

    doc = db.query(DocumentModel).filter(DocumentModel.id == record.doc_id).first()
    if doc:
        db.delete(doc)

    db.delete(record)
    db.commit()
    return {"status": "purged", "record_id": record_id, "message": "Quarantined threat permanently purged."}
