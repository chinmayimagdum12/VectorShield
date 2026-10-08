# Changelog

All notable changes to the **VectorShield** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-08

### Added
- **Core 6-Layer Defense Pipeline**:
  - `Layer 0`: Cryptographic SHA-256 Provenance & Trust Tiering (Tier 0–3).
  - `Layer 1`: Ingestion Sanitizer with NFKC Unicode normalization, zero-width stego character stripping, homoglyph confusables skeleton resolver, and recursive Base64/ROT13 de-obfuscation.
  - `Layer 2`: Pre-Index Isolation Gate with automated Quarantine Vault routing for risk scores $\ge 80$.
  - `Layer 3`: Runtime Statistical Retrieval Outlier detector ($z > 2.2\sigma$) and Jaccard duplicate cluster suppression.
  - `Layer 4`: Instruction Hierarchy Level 0 enforcement, delimiter spotlighting (`<<<UNTRUSTED_EXTERNAL_DATA>>>`), session-unique canary tokens, and sandwich defense reinforcement.
  - `Layer 5`: Egress Output Guard with canary leak detection, Markdown exfiltration beacon sanitization, PII/secret regex redactor, and HMAC-SHA256 audit sealing.
- **Interactive Web Command Console**:
  - **Threat Command Center**: Real-time telemetry, threat radar, mitigation counters, and system health status.
  - **Attack Duel Arena**: Live side-by-side execution of adversarial attacks against Undefended RAG vs VectorShield RAG.
  - **Pipeline X-Ray & Tracer**: Multi-stage packet tracer with custom test packet simulation chips and step debugger.
  - **Deep Document Scanner**: Ingestion inspection workbench with real-time payload de-obfuscation and file uploader (PDF/DOCX/MD/TXT).
  - **Vector & Knowledge Explorer**: Interactive 2D projection scatter canvas with cluster halos, nearest-neighbor inspection, and semantic query simulator.
  - **Benchmark Arena**: End-to-end multi-vector evaluation suite with comparative metrics vs NeMo Guardrails and Llama Guard.
  - **Forensic Incidents Vault**: Tamper-evident incident inspection log with cryptographic SHA-256 validation.
  - **Defense Policy Studio**: Dynamic runtime threshold tuning for block, quarantine, and similarity cutoffs.
- **Enterprise Documentation Suite**:
  - `ARCHITECTURE.md`: Complete theoretical and mathematical specification of all 6 defense layers.
  - `BENCHMARK_REPORT.md`: Empirical evaluation report across 5,000 adversarial trials and 2,000 benign enterprise documents.
  - `ATTACK_TAXONOMY.md`: Formal classification of vectors A1–A13 mapped to MITRE ATLAS and OWASP Top 10 for LLMs.
  - `API_REFERENCE.md`: Full OpenAPI 3.0 REST endpoint documentation with cURL examples.
  - `DEPLOYMENT_GUIDE.md`: Multi-stage Docker, Docker Compose, Kubernetes manifests, and NGINX TLS configurations.
  - `SECURITY.md`: Vulnerability disclosure policy, response SLA, and threat invariants.
  - High-resolution SVG vector diagrams (`pipeline_architecture.svg`, `benchmark_radar.svg`).

### Fixed
- Eliminated Windows OS native horizontal scrollbars across all screen widths.
- Replaced native `<select>` dropdowns with tactile interactive command buttons.
- Modernized background canvas with a clean architectural dot grid.
- Optimized P50 pipeline execution latency to sub-20ms.
