import requests
import json
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from gradio_client import Client
import os
from typing import List, Dict, Any
from .gemini_summarizer import GeminiSummarizer

class FactChecker:
    def __init__(self):
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.claim_detector = Client("namingiscomplicated/claimDetector")
        self.summarizer = GeminiSummarizer()

    def web_check(self, claim: str) -> Dict[str, Any]:
        """
        Check a claim against trusted web sources using Tavily API.
        """
        try:
            resp = requests.post(
                "https://api.tavily.com/search",
                headers={"Authorization": f"Bearer {self.tavily_api_key}"},
                json={
                    "query": claim,
                    "num_results": 4,
                    "include_domains": ["snopes.com", "wikipedia.org", "nasa.gov", "bbc.com", "forbes.com"]
                }
            )
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def pinecone_retrieve(self, claim: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Retrieve similar fact checks from Pinecone vector database.
        """
        try:
            pc = Pinecone(api_key=self.pinecone_api_key)
            index_name = "factcheck"
            pc_index = pc.Index(index_name)
            
            embedding = self.model.encode([claim]).tolist()[0]
            results = pc_index.query(
                vector=embedding,
                top_k=top_k,
                include_metadata=True
            )

            curated_results = []
            for match in results['matches']:
                curated_results.append({
                    "id": match["id"],
                    "score": match["score"],
                    "statement": match["metadata"].get("statement", ""),
                    "verdict": match["metadata"].get("verdict", "")
                })
            
            return {"results": curated_results}
        except Exception as e:
            return {"error": str(e)}

    def is_claim(self, sentence: str) -> Dict[str, Any]:
        """
        Check if a given sentence is a claim using the claim detector model.
        """
        try:
            result = self.claim_detector.predict(
                text=sentence,
                api_name="/predict"
            )
            return {"is_claim": result}
        except Exception as e:
            return {"error": str(e)}

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze a text by splitting it into sentences and checking each for claims and facts.
        Returns a single comprehensive summary for all claims.
        """
        # Split text into sentences (simple split by period and space)
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        claim_analysis = []
        for sentence in sentences:
            claim_check = self.is_claim(sentence)
            
            if claim_check.get("error"):
                continue
                
            if claim_check.get("is_claim"):
                # If it's a claim, perform web check and pinecone retrieval
                web_results = self.web_check(sentence)
                pinecone_results = self.pinecone_retrieve(sentence)
                
                claim_analysis.append({
                    "sentence": sentence,
                    "is_claim": True,
                    "web_check": web_results,
                    "similar_facts": pinecone_results
                })
        
        # Generate comprehensive summary for all claims
        summary_result = self.summarizer.generate_comprehensive_summary(claim_analysis)
        
        return {
            "input_text": text,
            "total_sentences": len(sentences),
            "claims_found": len(claim_analysis),
            "reliability_score": summary_result.get("reliability_score"),
            "summary": summary_result.get("summary")
        }