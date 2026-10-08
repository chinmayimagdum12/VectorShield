import hashlib
from typing import Dict, Any, Tuple
from urllib.parse import urlparse

class L0SourceTrust:
    """
    Layer 0: Source Trust & Provenance Verification
    Assigns trust tiers, computes content digests, and verifies domain integrity.
    """
    TIER_SYSTEM = "tier_0"     # Pinned internal source (Risk Weight: 0.0)
    TIER_VERIFIED = "tier_1"   # Verified internal docs (Risk Weight: 0.2)
    TIER_UNTRUSTED = "tier_2"  # Public uploads / web (Risk Weight: 1.0)
    TIER_QUARANTINE = "tier_3" # Flagged hostile (Risk Weight: 2.0)

    @staticmethod
    def compute_sha256(content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def evaluate_source(source_url_or_name: str, explicit_tier: str = None) -> Tuple[str, float]:
        """
        Returns (tier_name, base_risk_factor)
        """
        if explicit_tier:
            tier_factors = {
                "tier_0": 0.0,
                "tier_1": 0.1,
                "tier_2": 0.6,
                "tier_3": 1.0
            }
            return explicit_tier, tier_factors.get(explicit_tier, 0.5)

        lower_src = source_url_or_name.lower()
        if lower_src.startswith("system://") or "internal_verified" in lower_src:
            return L0SourceTrust.TIER_SYSTEM, 0.0
        elif lower_src.startswith("http://") or lower_src.startswith("https://"):
            parsed = urlparse(lower_src)
            # Verified corporate domains could be tier_1
            if parsed.netloc.endswith(".internal.corp") or parsed.netloc.endswith(".gov"):
                return L0SourceTrust.TIER_VERIFIED, 0.1
            return L0SourceTrust.TIER_UNTRUSTED, 0.6
        elif "untrusted" in lower_src or "external" in lower_src or "user_upload" in lower_src:
            return L0SourceTrust.TIER_UNTRUSTED, 0.6
        
        return L0SourceTrust.TIER_VERIFIED, 0.1

l0_trust = L0SourceTrust()
