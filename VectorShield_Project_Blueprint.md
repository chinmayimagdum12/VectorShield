
---

# 8. PHASE-WISE BUILD PLAN

> Time estimates assume part-time work (about 2 to 3 hours a day). Total: about 10 to 14 weeks for everything. **Phases 0 to 9 are the core.** If time runs short, finish those first, then do a minimal Phase 11 (frontend), then Phase 12.

## PHASE 0: Foundation (Days 1 to 3)

**Goal:** a clean, reproducible project skeleton.

**Steps**
1. Create the folder and Git repo. Add `.gitignore` (Python, Node, `.env`, `.venv`, `results/raw_cache`).
2. Create the structure from Section 7 (empty folders with `README` stubs are fine).
3. Add `pyproject.toml`, `ruff`, `black`, `mypy`, `pre-commit`, `gitleaks`.
4. Create `.env.example` (never the real `.env`).
5. Write `docs/01_PROBLEM.md` (one page, in your own words). This forces you to understand the problem.
6. Create a GitHub repo. Push. Add a CI workflow that runs lint and an empty test.
7. Create an ADR file for each early decision (vector DB, LLM, language).

**Deliverables:** repo with CI green, docs stub, decision log.
**Exit check:** a fresh clone installs and passes the empty test in under 10 minutes.

---

## PHASE 1: Victim RAG App (Week 1)

**Goal:** a normal RAG chatbot with **no defense**. This is the target.

**Steps**
1. Write the document loader (txt, md, pdf, docx, html).
2. Write the chunker (start with fixed-size, 300 to 500 tokens, 10 to 15 percent overlap). Make chunk size configurable.
3. Embed with a sentence-transformers model. Store in ChromaDB with metadata: `doc_id`, `chunk_id`, `source`, `trust_tier`, `hash`.
4. Write the retriever (top-k, default k=4 or 5).
5. Write the prompt builder: system prompt + retrieved chunks + user question.
6. Add the LLM client with an interface (`generate(prompt) -> text`) and **two implementations**: API model and Ollama.
7. Add response caching (hash of model + prompt + params).
8. Expose `POST /victim/ingest` and `POST /victim/query`.
9. Ingest your **300+ clean documents**. Create **100+ clean Q&A pairs** with expected answers.
10. Measure **clean accuracy** (this is your baseline utility).

**Deliverables:** working victim app, clean-QA baseline accuracy saved in `results/`.
**Exit check:** you can ask 10 questions and get grounded answers with sources.

**Issues to expect:** chunk size too big or small; retrieval returns irrelevant chunks; LLM answers from memory instead of context (add "answer only from context" instruction and measure it).

---

## PHASE 2: Attack Framework and Dataset (Weeks 2 to 3)

**Goal:** a repeatable attack generator and a labeled dataset.

**Steps**
1. Define the attack schema (JSON): `attack_id`, `family` (A1..A13), `goal` (G1..G6), `payload`, `carrier_doc`, `target_question`, `canary`, `expected_false_answer` (for A7), `language`, `obfuscation`, `placement` (start, middle, end of doc).
2. Build **templates** per family with slots for the canary, the carrier text, and the placement.
3. Build **mutators** that transform a base payload: paraphrase, translate, base64, ROT13, spaced letters, zero-width insertion, homoglyph swap, markdown/HTML wrapping, comment hiding, code-block wrapping.
4. Build **carrier documents**: take real clean documents and inject the payload into them (so the poisoned document looks normal and is on-topic for a target question).
5. For A7 (knowledge poisoning): write a target question, a false answer, and craft a document that is topically close to the question and states the false answer confidently.
6. For A8: craft documents that mirror the query wording to raise similarity.
7. Generate **150 to 300 attack samples** spread over the families. Keep a count table per family.
8. Build a **clean control set**: documents with security-related words that are **not** attacks (for example a tutorial that explains prompt injection, a document that says "ignore the previous version of this policy"). These test false positives.
9. Create the **train / val / test split by family** (for example hold out two families entirely for the test set).
10. Hand-review a random 20 percent for label quality.

