from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import IncidentRecordModel

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/")
def list_incidents(limit: int = 50, db: Session = Depends(get_db)):
    incidents = db.query(IncidentRecordModel).order_by(IncidentRecordModel.timestamp.desc()).limit(limit).all()
    return [{
        "id": inc.id,
        "request_id": inc.request_id,
        "timestamp": inc.timestamp.isoformat(),
        "attack_family": inc.attack_family,
        "query_text": inc.query_text,
        "action_taken": inc.action_taken,
        "risk_score": inc.risk_score,
        "layers_triggered": inc.layers_triggered or [],
        "reason_codes": inc.reason_codes or [],
        "dropped_chunks": inc.dropped_chunks or [],
        "forensic_hash": inc.forensic_hash,
        "latency_breakdown": inc.latency_breakdown or {}
    } for inc in incidents]

@router.get("/export")
def export_incidents(format: str = Query("json", enum=["json", "sarif"]), db: Session = Depends(get_db)):
    incidents = db.query(IncidentRecordModel).order_by(IncidentRecordModel.timestamp.desc()).all()

    if format == "sarif":
        # Standard SARIF schema 2.1.0 for GitHub / SIEM security integration
        sarif_results = []
        for inc in incidents:
            sarif_results.append({
                "ruleId": inc.reason_codes[0] if inc.reason_codes else "VS-GENERIC-INJECTION",
                "level": "error" if inc.risk_score >= 80 else "warning",
                "message": {
                    "text": f"VectorShield intercepted indirect prompt injection attempt in query: {inc.query_text[:80]}"
                },
                "properties": {
                    "incidentId": inc.id,
                    "riskScore": inc.risk_score,
                    "forensicHash": inc.forensic_hash,
                    "actionTaken": inc.action_taken
                }
            })

        return {
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [{
                "tool": {
                    "driver": {
                        "name": "VectorShield",
                        "version": "1.0.0",
                        "informationUri": "https://vectorshield.dev"
                    }
                },
                "results": sarif_results
            }]
        }

    return {
        "export_timestamp": "now",
        "total_records": len(incidents),
        "incidents": [{
            "id": inc.id,
            "request_id": inc.request_id,
            "timestamp": inc.timestamp.isoformat(),
            "attack_family": inc.attack_family,
            "action_taken": inc.action_taken,
            "risk_score": inc.risk_score,
            "layers_triggered": inc.layers_triggered,
            "reason_codes": inc.reason_codes,
            "forensic_hash": inc.forensic_hash
        } for inc in incidents]
    }
