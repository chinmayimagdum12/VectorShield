const BASE_URL = '/api/v1';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  environment: string;
  vector_backend: string;
  indexed_chunks: number;
  block_threshold: number;
  quarantine_threshold: number;
  canary_active: boolean;
}

export interface RetrievedChunk {
  chunk_id: string;
  doc_id: string;
  text: string;
  source: string;
  trust_tier: string;
  score: number;
  risk_score: number;
  is_dropped: boolean;
  drop_reason?: string;
}

export interface SecurityLayerReport {
  layer: string;
  status: string;
  reason_codes: string[];
  evidence: any[];
}

export interface SecurityReport {
  request_id: string;
  action: string;
  risk_score: number;
  layers: SecurityLayerReport[];
  dropped_chunks: string[];
  latency_ms: Record<string, number>;
  timestamp: string;
  forensic_hash: string;
}

export interface RAGQueryResponse {
  question: string;
  answer: string;
  raw_answer?: string;
  defense_active: boolean;
  retrieved_chunks: RetrievedChunk[];
  security_report?: SecurityReport;
  is_attack_detected: boolean;
  is_breached: boolean;
  canary_leaked: boolean;
  exfiltration_blocked: boolean;
  latency_ms: number;
}

export interface SideBySideCompareResponse {
  question: string;
  victim_response: RAGQueryResponse;
  shielded_response: RAGQueryResponse;
  attack_detected: boolean;
  attack_prevented: boolean;
  mitigation_summary: string;
}

export interface Finding {
  rule_id: string;
  reason_code: string;
  severity: string;
  start: number;
  end: number;
  snippet: string;
  description: string;
}

export interface ScanResult {
  scanner: string;
  score: number;
  risk_score: number;
  is_blocked: boolean;
  is_quarantined: boolean;
  findings: Finding[];
  metadata: Record<string, any>;
}

export interface DocumentItem {
  id: string;
  title: string;
  source: string;
  trust_tier: string;
  content_hash: string;
  is_quarantined: boolean;
  risk_score: number;
  chunk_count: number;
  created_at: string;
}

export interface QuarantineRecord {
  id: string;
  doc_id: string;
  filename: string;
  risk_score: number;
  reason_codes: string[];
  findings: Finding[];
  status: string;
  snippet: string;
  quarantined_at: string;
}

export interface AttackItem {
  attack_id: string;
  family: string;
  goal: string;
  title: string;
  payload: string;
  carrier_doc: string;
  target_question: string;
  canary: string;
  expected_false_answer?: string;
  obfuscation: string;
  placement: string;
}

export interface VectorPoint {
  id: string;
  text: string;
  source: string;
  trust_tier: string;
  risk_score: number;
  cluster: string;
  is_poisoned: boolean;
  x: number;
  y: number;
}

export interface IncidentItem {
  id: string;
  request_id: string;
  timestamp: string;
  attack_family: string;
  query_text: string;
  action_taken: string;
  risk_score: number;
  layers_triggered: string[];
  reason_codes: string[];
  dropped_chunks: string[];
  forensic_hash: string;
  latency_breakdown: Record<string, number>;
}

export interface PolicyData {
  id: string;
  name: string;
  is_active: boolean;
  l0_enabled: boolean;
  l1_enabled: boolean;
  l2_enabled: boolean;
  l3_enabled: boolean;
  l4_enabled: boolean;
  l5_enabled: boolean;
  block_threshold: number;
  quarantine_threshold: number;
  similarity_sigma: number;
  canary_token: string;
  allowed_domains: string;
  updated_at: string;
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${BASE_URL}/health/`);
    return res.json();
  },

  async queryVictim(question: string, top_k = 4): Promise<RAGQueryResponse> {
    const res = await fetch(`${BASE_URL}/rag/victim/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k, enable_shield: false }),
    });
    return res.json();
  },

  async queryShield(question: string, top_k = 4): Promise<RAGQueryResponse> {
    const res = await fetch(`${BASE_URL}/rag/shield/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k, enable_shield: true }),
    });
    return res.json();
  },

  async compareDuel(question: string, top_k = 4): Promise<SideBySideCompareResponse> {
    const res = await fetch(`${BASE_URL}/rag/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k, enable_shield: true }),
    });
    return res.json();
  },

  async scanText(text: string): Promise<ScanResult> {
    const res = await fetch(`${BASE_URL}/scanner/scan-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async scanFile(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/scanner/scan-file`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async listDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${BASE_URL}/documents/`);
    return res.json();
  },

  async ingestDocument(title: string, content: string, source = 'user_upload', trust_tier = 'tier_1'): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, source, trust_tier }),
    });
    return res.json();
  },

  async deleteDocument(doc_id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/${doc_id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async listQuarantine(): Promise<QuarantineRecord[]> {
    const res = await fetch(`${BASE_URL}/quarantine/`);
    return res.json();
  },

  async releaseQuarantine(record_id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/quarantine/${record_id}/release`, {
      method: 'POST',
    });
    return res.json();
  },

  async purgeQuarantine(record_id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/quarantine/${record_id}/purge`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getAttackCatalog(): Promise<AttackItem[]> {
    const res = await fetch(`${BASE_URL}/attacks/catalog`);
    return res.json();
  },

  async generateAttack(payload: {
    family: string;
    goal: string;
    base_payload?: string;
    obfuscation: string;
    placement: string;
    carrier_topic: string;
  }): Promise<AttackItem> {
    const res = await fetch(`${BASE_URL}/attacks/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getBenchmarkSummary(): Promise<any> {
    const res = await fetch(`${BASE_URL}/benchmark/summary`);
    return res.json();
  },

  async runBenchmark(config_name = 'C6'): Promise<any> {
    const res = await fetch(`${BASE_URL}/benchmark/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config_name }),
    });
    return res.json();
  },

  async getVectorSpace(): Promise<{ total_vectors: number; points: VectorPoint[] }> {
    const res = await fetch(`${BASE_URL}/vector/explore`);
    return res.json();
  },

  async listIncidents(limit = 50): Promise<IncidentItem[]> {
    const res = await fetch(`${BASE_URL}/incidents/?limit=${limit}`);
    return res.json();
  },

  async getPolicy(): Promise<PolicyData> {
    const res = await fetch(`${BASE_URL}/policies/current`);
    return res.json();
  },

  async updatePolicy(policy: Partial<PolicyData>): Promise<any> {
    const res = await fetch(`${BASE_URL}/policies/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return res.json();
  },
};
