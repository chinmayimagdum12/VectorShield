from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.schemas import DefensePolicyModel, PolicyUpdateRequest
from app.defense.l4_prompt_hardener import l4_hardener
from app.defense.l5_output_guard import l5_guard
from app.defense.l2_indexer import l2_indexer
from app.defense.l3_retrieval_filter import l3_filter

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.get("/current")
def get_current_policy(db: Session = Depends(get_db)):
    policy = db.query(DefensePolicyModel).filter(DefensePolicyModel.is_active == True).first()
    if not policy:
        policy = DefensePolicyModel(
            id="pol_default",
            name="Default Defense Policy",
            is_active=True,
            l0_enabled=True,
            l1_enabled=True,
            l2_enabled=True,
            l3_enabled=True,
            l4_enabled=True,
            l5_enabled=True,
            block_threshold=settings.BLOCK_RISK_THRESHOLD,
            quarantine_threshold=settings.QUARANTINE_THRESHOLD,
            similarity_sigma=settings.SIMILARITY_OUTLIER_SIGMA,
            canary_token=settings.CANARY_TOKEN,
            allowed_domains=settings.ALLOWED_DOMAINS
        )
        db.add(policy)
        db.commit()

    return {
        "id": policy.id,
        "name": policy.name,
        "is_active": policy.is_active,
        "l0_enabled": policy.l0_enabled,
        "l1_enabled": policy.l1_enabled,
        "l2_enabled": policy.l2_enabled,
        "l3_enabled": policy.l3_enabled,
        "l4_enabled": policy.l4_enabled,
        "l5_enabled": policy.l5_enabled,
        "block_threshold": policy.block_threshold,
        "quarantine_threshold": policy.quarantine_threshold,
        "similarity_sigma": policy.similarity_sigma,
        "canary_token": policy.canary_token,
        "allowed_domains": policy.allowed_domains,
        "updated_at": policy.updated_at.isoformat()
    }

@router.put("/current")
def update_policy(req: PolicyUpdateRequest, db: Session = Depends(get_db)):
    policy = db.query(DefensePolicyModel).filter(DefensePolicyModel.is_active == True).first()
    if not policy:
        policy = DefensePolicyModel(id="pol_default")
        db.add(policy)

    policy.l0_enabled = req.l0_enabled
    policy.l1_enabled = req.l1_enabled
    policy.l2_enabled = req.l2_enabled
    policy.l3_enabled = req.l3_enabled
    policy.l4_enabled = req.l4_enabled
    policy.l5_enabled = req.l5_enabled
    policy.block_threshold = req.block_threshold
    policy.quarantine_threshold = req.quarantine_threshold
    policy.similarity_sigma = req.similarity_sigma
    policy.canary_token = req.canary_token
    policy.allowed_domains = req.allowed_domains
    policy.updated_at = datetime.utcnow()

    # Update runtime layer instances
    l4_hardener.canary_token = req.canary_token
    l5_guard.canary_token = req.canary_token
    l5_guard.allowed_domains = [d.strip() for d in req.allowed_domains.split(",") if d.strip()]
    l2_indexer.block_threshold = req.block_threshold
    l2_indexer.quarantine_threshold = req.quarantine_threshold
    l3_filter.sigma_threshold = req.similarity_sigma

    db.commit()
    return {"status": "updated", "message": "Defense policy successfully applied across all runtime security layers."}
