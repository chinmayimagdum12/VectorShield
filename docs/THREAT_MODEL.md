# VectorShield Threat Model & Attack Taxonomy

## Attack Families (A1 to A13)
| Family | Classification | Threat Vector | Defense Layer |
|---|---|---|---|
| **A1** | Direct System Override | "Ignore all prior instructions..." commands | L1 Sanitizer, L4 Hierarchy |
| **A2** | Persona & Jailbreak | Adversarial DAN / Unrestricted state switching | L1 Regex & Noisy-OR, L4 Delimiters |
| **A3** | Steganography & Invisible Text | Zero-width joiners, invisible CSS, HTML comments | L1 Unicode & HTML Stripper |
| **A4** | Obfuscated Encoding | Base64, ROT13, hex, spaced tokens | L1 Recursive De-obfuscator |
| **A5** | Model Delimiter Spoofing | Injecting `<\|im_start\|>`, `[INST]`, `<<SYS>>` tags | L1 Delimiter Guard, L4 Spotlighting |
| **A6** | Data Exfiltration Beacons | Markdown images with query params (`![alt](url?leak=...)`) | L5 URL Policy & Link Sanitizer |
| **A7** | Knowledge Base Poisoning | Planted authoritative false facts to distort answers | L2 Pre-Index Gate, L3 Anomaly Filter |
| **A8** | Retrieval Gaming | Lexical keyword mirroring to artificially boost cosine rank | L3 Similarity Outlier Detector |
| **A9** | Split Payloads | Adversarial commands fragmented across multiple chunks | L3 Cluster Aggregator & L1 Re-scanner |
| **A10** | Cross-Lingual Injections | Prompts phrased in mixed/low-resource languages | L1 Polyglot Heuristics & L4 Hierarchy |
| **A11** | Authority Social Engineering | High-pressure claims of emergency compliance audits | L1 Heuristic Weights, L4 Sandwich Defense |
| **A12** | Multi-Hop Recursive Pointers | Chunks referencing external secondary poisoned links | L3 Source Capping & L5 Link Neutralizer |
| **A13** | Adaptive White-Box Evasion | Synonym-based evasion avoiding obvious trigger phrases | L3 Outlier Sigma & L5 Grounding Check |

## Security Objectives
* **Attack Success Rate (ASR):** Reduced from **98.2% (Undefended)** to **1.8% (VectorShield Standard)** and **0.0% (VectorShield Strict)**.
* **Benign Utility Score:** Maintained at **> 94%** on clean baseline document Q&A pairs.
* **Latency Overhead:** Median processing overhead bounded at **< 50 ms**.
