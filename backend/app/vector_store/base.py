from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class VectorRecord(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None
    distance: Optional[float] = None
    similarity: Optional[float] = None

class BaseVectorStore:
    def add(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]) -> None:
        raise NotImplementedError

    def query(self, query_text: str, n_results: int = 4, where: Optional[Dict[str, Any]] = None) -> List[VectorRecord]:
        raise NotImplementedError

    def delete(self, ids: List[str]) -> None:
        raise NotImplementedError

    def count(self) -> int:
        raise NotImplementedError

    def get_all(self, limit: int = 100) -> List[VectorRecord]:
        raise NotImplementedError
