import google.generativeai as genai
import os
from typing import Dict, Any, List

class GeminiSummarizer:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_GEMINI_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_comprehensive_summary(self, all_claims_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate a single comprehensive summary for all claims in the input text.
        """
        # Prepare the analysis of all claims
        claims_analysis = []
        for claim_data in all_claims_data:
            if claim_data.get('is_claim'):
                claims_analysis.append(
                    f"Claim: {claim_data.get('sentence')}\n"
                    f"Web Check Results:\n{self._format_web_results(claim_data.get('web_check', {}))}\n"
                    f"Similar Fact Checks:\n{self._format_similar_facts(claim_data.get('similar_facts', {}))}\n"
                )

        if not claims_analysis:
            return {
                "summary": "No factual claims were identified in the input text that required fact-checking.",
                "reliability_score": None
            }

        prompt = f"""
        Analyze the following set of claims and their fact-checking results to provide a comprehensive summary:

        {'\n\n'.join(claims_analysis)}

        Please provide:
        1. A concise overall summary of the fact-checking results
        2. Identify any patterns or relationships between the claims
        3. An overall reliability score for the text (0-100)
        4. Key findings and evidence supporting the conclusions

        Format the response as:
        Summary: [Your comprehensive analysis]
        Reliability Score: [0-100]

        Keep the summary clear, objective, and evidence-based.
        """

        response = self.model.generate_content(prompt)
        text = response.text

        # Extract reliability score and summary
        try:
            parts = text.split('Reliability Score:')
            summary = parts[0].replace('Summary:', '').strip()
            reliability_score = int(parts[1].strip().split()[0])
        except:
            summary = text
            reliability_score = None

        return {
            "summary": summary,
            "reliability_score": reliability_score
        }

    def _format_web_results(self, web_check: Dict[str, Any]) -> str:
        results = web_check.get('results', [])
        formatted = []
        for result in results:
            formatted.append(f"Source: {result.get('title')}\n"
                           f"Content: {result.get('content')}\n"
                           f"Confidence: {result.get('score', 0) * 100:.0f}%")
        return "\n\n".join(formatted)

    def _format_similar_facts(self, similar_facts: Dict[str, Any]) -> str:
        results = similar_facts.get('results', [])
        formatted = []
        for result in results:
            formatted.append(f"Previous Claim: {result.get('statement')}\n"
                           f"Verdict: {result.get('verdict')}\n"
                           f"Confidence: {result.get('score', 0) * 100:.0f}%")
        return "\n\n".join(formatted)