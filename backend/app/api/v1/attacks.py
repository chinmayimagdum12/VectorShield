from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.attacks.families import ATTACK_FAMILIES, ATTACK_GOALS
from app.attacks.dataset import SAMPLE_ATTACKS
from app.attacks.generator import attack_generator
from app.models.schemas import AttackPayloadItem

router = APIRouter(prefix="/attacks", tags=["Attacks"])

class GenerateAttackRequest(BaseModel):
    family: str = "A1"
    goal: str = "G1"
    base_payload: Optional[str] = None
    obfuscation: str = "none" # none, base64, rot13, zerowidth, homoglyph, markdown_comment, css_hidden, spaced
    placement: str = "end" # start, middle, end
    carrier_topic: str = "Finance" # Finance, Technology, Healthcare, Human Resources

@router.get("/families")
def get_attack_families():
    return {
        "families": ATTACK_FAMILIES,
        "goals": ATTACK_GOALS
    }

@router.get("/catalog", response_model=List[AttackPayloadItem])
def get_attack_catalog():
    return SAMPLE_ATTACKS

@router.post("/generate", response_model=AttackPayloadItem)
def generate_attack(req: GenerateAttackRequest):
    return attack_generator.generate_attack(
        family=req.family,
        goal=req.goal,
        base_payload=req.base_payload,
        obfuscation=req.obfuscation,
        placement=req.placement,
        carrier_topic=req.carrier_topic
    )
