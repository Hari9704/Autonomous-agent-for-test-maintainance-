"""
Optimization #3 -- Semantic Response Cache.

Before spending a real LLM call, embed the query and search a dedicated
Chroma collection for a past query/response pair above the similarity
threshold. "checkout button not found" and "pay button missing from
checkout" land close together in embedding space and hit the same cached
response even though the strings differ -- unlike the exact-match
Tier-2 cache in `state_store.py`.
"""

from __future__ import annotations

import json
import logging
import threading

import chromadb

from app.config import settings

logger = logging.getLogger("qa_agent.memory.semantic_cache")

_COLLECTION_NAME = "semantic_response_cache"


class SemanticResponseCache:
    _instance: "SemanticResponseCache | None" = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        client = chromadb.PersistentClient(path=settings.storage.chroma_dir)
        self._collection = client.get_or_create_collection(_COLLECTION_NAME)
        self._threshold = settings.cost.semantic_cache_similarity_threshold

    @classmethod
    def instance(cls) -> "SemanticResponseCache":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def get(self, query: str, namespace: str) -> dict | None:
        if self._collection.count() == 0:
            return None
        result = self._collection.query(
            query_texts=[query],
            n_results=1,
            where={"namespace": namespace},
        )
        docs = result.get("documents", [[]])[0]
        dists = result.get("distances", [[]])[0]
        if not docs:
            return None
        similarity = 1.0 / (1.0 + dists[0])
        if similarity < self._threshold:
            return None
        logger.info("Semantic cache HIT (similarity=%.3f, namespace=%s)", similarity, namespace)
        return json.loads(docs[0])

    def set(self, query: str, namespace: str, response: dict) -> None:
        doc_id = f"{namespace}:{hash(query)}"
        self._collection.upsert(
            ids=[doc_id],
            documents=[json.dumps(response)],
            metadatas=[{"namespace": namespace, "query_preview": query[:200]}],
        )


def get_semantic_cache() -> SemanticResponseCache:
    return SemanticResponseCache.instance()
