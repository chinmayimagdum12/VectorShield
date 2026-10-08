from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, JSON
from app.core.database import Base

# ============================================================================
# SQLAlchemy ORM Models
# ============================================================================

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(255), default="upload")
    trust_tier = Column(String(32), default="tier_1") # tier_0 (system), tier_1 (internal), tier_2 (external/untrusted)
    content_hash = Column(String(64), nullable=False)
    is_quarantined = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    chunk_count = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuarantineRecordModel(Base):
    __tablename__ = "quarantine_vault"

    id = Column(String(64), primary_key=True, index=True)
    doc_id = Column(String(64), index=True)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False)
    reason_codes = Column(JSON, default=list)
    findings = Column(JSON, default=list)
    status = Column(String(32), default="quarantined") # quarantined, released, purged
    quarantined_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class IncidentRecordModel(Base):
    __tablename__ = "security_incidents"

    id = Column(String(64), primary_key=True, index=True)
    request_id = Column(String(64), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    attack_family = Column(String(64), default="UNKNOWN")
    query_text = Column(Text, nullable=False)
    action_taken = Column(String(32), nullable=False) # blocked, sanitized, passed, quarantined
    risk_score = Column(Float, default=0.0)
    layers_triggered = Column(JSON, default=list)
    reason_codes = Column(JSON, default=list)
    dropped_chunks = Column(JSON, default=list)
    forensic_hash = Column(String(64), nullable=False)
    latency_breakdown = Column(JSON, default=dict)

class DefensePolicyModel(Base):
    __tablename__ = "defense_policies"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(64), default="Default Defense Policy")
    is_active = Column(Boolean, default=True)
    l0_enabled = Column(Boolean, default=True)
    l1_enabled = Column(Boolean, default=True)
    l2_enabled = Column(Boolean, default=True)
    l3_enabled = Column(Boolean, default=True)
    l4_enabled = Column(Boolean, default=True)
    l5_enabled = Column(Boolean, default=True)
    block_threshold = Column(Float, default=65.0)
    quarantine_threshold = Column(Float, default=80.0)
    similarity_sigma = Column(Float, default=2.2)
    canary_token = Column(String(128), default="VS-CANARY-SEC-9981-SECRET")
    allowed_domains = Column(String(512), default="wikipedia.org,github.com,arxiv.org,huggingface.co")
    updated_at = Column(DateTime, default=datetime.utcnow)

class BenchmarkRunModel(Base):
    __tablename__ = "benchmark_runs"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    config_name = Column(String(32), nullable=False) # C0, C1, ... C7
    asr = Column(Float, nullable=False) # Attack Success Rate
    retrieval_rate = Column(Float, nullable=False)
    cond_asr = Column(Float, nullable=False)
    utility_score = Column(Float, nullable=False)
    latency_ms = Column(Float, nullable=False)
    fpr = Column(Float, nullable=False) # False Positive Rate
    total_attacks = Column(Integer, default=0)
    family_breakdown = Column(JSON, default=dict)

# ============================================================================
# Pydantic Request/Response Models
# ============================================================================

class Finding(BaseModel):
    rule_id: str
    reason_code: str
    severity: str # info, low, medium, high, critical
    start: int
    end: int
    snippet: str
    description: str

class ScanResult(BaseModel):
    scanner: str
    score: float # 0.0 to 1.0
    risk_score: float # 0 to 100
    is_blocked: bool
    is_quarantined: bool
    findings: List[Finding]
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ChunkMetadata(BaseModel):
    doc_id: str
    chunk_id: str
    source: str
    trust_tier: str
    content_hash: str
    risk_score: float = 0.0
    reason_codes: List[str] = Field(default_factory=list)
    quarantined: bool = False

class RetrievedChunk(BaseModel):
    chunk_id: str
    doc_id: str
    text: str
    source: str
    trust_tier: str
    score: float # cosine similarity
    risk_score: float = 0.0
    is_dropped: bool = False
    drop_reason: Optional[str] = None

class SecurityLayerReport(BaseModel):
    layer: str
    status: str # pass, warning, triggered, skipped
    reason_codes: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)

class SecurityReport(BaseModel):
    request_id: str
    action: str # pass, sanitize, block, quarantine
    risk_score: float
    layers: List[SecurityLayerReport]
    dropped_chunks: List[str] = Field(default_factory=list)
    latency_ms: Dict[str, float] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    forensic_hash: str = ""

class RAGQueryRequest(BaseModel):
    question: str
    top_k: int = 4
    enable_shield: bool = True
    active_policy_id: Optional[str] = None
    force_simulated_attack_id: Optional[str] = None

class RAGQueryResponse(BaseModel):
    question: str
    answer: str
    raw_answer: Optional[str] = None
    defense_active: bool
    retrieved_chunks: List[RetrievedChunk]
    security_report: Optional[SecurityReport] = None
    is_attack_detected: bool = False
    is_breached: bool = False
    canary_leaked: bool = False
    exfiltration_blocked: bool = False
    latency_ms: float = 0.0

class SideBySideCompareResponse(BaseModel):
    question: str
    victim_response: RAGQueryResponse
    shielded_response: RAGQueryResponse
    attack_detected: bool
    attack_prevented: bool
    mitigation_summary: str

class IngestDocumentRequest(BaseModel):
    title: str
    content: str
    source: str = "manual_entry"
    trust_tier: str = "tier_1"

class AttackPayloadItem(BaseModel):
    attack_id: str
    family: str # A1..A13
    goal: str # G1..G6
    title: str
    payload: str
    carrier_doc: str
    target_question: str
    canary: str = "CANARY_PWNED_8932"
    expected_false_answer: Optional[str] = None
    obfuscation: str = "none" # base64, rot13, zerowidth, homoglyph, markdown_comment
    placement: str = "end" # start, middle, end

class PolicyUpdateRequest(BaseModel):
    l0_enabled: bool = True
    l1_enabled: bool = True
    l2_enabled: bool = True
    l3_enabled: bool = True
    l4_enabled: bool = True
    l5_enabled: bool = True
    block_threshold: float = 65.0
    quarantine_threshold: float = 80.0
    similarity_sigma: float = 2.2
    canary_token: str = "VS-CANARY-SEC-9981-SECRET"
    allowed_domains: str = "wikipedia.org,github.com,arxiv.org,huggingface.co"
