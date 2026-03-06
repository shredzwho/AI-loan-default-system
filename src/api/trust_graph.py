class TrustGraphScorer:
    """
    Simulates a Graph Neural Network (GNN) scoring mechanism by checking connections between 
    a borrower and external risk nodes (e.g., their employer industry flag)
    """
    def __init__(self):
        # Penalty modifiers keyed by employer flag
        self.risk_penalties = {
            'Low': 0.0,
            'Moderate': 5.0,
            'Layoff_Alert': 15.0,
            'Market_Volatility': 10.0
        }

    def evaluate_graph_risk(self, borrower_data: dict, base_risk_score: float) -> dict:
        """
        Takes the ML base default risk (0.0 to 1.0) and applies a node-based modifier.
        Returns the adjusted probability and metadata about the graph propagation.
        """
        employer_flag = borrower_data.get('employer_industry_risk_flag', 'Unknown')
        
        penalty_pts = self.risk_penalties.get(employer_flag, 0.0)
        
        # Convert base risk to 100 pt scale for penalty addition, then convert back
        base_pts = base_risk_score * 100
        adjusted_pts = min(base_pts + penalty_pts, 99.9)
        adjusted_risk = adjusted_pts / 100.0
        
        impact = "+" + str(penalty_pts) if penalty_pts > 0 else "Neutral"
        
        if penalty_pts > 0:
            reasoning = f"Trust Graph propagated a high-risk '{employer_flag}' constraint from the Employer Node, increasing default probability by {penalty_pts}%."
        else:
            reasoning = f"Trust Graph verified strong connections with no adverse flags. Employer Node is '{employer_flag}'."
            
        return {
            "employer_node_flag": employer_flag,
            "graph_penalty_applied": penalty_pts,
            "adjusted_default_probability": adjusted_risk,
            "graph_impact_label": impact,
            "reasoning": reasoning
        }