**Deliverables:** `data/attacks/*.jsonl`, `data/splits/`, a dataset card (counts, families, how made).
**Exit check:** a script prints the family table and the split table.

**Safety note:** use only harmless canaries and fake destinations (for example `attacker.test`). Do not build real malware or real exfiltration infrastructure.

---

## PHASE 3: Baseline Evaluation Harness (Week 3)

**Goal:** measure the undefended victim honestly.

**Steps**
1. Build the runner: for each attack, (a) create a fresh vector store (or a namespace), (b) ingest clean docs + the poisoned doc, (c) ask the target question, (d) record retrieved chunks and the final answer.
2. Build the **success judges** (deterministic first):
   - Canary judge: is the canary string in the output?
   - False-answer judge: does the output contain the planted false answer string or a normalized variant?
   - Exfil judge: does the output contain a URL to the fake attacker domain or a leaked secret marker?
3. Add an **LLM judge only as a second opinion**, and validate it against 50 hand-labeled outputs. Report its agreement rate.
4. Record per attack: retrieved or not, success or not, latency, tokens.
5. Run **N trials** per attack (for example 3) to handle randomness, or set `temperature=0` and still run 2 to 3 seeds where relevant.
6. Compute ASR, Retrieval Rate, Conditional ASR, and utility, with bootstrap confidence intervals.
7. Save everything in `results/baseline/`.

**Deliverables:** baseline report (table per family and per model).
**Exit check:** baseline ASR is above zero on at least some families. (If it is zero everywhere, your attacks are too weak or the model is robust to them. Strengthen attacks. Do not pretend.)

---

## PHASE 4: Defense L0, L1, L2 (Ingestion Side) (Weeks 4 to 5)

**Goal:** stop bad documents before they are indexed.

**Steps**
1. **L0 Source trust:** assign trust tier per source, compute content hash, keep an allowlist. Store tier in metadata.
2. **Normalizer:** Unicode NFKC normalization, remove or flag zero-width characters, tag characters, and bidi controls; map homoglyphs to a skeleton; collapse repeated whitespace. Keep the **original and the normalized text** with offsets.
3. **Hidden text finder:**
   - HTML: `display:none`, `visibility:hidden`, `font-size:0`, white-on-white, off-screen positioning, comments, `aria-hidden`, `<noscript>`, `<template>`.
   - PDF: text with the same color as the background, tiny font size, text outside the page box, annotations, metadata fields.
   - DOCX: hidden runs (`w:vanish`), tiny font, white color, comments, document properties.
   - Markdown: HTML comments, link reference tricks, invisible link text.
4. **Encoding detector:** find long base64-like or hex-like strings, try to decode, scan the decoded text with the same rules; ROT13 test; spaced-letter collapse.
5. **Heuristic rules:** instruction-like phrases, role markers (`SYSTEM:`, `[INST]`, `<|im_start|>`), imperatives aimed at an AI, requests for secrets, URLs with parameters, markdown images, "do not tell the user," and so on. Give each rule an ID, a weight, and a reason text.
6. **ML classifier:** start with a pretrained injection classifier. Wrap it behind an interface so you can swap it for your own model in Phase 7. Run it on chunk windows (long text must be split into windows).
7. **L2 Chunk risk score:** combine signals into a score from 0 to 100 (see Section 9.4). Save `risk_score`, `reason_codes`, and `scan_version` in chunk metadata.
8. **Quarantine store:** documents above the block threshold go to quarantine with evidence. Add `release` and `delete` actions (used later by the UI).
9. Unit tests for every rule, with positive and negative examples. Add **hypothesis fuzz tests** (random Unicode must not crash the scanner).

**Deliverables:** ingestion defense library, scan reports with offsets and reason codes.
**Exit check:** on the validation split, you can print detection recall and FPR per family.

---

## PHASE 5: Defense L3 and L4 (Query Side) (Week 6)

**Goal:** protect what reaches the LLM.

