from flask import jsonify
from fact_checker.fact_checker import FactChecker

class FactCheckerController:
    def __init__(self):
        self.fact_checker = FactChecker()

    def analyze_text(self, text: str):
        """
        Analyze text for claims and fact check them.
        """
        try:
            results = self.fact_checker.analyze_text(text)
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500