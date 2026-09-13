import json
import os
import re
from typing import List, Dict, Any, Tuple
from app.config import settings

class RAGService:
    def __init__(self):
        self.knowledge_base_path = os.path.join(
            os.path.dirname(__file__), "..", "data", "knowledge_base.json"
        )
        self.documents: List[Dict[str, Any]] = self._load_knowledge_base()

    def _load_knowledge_base(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.knowledge_base_path):
            with open(self.knowledge_base_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def retrieve_relevant_chunks(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top-k relevant knowledge chunks using semantic keyword & token matching.
        In Azure/production, this queries PostgreSQL with pgvector.
        """
        query_tokens = set(re.findall(r"\w+", query.lower()))
        scored_docs: List[Tuple[float, Dict[str, Any]]] = []

        for doc in self.documents:
            score = 0.0
            doc_keywords = set(doc.get("keywords", []))
            doc_content_tokens = set(re.findall(r"\w+", doc.get("content", "").lower()))
            doc_title_tokens = set(re.findall(r"\w+", doc.get("title", "").lower()))

            # Keyword match weight
            keyword_overlap = query_tokens.intersection(doc_keywords)
            score += len(keyword_overlap) * 3.0

            # Title overlap weight
            title_overlap = query_tokens.intersection(doc_title_tokens)
            score += len(title_overlap) * 2.0

            # Content overlap weight
            content_overlap = query_tokens.intersection(doc_content_tokens)
            score += len(content_overlap) * 0.5

            if score > 0:
                scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]

    async def generate_answer(self, query: str, language: str = "en") -> Dict[str, Any]:
        """
        Synthesizes a grounded, hallucination-free response using retrieved context.
        """
        relevant_chunks = self.retrieve_relevant_chunks(query, top_k=2)

        if not relevant_chunks:
            fallback_text = (
                "Thank you for reaching out to Godavari Grown! 🍄 "
                "Our harvest team dispatches fresh organic mushrooms daily across East & West Godavari, "
                "and ships grow kits & superfood extracts all across India.\n\n"
                "For custom commercial quotes or immediate dispatch verification, "
                "our farm growers are available right now on WhatsApp!"
            )
            return {
                "reply": fallback_text,
                "sources": [],
                "whatsapp_cta": f"https://wa.me/{settings.WHATSAPP_BUSINESS_PHONE.replace('+', '')}?text=Hi%20Godavari%20Grown!%20I%20have%20a%20question%20about%20your%20mushrooms.",
                "suggested_prompts": [
                    "What varieties do you grow?",
                    "Where do you deliver in East/West Godavari?",
                    "Wholesale rates for restaurants",
                    "How to use the DIY Grow Kit?"
                ]
            }

        # Build context from retrieved chunks
        context_text = "\n\n".join(
            [f"[{doc['title']}]: {doc['content']}" for doc in relevant_chunks]
        )
        sources = [doc["title"] for doc in relevant_chunks]

        # In production with GEMINI_API_KEY, call Gemini 2.5 Flash
        if settings.GEMINI_API_KEY:
            try:
                import httpx
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
                prompt = (
                    "You are Godavari Grown's friendly and authoritative agricultural AI assistant. "
                    "Answer the user query truthfully and concisely based ONLY on the provided context.\n\n"
                    f"Context:\n{context_text}\n\n"
                    f"User Query: {query}\n\n"
                    "Response:"
                )
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(gemini_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "reply": reply,
                            "sources": sources,
                            "whatsapp_cta": f"https://wa.me/{settings.WHATSAPP_BUSINESS_PHONE.replace('+', '')}",
                            "suggested_prompts": []
                        }
            except Exception as e:
                pass  # Fallback to local synthesis

        # Local deterministic synthesis
        reply_lines = [doc["content"] for doc in relevant_chunks]
        combined_reply = "\n\n".join(reply_lines)

        return {
            "reply": combined_reply,
            "sources": sources,
            "whatsapp_cta": f"https://wa.me/{settings.WHATSAPP_BUSINESS_PHONE.replace('+', '')}?text=Hi%20Godavari%20Grown!%20I%20would%20like%20to%20place%20an%20order.",
            "suggested_prompts": [
                "How to store fresh mushrooms?",
                "What are wholesale bulk prices?",
                "Do you deliver to Kakinada / Rajahmundry?"
            ]
        }

rag_service = RAGService()