**Steps (L3 Retrieval filter)**
1. Re-scan every retrieved chunk (cheap rules first, classifier second). Documents can change after indexing, and the scanner version can improve.
2. **Similarity outlier check:** a poisoned chunk often has unusually high similarity to the query compared with the rest of the corpus. Flag chunks far above the typical score distribution.
3. **Near-duplicate flood check:** detect many near-identical chunks in the top-k (poisoning by repetition).
4. **Source diversity and trust rerank:** down-rank low-trust sources, and cap how many chunks may come from one document.
5. **Contradiction hint (stretch):** if one chunk contradicts several others on the same fact, flag it for A7.

**Steps (L4 Prompt hardening)**
1. **Spotlighting:** wrap retrieved text in clear delimiters, and optionally **datamark** it (insert a marker character between words) or encode it, so the LLM can tell data from instructions. Compare the variants in your ablation.
2. **Instruction hierarchy wording:** system prompt states that retrieved text is untrusted data and never overrides the rules.
3. **Sandwich defense:** repeat the core rule after the retrieved text, right before the question.
4. **Canary token:** put a secret token in the system prompt. If it ever appears in the output, the model leaked its prompt (used by L5).
5. Keep the prompt builder **modular** so each hardening option can be switched on or off by config.

**Deliverables:** `retrieval_filter`, `prompt_builder` with config switches.
**Exit check:** ablation script runs with each option on and off.

---

## PHASE 6: Defense L5 (Output Guard) (Week 7)

**Goal:** stop bad answers leaving the system.

**Steps**
1. **Canary leak check:** exact and fuzzy match for the system-prompt canary.
2. **URL and link policy:** extract every URL and markdown image from the answer. Allow only domains in an allowlist (or domains that appear in trusted retrieved chunks). Strip or neutralize the rest. Block markdown images with query parameters unless allowlisted.
3. **Secret and PII scan:** regex and entropy checks for API-key-like strings, emails, phone numbers, and tokens. Support a configurable pattern list.
4. **Grounding check:** every claim should be supported by a retrieved chunk that **passed L3**. Start simple: check that key entities and numbers in the answer appear in the allowed chunks. Add an NLI or LLM check as a stretch.
5. **Policy violation check:** the answer should not contain behavior that the system prompt forbids (for example "reveal the system prompt").
6. **Optional LLM judge:** run only for borderline cases. Give it a strict wrapper, treat its input as untrusted, and test that it cannot be hijacked by the answer text.
7. Produce a **Security Report** for each query: layers triggered, scores, reason codes, final action.

**Deliverables:** output guard module and security report schema.
**Exit check:** exfiltration attacks (A6) drop sharply with only L5 on.

---

## PHASE 7: Train Your Own Detector (Weeks 7 to 8) (ML depth)

**Goal:** show real ML skill, not just API usage.

**Steps**
1. Build the training set from: your attack train split, public injection datasets (check licenses), and a large set of **clean** chunks (hard negatives included: security tutorials, legal text with "must" and "shall", imperative how-to guides).
2. **Split by attack family.** Train on some families, test on held-out families. This measures generalization, not memorization.
3. Fine-tune a small encoder model (for example a DeBERTa-small, DistilBERT, or MiniLM class model) for binary or multi-label classification.
4. Evaluate: precision, recall, F1, ROC-AUC, PR-AUC, and **recall at a fixed low FPR** (for example recall at 1% FPR). This is the number that matters in production.
5. Calibrate the score (Platt scaling or isotonic regression) so thresholds mean something.
6. Compare: pretrained classifier vs your fine-tuned model vs rules only vs combined.
7. Export to **ONNX** and (optional) quantize to cut CPU latency. Record latency before and after.
8. Write a **model card**: data, limits, known failure cases, license.
9. Optional: publish the model on Hugging Face.

**Deliverables:** trained model, evaluation table, model card, latency table.
**Exit check:** held-out-family metrics are reported, even if they are lower than in-family metrics. (Lower is normal. Explain it.)

---

## PHASE 8: Adaptive Attacks and Red Team (Week 9)

**Goal:** try to break your own defenses.

