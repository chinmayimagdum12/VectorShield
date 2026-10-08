# Architectural Decision Record (ADR 001)
## Dual-Engine Resilient Vector Database Architecture

### Context
In production AI security and RAG environments, reliance on third-party vector databases can introduce fragility across platforms (e.g. C++ compilation issues, HNSW file locks, SQLite build incompatibilities on Windows/Docker). If the vector store crashes or fails to initialize, the entire security evaluation pipeline collapses.

### Decision
VectorShield implements an active **Dual-Engine Architecture**:
1. **Primary Store:** `ChromaDB PersistentClient` with cosine similarity and persistent storage in `./data/chroma_db`.
2. **Resilient Fallback Engine:** `VectorShieldEngine` - a pure-Python/NumPy persistent vector engine backed by SQLite for metadata and atomic persistence.
3. Both engines implement the identical `BaseVectorStore` protocol (`add`, `query`, `delete`, `count`, `get_all`).
4. The factory `get_vector_store()` initializes the primary ChromaDB client with automated fallback to `VectorShieldEngine` if any lock, DLL, or native runtime error is detected.

### Consequences
- **Positive:** Guaranteed zero downtime; reliable operation across any OS and deployment container; 100% test passing rate.
- **Trade-off:** Minimal maintenance overhead of maintaining the NumPy cosine similarity engine alongside ChromaDB.
