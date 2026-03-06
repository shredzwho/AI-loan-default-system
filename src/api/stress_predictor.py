class StressPredictor:
    """
    Analyzes a borrower's financial stress based on spending volatility, savings velocity, and utility payment lag.
    """
    def __init__(self):
        pass

    def analyze_stress(self, borrower_data: dict) -> dict:
        """
        Takes raw borrower data and returns a financial stress score and a risk window.
        """
        volatility = borrower_data.get('spending_volatility', 0.5)
        velocity = borrower_data.get('savings_velocity', 0)
        utility_lag = borrower_data.get('utility_payment_lag', 0)
        
        # Calculate Stress Score (0 to 100)
        # Higher volatility = worse, Lower velocity = worse, Higher lag = worse
        volatility_component = volatility * 40
        velocity_component = (0.5 - velocity) * 40 if velocity <= 0.5 else 0 
        lag_component = (utility_lag / 45.0) * 20 if utility_lag <= 45 else 20
        
        stress_score = volatility_component + velocity_component + lag_component
        stress_score = min(max(stress_score, 0), 100) # Clamp 0-100
        
        # Risk Window Calculation
        if stress_score > 75:
            risk_window = "1−3 months (Critical)"
        elif stress_score > 50:
            risk_window = "3−6 months (High)"
        elif stress_score > 25:
            risk_window = "6−12 months (Moderate)"
        else:
            risk_window = "12+ months (Stable)"

        # String formatting the historical balances list from the CSV
        hist_bals_str = borrower_data.get('historical_balances', "[]")
        try:
            import ast
            historical_balances = ast.literal_eval(hist_bals_str)
        except:
            historical_balances = []

        return {
            "stress_score": round(stress_score, 1),
            "risk_window": risk_window,
            "historical_balances": historical_balances,
            "reasoning": f"Stress calculated based on {volatility:.2f} volatility, {velocity:.2f} savings velocity, and {utility_lag} days utility lag."
        }
