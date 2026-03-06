class FraudDetector:
    """
    Simulates an OSINT/Cyber document fraud pipeline running parallel to financial risk models.
    """
    def __init__(self):
        pass

    def evaluate_fraud_risk(self, borrower_data: dict) -> dict:
        """
        Returns a classification on the Fraud Intent vs Financial Ability 2x2 matrix.
        """
        mismatch_score = borrower_data.get('document_mismatch_score', 0)
        identity_intent = borrower_data.get('identity_fraud_intent', 0)
        
        # Fraud Intent Axis Calculation
        # Synthesize a 0 to 100 intent score
        intent_score = (mismatch_score * 0.4) + (identity_intent * 60)
        intent_score = min(intent_score, 100.0)
        
        intent_category = "High Intent" if intent_score > 60 else "Low Intent"
        
        reasoning = f"OSINT scans found document mismatch score of {round(mismatch_score, 1)} and identity alert '{'Triggered' if identity_intent else 'Clear'}', resulting in a {round(intent_score,1)}% Fraud Intent Score."
        
        return {
            "fraud_intent_score": round(intent_score, 1),
            "fraud_intent_category": intent_category,
            "reasoning": reasoning
        }

    def generate_matrix_position(self, fraud_intent_category: str, ability_risk_prob: float) -> str:
        """
        Maps the borrower into the 2x2 Matrix based on Intent (Fraud) vs Ability (Default Risk).
        Note: High "Default Risk" = Low "Ability to Pay".
        """
        ability_category = "Low Ability" if ability_risk_prob > 0.40 else "High Ability"
        
        # 1. High Intent, Low Ability -> Criminal Fraud Ring
        if fraud_intent_category == "High Intent" and ability_category == "Low Ability":
            return "Critical Risk: High Fraud Intent + Low Repayment Ability"
            
        # 2. High Intent, High Ability -> Sleeper Fraud / Busting
        if fraud_intent_category == "High Intent" and ability_category == "High Ability":
            return "Sleeper Risk: High Fraud Intent + Capacity to borrow massive limits"
            
        # 3. Low Intent, Low Ability -> Standard Financial Default Risk
        if fraud_intent_category == "Low Intent" and ability_category == "Low Ability":
            return "Financial Risk: Legitimate Borrower but Low Repayment Ability"
            
        # 4. Low Intent, High Ability -> Safe Harbor
        return "Safe Harbor: Legitimate Borrower + Strong Capacity"
