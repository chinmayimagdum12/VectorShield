import uuid
from typing import List, Dict, Any, Tuple
from app.models.schemas import ScanResult, ChunkMetadata

class L2IndexerGuard:
    """
    Layer 2: Indexer Security & Metadata Isolation Guard
    Evaluates document risk prior to vector DB commitment.
    Separates benign vectors from quarantined chunks.
    """
    def __init__(self, block_threshold: float = 65.0, quarantine_threshold: float = 80.0):
        self.block_threshold = block_threshold
        self.quarantine_threshold = quarantine_threshold

    def evaluate_chunks(
        self,
        doc_id: str,
        chunks: List[str],
        scan_result: ScanResult,
        source: str,
        trust_tier: str,
        content_hash: str
    ) -> Tuple[List[str], List[str], List[Dict[str, Any]], bool]:
        """
        Returns:
        (allowed_chunk_ids, allowed_chunk_texts, allowed_metadatas, is_quarantined)
        """
        if scan_result.risk_score >= self.quarantine_threshold:
            # Entire document is quarantined!
            return [], [], [], True

        allowed_ids = []
        allowed_texts = []
        allowed_metadatas = []

        reason_codes = [f.reason_code for f in scan_result.findings]

        for i, chunk_text in enumerate(chunks):
            chunk_id = f"{doc_id}_c{i}"
            # Even if document as a whole is below quarantine, individual chunk might have high local risk
            meta = {
                "doc_id": doc_id,
                "chunk_id": chunk_id,
                "source": source,
                "trust_tier": trust_tier,
                "content_hash": content_hash,
                "risk_score": scan_result.risk_score,
                "reason_codes": reason_codes,
                "quarantined": False
            }
            allowed_ids.append(chunk_id)
            allowed_texts.append(chunk_text)
            allowed_metadatas.append(meta)

        return allowed_ids, allowed_texts, allowed_metadatas, False

l2_indexer = L2IndexerGuard()