**Steps**
1. **White-box adaptive attacks:** you know the rules. Write payloads that avoid every rule (paraphrase, synonyms, indirect phrasing, instructions framed as "documentation").
2. **Black-box optimization:** use an LLM (local) or a simple search loop to mutate payloads until they pass the scanner. Log how many tries it takes.
3. **Split attacks (A9):** payload divided across chunks that look clean alone.
4. **Slow-poison attack:** add many small, harmless-looking documents that each shift the answer a little.
5. **Judge hijack:** try to inject the LLM judge itself.
6. **Retrieval-aware attacks:** craft text that gets retrieved and passes the filter.
7. Record the bypass rate per layer and per technique.
8. Fix what you can. **Keep a "Known Bypasses" table in the docs.**

**Deliverables:** adaptive attack report, known bypasses list, fixes with before/after numbers.
**Exit check:** you have at least a few documented bypasses. Zero bypasses means you did not try hard enough.

---

## PHASE 9: Full Benchmark, Ablation, Statistics (Week 10)

**Goal:** the final numbers for the resume.

**Steps**
1. Freeze code and data. Tag a release (`v0.9-benchmark`).
2. Run the **configuration grid**:

| Config | L0 | L1 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| C0 baseline | off | off | off | off | off |
| C1 L1 only | off | on | off | off | off |
| C2 L3 only | off | off | on | off | off |
| C3 L4 only | off | off | off | on | off |
| C4 L5 only | off | off | off | off | on |
| C5 L1 + L3 | off | on | on | off | off |
| C6 full | on | on | on | on | on |
| C7 full, strict | on | on | on | on | on (strict thresholds) |

