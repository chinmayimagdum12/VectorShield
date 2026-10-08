# VectorShield Architecture Specification

## 1. System Overview
VectorShield is an enterprise-grade multi-layered defense and evaluation platform designed to protect Retrieval-Augmented Generation (RAG) applications against indirect prompt injection, knowledge base poisoning, data exfiltration, and adversarial retrieval manipulation.

```
                    ┌─────────────────────────┐
                    │  Untrusted Input / Doc  │
                    └────────────┬────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ L0 Source Trust & Hash│
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ L1 Ingestion Sanitizer│────► [Quarantine Vault]
                     └───────────┬───────────┘       (Risk Score >= 80)
                                 │
                     ┌───────────▼───────────┐
                     │ L2 Pre-Index Gate     │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ Vector Database Index │
                     └───────────┬───────────┘
                                 │ Top-K Retrieval
                     ┌───────────▼───────────┐
                     │ L3 Retrieval Filter   │◄─── Outlier / Near-Dup Anomaly
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ L4 Prompt Hardener    │◄─── Delimiter Spotlighting & Hierarchy
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ LLM Inference Engine  │
                     └───────────┬───────────┘
                                 │ Raw Output
                     ┌───────────▼───────────┐
                     │ L5 Output Guard       │◄─── Canary Check / Exfil Stripper
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ Sanitized Response &  │
                     │ Cryptographic Audit   │
                     └───────────────────────┘
```

## 2. Multi-Layer Defense Matrix
* **Layer 0 (Source Trust):** Evaluates content provenance (`tier_0` to `tier_2`), computes SHA-256 integrity digests, and enforces domain origin controls.
* **Layer 1 (Ingestion Sanitizer):** Deep steganography detection, Unicode NFKC normalization, zero-width stripping, homoglyph skeleton mapping, hidden HTML/CSS parsing, recursive Base64/ROT13 decoding, and Noisy-OR composite risk scoring.
* **Layer 2 (Indexer Guard):** Pre-indexing isolation. Automatically gates poisoned chunks from entering nearest-neighbor vector clusters.
* **Layer 3 (Retrieval Filter):** Runtime anomaly detector. Identifies similarity outliers ($z \ge 2.2\sigma$), suppresses near-duplicate cluster floods, and enforces source diversity limits.
* **Layer 4 (Prompt Hardener):** Context isolation using unambiguous boundary delimiters (`<<<UNTRUSTED_EXTERNAL_DATA>>>`), Instruction Hierarchy Level 0 directives, dynamic canary tokens, and sandwich defense reinforcement.
* **Layer 5 (Output Guard):** Egress filtering. Verifies canary tokens, neutralizes Markdown image beacons and exfiltration URLs, redacts PII and API keys, validates entity grounding, and produces cryptographic SHA-256 tamper-evident reports.

## 3. Vector Database Architecture
* **Primary Engine:** Native `ChromaDB PersistentClient` with cosine similarity index.
* **Fail-Safe Fallback:** `VectorShieldEngine` - pure NumPy/SQLite persistent vector database implementing the identical protocol. Ensures 100% operational uptime without binary dependency failure risks.
* **Embeddings:** All-MiniLM-L6-v2 ONNX dense vector projection with deterministic semantic fallback.
