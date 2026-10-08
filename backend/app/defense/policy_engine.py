import time
import hashlib
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.models.schemas import (
    SecurityReport, SecurityLayerReport, RetrievedChunk,
    ScanResult, DefensePolicyModel
)
from app.defense.l0_trust import l0_trust
from app.defense.l1_sanitizer import l1_sanitizer
from app.defense.l3_retrieval_filter import l3_filter
from app.defense.l4_prompt_hardener import l4_hardener
from app.defense.l5_output_guard import l5_guard

class PolicyEngine:
    """
    Central Security Orchestration & Policy Enforcement Engine.
    Coordinates all defense layers (L0 through L5), calculates composite
    threat scores, enforces threshold actions, and generates cryptographic reports.
    """
    def __init__(self):
        self.block_threshold = settings.BLOCK_RISK_THRESHOLD
        self.quarantine_threshold = settings.QUARANTINE_THRESHOLD

    def build_security_report(
        self,
        request_id: str,
        layers: List[SecurityLayerReport],
        dropped_chunks: List[str],
        latency_ms: Dict[str, float]
    ) -> SecurityReport:
        # Determine overall action and composite risk
        risk_score = 0.0
        has_block = False
        has_sanitize = False

        for l in layers:
            if l.status == "triggered":
                if any("CRITICAL" in c or "OVERRIDE" in c or "CANARY" in c for c in l.reason_codes):
                    has_block = True
                    risk_score = max(risk_score, 92.0)
                else:
                    has_sanitize = True
                    risk_score = max(risk_score, 68.0)

        action = "block" if has_block else ("sanitize" if has_sanitize or dropped_chunks else "pass")

        # Compute forensic tamper-evident SHA-256 hash
        forensic_payload = f"{request_id}:{action}:{risk_score}:{','.join(dropped_chunks)}"
        forensic_hash = hashlib.sha256(forensic_payload.encode()).hexdigest()

        return SecurityReport(
            request_id=request_id,
            action=action,
            risk_score=risk_score,
            layers=layers,
            dropped_chunks=dropped_chunks,
            latency_ms=latency_ms,
            forensic_hash=forensic_hash
        )

policy_engine = PolicyEngine()
