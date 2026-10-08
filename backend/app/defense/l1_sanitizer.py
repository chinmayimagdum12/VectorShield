import re
import unicodedata
import base64
import codecs
from typing import List, Tuple, Dict, Any
from app.models.schemas import Finding, ScanResult

class L1IngestionSanitizer:
    """
    Layer 1: Ingestion Sanitizer & Deep Adversarial Inspector
    Implements multi-stage normalization, hidden-text detection,
    de-obfuscation analysis, and multi-rule heuristic scoring.
    """

    # Cyrillic / Greek to Latin homoglyph mapping
    HOMOGLYPH_MAP = {
        'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
        'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
        'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X',
        'α': 'a', 'β': 'b', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'τ': 't'
    }

    # Zero width & invisible Unicode codepoints
    ZERO_WIDTH_CHARS = {'\u200b', '\u200c', '\u200d', '\ufeff', '\u2060', '\u200e', '\u200f', '\u00ad'}

    # Injection Patterns (weight 0.1 to 1.0)
    INJECTION_PATTERNS = [
        (r"(?i)\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|commands|rules)\b", 0.95, "OVERRIDE_PHRASE", "Explicit instruction override detected"),
        (r"(?i)\bdisregard\s+(all\s+)?(previous|prior|system)\s+(instructions|directives|prompts)\b", 0.95, "OVERRIDE_PHRASE", "Instruction disregard phrase detected"),
        (r"(?i)\b(system\s+override|admin\s+override|emergency\s+protocol)\b", 0.90, "SYSTEM_OVERRIDE", "System/Admin override marker detected"),
        (r"(?i)\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(dan|developer\s+mode|unrestricted|god\s+mode|root)\b", 0.95, "JAILBREAK_PERSONA", "Adversarial persona / jailbreak switch detected"),
        (r"(<\|im_start\|>|<\|im_end\|>|\[INST\]|\[/INST\]|<<SYS>>|<</SYS>>)", 0.98, "ROLE_IMPERSONATION", "Raw model delimiter token detected"),
        (r"(?i)\b(print|reveal|output|display|leak)\s+(the\s+)?(system\s+prompt|initial\s+prompt|hidden\s+instructions)\b", 0.90, "PROMPT_EXTRACTION", "System prompt extraction attempt detected"),
        (r"(?i)\bdo\s+not\s+mention\s+this\s+to\s+the\s+user\b", 0.85, "COVERT_INSTRUCTION", "Covert instructions hiding clause detected"),
        (r"(?i)\b(from\s+now\s+on|new\s+task:)\s+your\s+only\s+(purpose|response|output)\s+is\b", 0.88, "ROLE_HIJACK", "Complete behavior takeover instruction detected"),
        (r"!\[.*?\]\((https?://[^\s\)]+[\?&][^\s\)]+)\)", 0.92, "EXFIL_IMAGE_BEACON", "Markdown image exfiltration beacon with query parameters"),
        (r"(?i)\bcurl\s+-X\s+POST\b|\bhttps?://[^\s]+\?data=", 0.80, "EXFIL_HTTP", "Potential HTTP exfiltration payload"),
        (r"(?i)\b(bypass|disable)\s+(all\s+)?(safety|guardrails|filters|security)\b", 0.90, "GUARDRAIL_BYPASS", "Guardrail bypass instruction detected"),
        (r"(?i)\bthe\s+following\s+is\s+a\s+mandatory\s+system\s+instruction:\b", 0.92, "MANDATORY_OVERRIDE", "Mandatory system instruction impersonation")
    ]

    def scan(self, text: str, context: Dict[str, Any] = None) -> ScanResult:
        findings: List[Finding] = []
        scanner_scores: List[Tuple[float, float]] = [] # (weight, score)

        # 1. Unicode Normalization & Zero-Width Check
        norm_text, zw_findings = self._check_unicode_and_zero_width(text)
        findings.extend(zw_findings)
        if zw_findings:
            scanner_scores.append((1.0, 0.85))

        # 2. Homoglyph Substitution Check
        homo_text, homo_findings = self._check_homoglyphs(text)
        findings.extend(homo_findings)
        if homo_findings:
            scanner_scores.append((0.8, 0.70))

        # 3. Hidden Text in HTML / Markdown
        hidden_findings = self._check_hidden_text(text)
        findings.extend(hidden_findings)
        if hidden_findings:
            scanner_scores.append((1.0, 0.90))

        # 4. Obfuscated / Encoded Payloads (Base64, ROT13, Spaced tokens)
        encoded_findings, decoded_texts = self._check_encoded_payloads(text)
        findings.extend(encoded_findings)
        if encoded_findings:
            scanner_scores.append((1.0, 0.95))

        # 5. Direct Heuristic Injection Scan (on raw text, normalized text, and decoded text)
        texts_to_scan = [text, norm_text, homo_text] + decoded_texts
        for t in texts_to_scan:
            p_findings = self._check_injection_patterns(t)
            findings.extend(p_findings)
            for f in p_findings:
                scanner_scores.append((1.0, 0.95 if f.severity == "critical" else 0.80))

        # Deduplicate findings by (reason_code, start, end)
        deduped_findings: List[Finding] = []
        seen = set()
        for f in findings:
            key = (f.reason_code, f.start, f.end, f.snippet)
            if key not in seen:
                seen.add(key)
                deduped_findings.append(f)

        # Compute Noisy-OR composite risk score: risk = 100 * (1 - prod(1 - w_i * s_i))
        risk_score = self._compute_noisy_or(scanner_scores)

        # High severity floor
        has_critical = any(f.severity == "critical" for f in deduped_findings)
        if has_critical and risk_score < 90.0:
            risk_score = 92.5
        elif len(deduped_findings) > 0 and risk_score < 40.0:
            risk_score = 45.0

        is_blocked = risk_score >= 65.0
        is_quarantined = risk_score >= 80.0

        return ScanResult(
            scanner="L1_Sanitizer",
            score=min(1.0, risk_score / 100.0),
            risk_score=round(risk_score, 2),
            is_blocked=is_blocked,
            is_quarantined=is_quarantined,
            findings=deduped_findings,
            metadata={
                "zero_width_count": len(zw_findings),
                "homoglyph_count": len(homo_findings),
                "hidden_elements": len(hidden_findings),
                "encoded_payloads": len(encoded_findings)
            }
        )

    def _check_unicode_and_zero_width(self, text: str) -> Tuple[str, List[Finding]]:
        findings = []
        zw_positions = []
        for i, ch in enumerate(text):
            if ch in self.ZERO_WIDTH_CHARS:
                zw_positions.append(i)

        if zw_positions:
            findings.append(Finding(
                rule_id="R-L1-ZW-001",
                reason_code="UNICODE_ZERO_WIDTH",
                severity="high",
                start=zw_positions[0],
                end=zw_positions[-1] + 1,
                snippet=f"Detected {len(zw_positions)} invisible zero-width characters",
                description="Invisible zero-width characters used to bypass keyword filtering or smuggle hidden prompts."
            ))

        # Tag characters check (\U000e0000 - \U000e007f)
        tag_chars = [i for i, ch in enumerate(text) if 0xE0000 <= ord(ch) <= 0xE007F]
        if tag_chars:
            findings.append(Finding(
                rule_id="R-L1-TAG-002",
                reason_code="UNICODE_TAG_CHARS",
                severity="critical",
                start=tag_chars[0],
                end=tag_chars[-1] + 1,
                snippet=f"Detected {len(tag_chars)} Unicode tag characters",
                description="Unicode tag character steganography detected (often used for ASCII smuggling)."
            ))

        # NFKC normalize
        normalized = unicodedata.normalize("NFKC", text)
        return normalized, findings

    def _check_homoglyphs(self, text: str) -> Tuple[str, List[Finding]]:
        findings = []
        homoglyph_found = []
        replaced_chars = []
        for i, ch in enumerate(text):
            if ch in self.HOMOGLYPH_MAP:
                homoglyph_found.append((i, ch, self.HOMOGLYPH_MAP[ch]))
                replaced_chars.append(self.HOMOGLYPH_MAP[ch])
            else:
                replaced_chars.append(ch)

        if len(homoglyph_found) >= 2:
            snippets = ", ".join([f"'{c}'->'{m}'" for _, c, m in homoglyph_found[:5]])
            findings.append(Finding(
                rule_id="R-L1-HOMO-001",
                reason_code="HOMOGLYPH_SPOOF",
                severity="medium",
                start=homoglyph_found[0][0],
                end=homoglyph_found[-1][0] + 1,
                snippet=f"Homoglyphs: {snippets}",
                description="Adversarial homoglyph substitutions detected to evade keyword matchers."
            ))

        return "".join(replaced_chars), findings

    def _check_hidden_text(self, text: str) -> List[Finding]:
        findings = []

        # HTML comments: <!-- ... -->
        for match in re.finditer(r"<!--(.*?)-->", text, re.DOTALL):
            content = match.group(1).strip()
            # If comment contains injection keywords
            is_suspicious = any(re.search(pat[0], content) for pat in self.INJECTION_PATTERNS)
            findings.append(Finding(
                rule_id="R-L1-HIDE-001",
                reason_code="HIDDEN_TEXT_HTML_COMMENT",
                severity="critical" if is_suspicious else "medium",
                start=match.start(),
                end=match.end(),
                snippet=match.group(0)[:80],
                description="Hidden HTML comment detected in document. Often used for indirect injection."
            ))

        # CSS hidden styles: display:none, visibility:hidden, font-size:0, opacity:0
        css_patterns = [
            (r"style=[\"'].*?display\s*:\s*none.*?[\"']", "CSS display:none element"),
            (r"style=[\"'].*?visibility\s*:\s*hidden.*?[\"']", "CSS visibility:hidden element"),
            (r"style=[\"'].*?font-size\s*:\s*0px.*?[\"']", "CSS zero font size element"),
            (r"style=[\"'].*?color\s*:\s*(#ffffff|white).*?background.*?[\"']", "White text on white background")
        ]
        for pat, desc in css_patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                findings.append(Finding(
                    rule_id="R-L1-HIDE-002",
                    reason_code="HIDDEN_TEXT_CSS",
                    severity="high",
                    start=match.start(),
                    end=match.end(),
                    snippet=match.group(0)[:80],
                    description=f"Invisible text technique: {desc}"
                ))

        return findings

    def _check_encoded_payloads(self, text: str) -> Tuple[List[Finding], List[str]]:
        findings = []
        decoded_payloads = []

        # Base64 string detector (strings of 16+ base64 chars, with optional padding)
        b64_matches = re.finditer(r"(?:^|[\s:=,])([A-Za-z0-9+/]{16,}={0,2})(?:$|[\s:=,])", text)
        for m in b64_matches:
            raw_b64 = m.group(1).strip()

            try:
                decoded = base64.b64decode(raw_b64).decode("utf-8", errors="ignore")
                if len(decoded) > 10 and any(c.isprintable() for c in decoded):
                    # Check if decoded payload contains injection signals
                    has_suspicion = any(re.search(pat[0], decoded) for pat in self.INJECTION_PATTERNS)
                    findings.append(Finding(
                        rule_id="R-L1-ENC-001",
                        reason_code="ENCODED_PAYLOAD_BASE64",
                        severity="critical" if has_suspicion else "medium",
                        start=m.start(),
                        end=m.end(),
                        snippet=f"Decoded: {decoded[:60]}...",
                        description="Base64 obfuscated payload detected inside content."
                    ))
                    decoded_payloads.append(decoded)
            except Exception:
                pass

        # ROT13 check on suspicious blocks
        rot13_candidate = codecs.decode(text[:500], 'rot_13')
        if any(re.search(pat[0], rot13_candidate) for pat in self.INJECTION_PATTERNS):
            findings.append(Finding(
                rule_id="R-L1-ENC-002",
                reason_code="ENCODED_PAYLOAD_ROT13",
                severity="critical",
                start=0,
                end=min(100, len(text)),
                snippet=f"ROT13 match: {rot13_candidate[:60]}...",
                description="Caesar cipher / ROT13 obfuscated injection detected."
            ))
            decoded_payloads.append(rot13_candidate)

        # Spaced letter evasion: e.g. "I g n o r e   a l l"
        spaced_collapsed = re.sub(r'(?<=\b\w)\s(?=\w\b)', '', text)
        if spaced_collapsed != text:
            for pat, weight, rcode, rdesc in self.INJECTION_PATTERNS:
                if re.search(pat, spaced_collapsed):
                    findings.append(Finding(
                        rule_id="R-L1-ENC-003",
                        reason_code="SPACED_TOKEN_EVASION",
                        severity="high",
                        start=0,
                        end=min(80, len(text)),
                        snippet=f"Collapsed: {spaced_collapsed[:60]}...",
                        description="Token spacing evasion detected to mask injection commands."
                    ))
                    decoded_payloads.append(spaced_collapsed)
                    break

        return findings, decoded_payloads

    def _check_injection_patterns(self, text: str) -> List[Finding]:
        findings = []
        for pat, weight, rcode, rdesc in self.INJECTION_PATTERNS:
            for match in re.finditer(pat, text):
                severity = "critical" if weight >= 0.90 else "high"
                findings.append(Finding(
                    rule_id=f"R-L1-HEUR-{rcode[:8]}",
                    reason_code=rcode,
                    severity=severity,
                    start=match.start(),
                    end=match.end(),
                    snippet=match.group(0)[:100],
                    description=rdesc
                ))
        return findings

    def _compute_noisy_or(self, scores: List[Tuple[float, float]]) -> float:
        """
        Calculates Noisy-OR probability combination:
        P = 1 - prod(1 - w_i * s_i)
        """
        if not scores:
            return 0.0
        product = 1.0
        for w, s in scores:
            term = 1.0 - (w * s)
            product *= max(0.01, term)
        prob = 1.0 - product
        return prob * 100.0

l1_sanitizer = L1IngestionSanitizer()
