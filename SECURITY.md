# Security Policy & Responsible Vulnerability Disclosure

## 1. Supported Versions

Security updates and patches are actively applied to the following release branches:

| Version | Supported | Security Patch SLA |
|:---|:---:|:---|
| **1.0.x** (Current Stable) | :white_check_mark: | Active (Critical: <24h, High: <72h) |
| **< 1.0.0** | :x: | End of Life |

---

## 2. Reporting a Vulnerability

The VectorShield core security team is committed to rapid, responsible resolution of any security vulnerabilities affecting the platform or its defensive invariants.

If you believe you have discovered a security vulnerability in VectorShield (such as a zero-day bypass of the 6-layer defense pipeline, a catastrophic ReDoS flaw in the sanitization engine, or an authentication escape):

1. **Do NOT report the vulnerability via public GitHub Issues or Discussions.**
2. Send an encrypted advisory to the core maintainers at:  
   📧 **`security@vectorshield.dev`** (or contact maintainer via private security advisory on GitHub).
3. Include the following details in your report:
   * Attack Vector Category (e.g. A1–A13 or novel threat)
   * Exact adversarial payload string or input document
   * Minimal reproducible test script (Python or cURL)
   * VectorShield version and configuration parameters (thresholds, backend)
   * Impact analysis and observed behavior vs expected behavior

---

## 3. Vulnerability Response Timeline

We adhere to a strict Coordinated Vulnerability Disclosure (CVD) policy:

* **Initial Acknowledgment**: Within **24 hours** of receipt.
* **Triage & Reproduction**: Within **72 hours** with severity assessment (CVSS 3.1).
* **Fix & Patch Development**: Within **7 to 14 business days**.
* **Public CVE Disclosure**: Coordinated following patch deployment.

---

## 4. Threat Model Invariants

The VectorShield security guarantee guarantees the following invariants under normal configuration (`quarantine_threshold=80`, `z_score=2.2`, `canary=true`):
* **No Untrusted Execution**: Imperative directives in external retrieved context must never alter the fundamental execution goals of the system prompt.
* **No Secret Egress**: System canary strings generated at runtime shall never appear in outbound user responses.
* **Corpus Isolation**: Documents scoring $\ge 80$ risk points shall never be committed to active production nearest-neighbor query spaces.
