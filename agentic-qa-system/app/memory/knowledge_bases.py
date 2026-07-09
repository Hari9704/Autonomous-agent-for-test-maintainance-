"""
The 4 Bedrock Knowledge Bases from the architecture doc, reimplemented as
local Chroma collections (PersistentClient, on-disk under
`data/chroma/`) so the whole memory tier runs inside this Repl with zero
external dependencies. Swap `KnowledgeBaseStore` for a Bedrock-backed
implementation later without touching any calling code -- every agent
node talks to this module through `query()` / `add_document()` only.

  KB_EXECUTION_MEMORY  -- past classification + fix + human-correction pairs
  KB_FUNCTIONAL_DOCS   -- product requirements / UI specs (grounds fixes + test drafts)
  KB_SEMANTIC_UI       -- per-stream screen descriptions (cross-build semantic diff)
  KB_JIRA_HISTORY      -- past bug titles/descriptions (deduplication)

Embeddings use Chroma's bundled local ONNX MiniLM embedding function --
no API key required, runs fully offline.
"""

from __future__ import annotations

import logging
import threading
import uuid
from typing import Any

import chromadb

from app.config import settings

logger = logging.getLogger("qa_agent.memory.kb")

KB_EXECUTION_MEMORY = "kb_execution_memory"
KB_FUNCTIONAL_DOCS = "kb_functional_docs"
KB_SEMANTIC_UI = "kb_semantic_ui"
KB_JIRA_HISTORY = "kb_jira_history"

ALL_KNOWLEDGE_BASES = [KB_EXECUTION_MEMORY, KB_FUNCTIONAL_DOCS, KB_SEMANTIC_UI, KB_JIRA_HISTORY]


class KnowledgeBaseStore:
    """Thin wrapper around a set of Chroma collections, one per KB."""

    _instance: "KnowledgeBaseStore | None" = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._client = chromadb.PersistentClient(path=settings.storage.chroma_dir)
        self._collections = {name: self._client.get_or_create_collection(name) for name in ALL_KNOWLEDGE_BASES}

    @classmethod
    def instance(cls) -> "KnowledgeBaseStore":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def add_document(
        self,
        kb: str,
        text: str,
        metadata: dict[str, Any] | None = None,
        doc_id: str | None = None,
    ) -> str:
        doc_id = doc_id or str(uuid.uuid4())
        self._collections[kb].upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata or {}],
        )
        return doc_id

    def query(self, kb: str, text: str, top_k: int = 3, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        collection = self._collections[kb]
        if collection.count() == 0:
            return []
        result = collection.query(query_texts=[text], n_results=min(top_k, collection.count()), where=where)
        hits = []
        docs = result.get("documents", [[]])[0]
        metas = result.get("metadatas", [[]])[0]
        dists = result.get("distances", [[]])[0]
        ids = result.get("ids", [[]])[0]
        for doc, meta, dist, doc_id in zip(docs, metas, dists, ids):
            # Chroma returns squared-L2 by default; convert to a rough
            # [0, 1] similarity score for threshold comparisons upstream.
            similarity = 1.0 / (1.0 + dist)
            hits.append({"id": doc_id, "text": doc, "metadata": meta, "similarity": similarity})
        return hits

    def count(self, kb: str) -> int:
        return self._collections[kb].count()

    def stats(self) -> dict[str, int]:
        return {kb: self.count(kb) for kb in ALL_KNOWLEDGE_BASES}


def get_kb_store() -> KnowledgeBaseStore:
    return KnowledgeBaseStore.instance()
