import pandas as pd
import numpy as np
import os

class FeatureEngineer:
    def __init__(self, raw_data_path="data/raw/loan_data.csv", processed_data_path="data/processed/loan_data_engineered.csv"):
        self.raw_data_path = raw_data_path
        self.processed_data_path = processed_data_path

    def load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Data not found at {self.raw_data_path}. Run load_data.py first.")
        return pd.read_csv(self.raw_data_path)

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates derived financial features that are highly predictive of default risk.
        """
        print("Starting feature engineering...")
        df_engineer = df.copy()
        
        # 1. Debt-to-Income Ratio (DTI)
        # Why: High DTI strongly indicates financial strain and inability to take on new debt.
        # Handle division by zero or very small incomes.
        df_engineer['dti_ratio'] = np.where(df_engineer['annual_income'] > 0, 
                                            df_engineer['existing_debt'] / df_engineer['annual_income'], 
                                            0)
        
        # 2. Credit Utilization Ratio
        # Why: Utilizing a high percentage of available credit signals distress.
        df_engineer['credit_utilization_ratio'] = np.where(df_engineer['total_credit_limit'] > 0,
                                                           df_engineer['existing_debt'] / df_engineer['total_credit_limit'],
                                                           0)
                                                           
        # 3. Loan-to-Income Ratio
        # Why: Measures the burden of the specific loan requested against annual earnings.
        df_engineer['loan_to_income_ratio'] = np.where(df_engineer['annual_income'] > 0,
                                                       df_engineer['loan_amount'] / df_engineer['annual_income'],
                                                       0)
        
        # 4. Payment Behavior Features
        # Why: Past behavior (late payments) is the best predictor of future behavior (defaults).
        # We can create a binary flag for "has late payments"
        df_engineer['has_late_payments'] = (df_engineer['num_late_payments'] > 0).astype(int)
        
        # Severe late payer flag (e.g., more than 2 late payments)
        df_engineer['severe_late_payer'] = (df_engineer['num_late_payments'] > 2).astype(int)
        
        # 5. Time-based features
        # Why: Employment stability correlates negatively with default risk.
        # Flag for long-term stable employment (e.g., > 5 years)
        df_engineer['stable_employment'] = (df_engineer['employment_length'] >= 5).astype(int)
        
        # 6. Interaction Feature: Credit Score + DTI
        # High DTI with low credit score is an extremely high risk signal
        df_engineer['risk_interaction_dti_credit'] = df_engineer['dti_ratio'] / (df_engineer['credit_score'] + 1)
        
        # Note: The new advanced ML features (spending_volatility, savings_velocity, utility_payment_lag, 
        # employer_industry_risk_flag, document_mismatch_score, identity_fraud_intent, historical_balances)
        # are already carried over from the df.copy() above.

        print("Feature engineering complete.")
        return df_engineer

    def save_data(self, df: pd.DataFrame):
        os.makedirs(os.path.dirname(self.processed_data_path), exist_ok=True)
        df.to_csv(self.processed_data_path, index=False)
        print(f"Engineered data saved to {self.processed_data_path}")

if __name__ == "__main__":
    fe = FeatureEngineer()
    df_raw = fe.load_data()
    df_engineered = fe.engineer_features(df_raw)
    fe.save_data(df_engineered)
    
    print("\nSample of engineered features:")
    print(df_engineered[['dti_ratio', 'credit_utilization_ratio', 'loan_to_income_ratio', 'severe_late_payer']].head())
