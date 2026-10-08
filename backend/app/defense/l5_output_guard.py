import re
from typing import List, Tuple, Set
from urllib.parse import urlparse
from app.models.schemas import RetrievedChunk, SecurityLayerReport

class L5OutputGuard:
    """
    Layer 5: Output Guard & Security Policy Enforcer
    Stops canary leakage, data exfiltration beacons, secret/PII disclosure,
    and ungrounded hallucinated claims before responses exit to the user.
    """
    SECRET_PATTERNS = [
        (r"\bAKIA[0-9A-Z]{16}\b", "AWS_ACCESS_KEY"),
        (r"\bsk-[a-zA-Z0-9]{32,}\b", "OPENAI_API_KEY"),
        (r"\bghp_[a-zA-Z0-9]{36}\b", "GITHUB_PAT"),
        (r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b", "JWT_TOKEN"),
        (r"-----BEGIN (RSA |EC )?PRIVATE KEY-----", "PRIVATE_KEY"),
        (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "EMAIL_PII"),
    ]

    def __init__(self, canary_token: str = "VS-CANARY-SEC-9981-SECRET", allowed_domains: List[str] = None):
        self.canary_token = canary_token
        self.allowed_domains = allowed_domains or ["wikipedia.org", "github.com", "arxiv.org", "huggingface.co"]

    def inspect(
        self,
        raw_output: str,
        retrieved_chunks: List[RetrievedChunk]
    ) -> Tuple[str, bool, bool, bool, SecurityLayerReport]:
        """
        Returns:
        (sanitized_output, is_blocked, canary_leaked, exfil_blocked, layer_report)
        """
        sanitized = raw_output
        reason_codes = []
        evidence = []
        is_blocked = False
        canary_leaked = False
        exfil_blocked = False

        # 1. Canary Leak Check
        if self.canary_token in raw_output:
            canary_leaked = True
            is_blocked = True
            reason_codes.append("CANARY_LEAK")
            evidence.append({
                "type": "CANARY_LEAK",
                "detail": "System prompt security canary was leaked in raw response."
            })
            sanitized = "[BLOCKED BY VECTORSHIELD L5: Prompt leak detected. System security credentials compromised.]"

        # 2. Markdown Image / Exfiltration Beacon Check
        img_pattern = r"!\[(.*?)\]\((https?://[^\s\)]+)\)"
        for match in re.finditer(img_pattern, sanitized):
            full_tag = match.group(0)
            url = match.group(2)
            parsed = urlparse(url)

            # Check if domain is allowlisted
            domain_allowed = any(parsed.netloc.endswith(d) for d in self.allowed_domains)

            # If not allowed or contains suspicious query params
            if not domain_allowed or "?" in url or "data=" in url or "secret=" in url:
                exfil_blocked = True
                reason_codes.append("EXFIL_URL_STRIPPED")
                evidence.append({
                    "type": "MALICIOUS_BEACON",
                    "beacon_url": url,
                    "reason": "Exfiltration image beacon stripped."
                })
                sanitized = sanitized.replace(full_tag, "[Exfiltration Image Beacon Neutralized by VectorShield L5]")

        # 3. Secret & PII Scanning
        for pat, sec_name in self.SECRET_PATTERNS:
            matches = list(re.finditer(pat, sanitized))
            if matches:
                reason_codes.append(f"SECRET_{sec_name}")
                for m in matches:
                    val = m.group(0)
                    masked = val[:4] + "****" + val[-3:] if len(val) > 8 else "****"
                    sanitized = sanitized.replace(val, f"[REDACTED_{sec_name}]")
                    evidence.append({
                        "type": "SECRET_LEAK_REDACTED",
                        "secret_type": sec_name,
                        "masked": masked
                    })

        # 4. Grounding Check against Allowed Retrieval Chunks
        allowed_text = " ".join([c.text for c in retrieved_chunks if not c.is_dropped]).lower()
        # Extract potential numeric claims or specific acronyms
        claimed_numbers = re.findall(r"\b\d{2,}\b", sanitized)
        ungrounded = [n for n in claimed_numbers if n not in allowed_text and n not in self.canary_token]
        if len(ungrounded) >= 3:
            reason_codes.append("UNGROUNDED_CLAIM")
            evidence.append({
                "type": "UNGROUNDED_ENTITIES",
                "unsupported_tokens": ungrounded[:5]
            })

        status = "triggered" if reason_codes else "pass"
        layer_report = SecurityLayerReport(
            layer="L5",
            status=status,
            reason_codes=reason_codes,
            evidence=evidence
        )

        return sanitized, is_blocked, canary_leaked, exfil_blocked, layer_report

l5_guard = L5OutputGuard()
