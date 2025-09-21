# Fact Checker API Documentation

## Endpoint
```
POST /api/fact-check
```

## Request Format
```json
{
    "text": "The Earth is flat and many scientists support this theory. COVID-19 vaccines are dangerous and ineffective. The sky is blue because it reflects the ocean's color."
}
```

## Response Format
```json
{
    "input_text": "The Earth is flat and many scientists support this theory. COVID-19 vaccines are dangerous and ineffective. The sky is blue because it reflects the ocean's color.",
    "total_sentences": 3,
    "claims_found": 2,
    "reliability_score": 15,
    "summary": "Analysis of the provided text reveals several problematic claims:

1. The flat Earth claim is demonstrably false. No credible scientific institutions support this theory, and it contradicts centuries of empirical evidence, including satellite imagery and space exploration data.

2. The claim about COVID-19 vaccines is misleading and false. Extensive clinical trials and real-world data have proven both the safety and efficacy of COVID-19 vaccines. The global scientific consensus strongly supports vaccine safety and effectiveness.

3. The explanation of the sky's color is incorrect. The sky appears blue due to a phenomenon called Rayleigh scattering, not because it reflects the ocean.

Overall Assessment: The text contains multiple scientifically inaccurate statements and appears to promote common misconceptions. The claims contradict well-established scientific evidence and consensus. The low reliability score (15/100) reflects the presence of multiple false claims and the misrepresentation of scientific facts."
}
```

## Response Fields
- `input_text`: The original text that was analyzed
- `total_sentences`: Total number of sentences analyzed
- `claims_found`: Number of factual claims identified
- `reliability_score`: Overall reliability score of the text (0-100)
- `summary`: Comprehensive analysis of all claims, including:
  - Evaluation of each significant claim
  - Supporting evidence
  - Overall assessment
  - Patterns or relationships between claims
  - Confidence level in the conclusions

## Error Response
```json
{
    "error": "Description of what went wrong"
}
```