3. For each config and each model (API and local), record ASR, RR, conditional ASR, clean utility, utility under attack, FPR, latency, tokens.
4. Add bootstrap 95 percent confidence intervals.
5. Run significance tests where needed (for example McNemar's test for paired success/fail outcomes).
6. Produce: ASR per family, ASR per layer, trade-off curve (ASR vs FPR as the threshold moves), latency histogram, ablation heatmap.
7. Compare against 1 or 2 existing open-source tools on the same test set, using their default settings. State the setup fairly.
8. Write `06_BENCHMARK_EVAL.md` with a "Limitations of this benchmark" section.

**Deliverables:** `results/final/`, report with charts, a one-page summary table.
**Exit check:** every number in your README maps to a file in `results/final/`.

---

## PHASE 10: API, SDK, CLI, Integrations (Week 11)

**Goal:** make it usable by other people's apps.

**Steps**
1. Harden the FastAPI service (see Section 10): request validation, error model, pagination, API keys, rate limits.
2. Build the **Python SDK** (`pip install vectorshield`): `scan_document()`, `scan_chunks()`, `secure_query()`, `guard_output()`.
3. Build **adapters** for LangChain and LlamaIndex (a retriever wrapper and an output parser).
4. Build the **CLI**: `vectorshield scan <path>`, `vectorshield bench`, `vectorshield serve`, `vectorshield report`.
5. Build the **GitHub Action** that scans documents in a repo for injection payloads and fails the build above a threshold. Output **SARIF** so GitHub shows alerts.
6. Add Prometheus metrics and OpenTelemetry traces.
7. Add webhook alerts (Slack, Discord, or generic).
8. Write integration examples in `examples/`.
9. (Optional) MCP server that exposes `scan_text` and `scan_document` as tools.

**Deliverables:** SDK, CLI, adapters, Action, examples.
**Exit check:** a stranger can protect their own small RAG app in under 15 minutes using the README.

---

## PHASE 11: Frontend (Weeks 11 to 13)

See **Section 16** for the full design spec. Build order:
1. Design system and layout shell.
2. Dashboard overview.
3. Attack Lab (side-by-side).
4. Pipeline X-Ray (animated flow).
5. Document Scanner.
6. Benchmark Lab.
7. Knowledge Base explorer (vector map).
8. Incidents, Policy editor, Integrations.
9. Landing page and polish.
10. End-to-end tests and performance pass.

**Exit check:** a 2-minute screen recording shows the whole story with no errors.

---

## PHASE 12: Docs, Demo, Release (Week 14)

**Steps**
1. Finish all docs in Section 19.
2. Record a 2 to 3 minute demo video (script in Section 20).
3. Write the README with: problem, architecture diagram, quickstart, results table, limitations, how to reproduce.
4. Tag `v1.0.0`. Write release notes.
5. Deploy a demo (optional) with sample data and rate limits. Use **synthetic data only.**
6. Write a LinkedIn post and update your resume.
7. Rehearse the interview Q&A (Section 21).

**Exit check:** `git clone`, then `docker compose up`, then the dashboard opens with demo data.

---

# 9. MODULE SPECIFICATIONS (DETAILED)

## 9.1 Victim RAG
- Interface: `ingest(doc)`, `query(question) -> {answer, chunks, latency, tokens}`.
- Must support running **with or without** VectorShield through the same API, so comparison is fair.
- Configurable: chunk size, overlap, top-k, embedding model, LLM, system prompt.

## 9.2 Attack Generator
- Input: base payloads, carrier docs, target questions, mutator list.
- Output: JSONL with full metadata.
- Deterministic with a seed.
- CLI: `python -m attacks.generate --family A3 --n 20 --seed 42`.

## 9.3 Scanners (common interface)

```python
class ScanResult(BaseModel):
    scanner: str
    score: float            # 0..1
    findings: list[Finding] # each has rule_id, reason_code, start, end, snippet, severity
    metadata: dict

class Scanner(Protocol):
    name: str
    version: str
    def scan(self, text: str, ctx: ScanContext) -> ScanResult: ...
```

All scanners return the same shape. The policy engine combines them.

## 9.4 Risk score (example, tune on the validation set)

```
risk = 100 * (1 - Π (1 - w_i * s_i))      # noisy-OR over scanners
```
- `s_i` = scanner score (0..1), `w_i` = weight.
- Rules with "certain" severity (for example a decoded payload containing an override phrase) set a floor, such as `risk >= 90`.
- Trust tier modifies the threshold: low-trust sources use a stricter threshold.
- Calibrate: choose thresholds that give your target FPR on clean data, then report recall at that FPR.

## 9.5 Hidden-text finder
- Return the **hidden text itself**, its location, and the technique (for example `css_display_none`, `pdf_white_text`, `docx_vanish`).
- UI uses these offsets to highlight the text.

## 9.6 Spotlighting variants to test

| Variant | Idea |
|---|---|
| Delimiters | Wrap chunks in clear tags with a rule that content inside is data |
| Datamarking | Insert a marker character between words of retrieved text |
| Encoding | Encode retrieved text (for example base64) and instruct the model to decode and treat it as data. Test whether answer quality drops |
| None | Baseline |

## 9.7 Output guard URL policy
- Parse markdown links, markdown images, bare URLs, HTML tags.
- Decision per URL: allow (allowlisted or from a trusted chunk), strip, or block the whole answer.
- Always strip query parameters on images unless allowlisted.

## 9.8 Security report (returned with every answer)

```json
{
  "request_id": "req_01",
  "action": "sanitize",
  "risk_score": 72,
  "layers": [
    {"layer": "L3", "status": "triggered", "reason_codes": ["RETR_OUTLIER", "HIDDEN_TEXT"], "evidence": [{"chunk_id": "c_17", "span": [120, 188]}]},
    {"layer": "L5", "status": "pass"}
  ],
  "dropped_chunks": ["c_17"],
  "latency_ms": {"scan": 41, "llm": 1320, "guard": 12}
}
```

## 9.9 Reason codes (examples)
`HIDDEN_TEXT_CSS`, `HIDDEN_TEXT_PDF`, `UNICODE_ZERO_WIDTH`, `UNICODE_TAG_CHARS`, `HOMOGLYPH`, `ENCODED_PAYLOAD`, `ROLE_IMPERSONATION`, `OVERRIDE_PHRASE`, `EXFIL_URL`, `RETR_OUTLIER`, `DUP_FLOOD`, `LOW_TRUST_SOURCE`, `CANARY_LEAK`, `SECRET_PATTERN`, `UNGROUNDED_CLAIM`, `ML_CLASSIFIER_HIGH`, `JUDGE_FLAG`.
