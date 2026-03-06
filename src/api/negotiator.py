class LoanNegotiator:
    """
    Optimization engine that recursively searches for alternative loan structures 
    to bring a borrower's DTI below safe thresholds.
    """
    def __init__(self, safe_dti_threshold=0.35):
        self.safe_dti_threshold = safe_dti_threshold

    def calculate_dti(self, loan_amount: float, annual_income: float, existing_debt: float, annual_interest_rate=0.10, term_months=36) -> float:
        if annual_income <= 0: return 1.0
        
        monthly_income = annual_income / 12.0
        # Simple amortization for monthly loan payment
        monthly_interest = annual_interest_rate / 12.0
        if monthly_interest > 0:
            monthly_loan_payment = loan_amount * (monthly_interest * (1 + monthly_interest)**term_months) / ((1 + monthly_interest)**term_months - 1)
        else:
            monthly_loan_payment = loan_amount / term_months
            
        monthly_existing_debt_payments = existing_debt * 0.05 # Mocking: assume 5% minimum payment on existing debt
        
        total_monthly_obligations = monthly_loan_payment + monthly_existing_debt_payments
        return total_monthly_obligations / monthly_income

    def negotiate(self, borrower_data: dict, current_default_prob: float) -> dict:
        """
        If risk > 40%, attempt to find safe harbor alternatives.
        """
        if current_default_prob <= 0.40:
            return {
                "requires_negotiation": False,
                "alternatives": [],
                "reasoning": "Borrower default probability is below the 40% threshold for mandatory negotiation."
            }
            
        loan_amount = borrower_data.get('loan_amount', 10000)
        annual_income = borrower_data.get('annual_income', 50000)
        existing_debt = borrower_data.get('existing_debt', 5000)
        
        alternatives = []
        
        # Option A: Reduced Principal (Search for amount that achieves target DTI)
        test_amount = loan_amount
        while test_amount > (loan_amount * 0.3) and self.calculate_dti(test_amount, annual_income, existing_debt) > self.safe_dti_threshold:
            test_amount -= 500
        
        if test_amount != loan_amount and self.calculate_dti(test_amount, annual_income, existing_debt) <= self.safe_dti_threshold:
            reduction_pct = ((loan_amount - test_amount) / loan_amount) * 100
            alternatives.append({
                "option": "Reduced Principal",
                "details": f"Reduce loan amount by {reduction_pct:.1f}% to ${test_amount:.2f}.",
                "projected_dti": round(self.calculate_dti(test_amount, annual_income, existing_debt), 3)
            })
            
        # Option B: Extended Tenure
        test_term = 36
        while test_term <= 84 and self.calculate_dti(loan_amount, annual_income, existing_debt, term_months=test_term) > self.safe_dti_threshold:
            test_term += 12
            
        if test_term > 36 and test_term <= 84:
            alternatives.append({
                "option": "Extended Tenure",
                "details": f"Extend loan term from 36 to {test_term} months.",
                "projected_dti": round(self.calculate_dti(loan_amount, annual_income, existing_debt, term_months=test_term), 3)
            })
            
        # Option C: Collateral/Guarantor Requirement (Fixed rule)
        # Assuming guarantor effectively doubles the household income for DTI purposes
        guarantor_dti = self.calculate_dti(loan_amount, annual_income * 2, existing_debt)
        if guarantor_dti <= self.safe_dti_threshold:
             alternatives.append({
                "option": "Co-Signer Requirement",
                "details": "Require a guarantor to absorb DTI risk burden.",
                "projected_dti": round(guarantor_dti, 3)
            })
            
        reasoning = f"Generated {len(alternatives)} alternatives through recursive DTI optimization targeting <35% DTI." if len(alternatives) > 0 else "No single viable alternative bounds DTI below 35% without combinations."

        return {
            "requires_negotiation": True,
            "alternatives": alternatives,
            "reasoning": reasoning
        }
