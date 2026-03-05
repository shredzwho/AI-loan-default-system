import shap
import pandas as pd
import numpy as np
import joblib
import os
import matplotlib.pyplot as plt

class ModelExplainer:
    def __init__(self, model_path="src/models/saved_models/xgboost.pkl", data_path="data/processed/test_processed.csv"):
        self.model_path = model_path
        self.data_path = data_path
        self.model = self._load_model()
        self.X_test, self.y_test = self._load_data()
        self.explainer = self._init_explainer()

    def _load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}. Run train.py first.")
        return joblib.load(self.model_path)

    def _load_data(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Test data not found at {self.data_path}. Run preprocess.py first.")
        df = pd.read_csv(self.data_path)
        return df.drop('loan_status', axis=1), df['loan_status']

    def _init_explainer(self):
        print("Initializing SHAP explainer...")
        # TreeExplainer is highly optimized for XGBoost and Random Forest
        return shap.TreeExplainer(self.model)

    def generate_global_explanations(self, output_dir="app/static/plots"):
        """
        Generates and saves global feature importance plots (Summary Plot).
        This helps understand what features drive the model's decisions overall.
        """
        os.makedirs(output_dir, exist_ok=True)
        print("Generating global SHAP summary plot...")
        
        # Calculate SHAP values for a sample to save time (or all of X_test if small enough)
        sample_size = min(1000, len(self.X_test))
        X_sample = self.X_test.sample(sample_size, random_state=42)
        shap_values = self.explainer.shap_values(X_sample)
        
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_sample, show=False)
        plt.tight_layout()
        plot_path = os.path.join(output_dir, "shap_summary.png")
        plt.savefig(plot_path)
        plt.close()
        print(f"Saved global summary plot to {plot_path}")

    def explain_borrower(self, borrower_index: int) -> dict:
        """
        Explains the prediction for a single specific borrower.
        Returns the top contributing features for the Gemini API to consume.
        """
        borrower_data = self.X_test.iloc[[borrower_index]]
        prediction = self.model.predict_proba(borrower_data)[0][1] # Probability of Default (Class 1)
        
        # Calculate SHAP values for this specific borrower
        shap_values = self.explainer.shap_values(borrower_data)[0]
        
        # Create a DataFrame of feature interactions
        feature_importance = pd.DataFrame({
            'Feature': self.X_test.columns,
            'Value': borrower_data.iloc[0].values,
            'SHAP_Value': shap_values
        })
        
        # Sort by absolute SHAP value to find the strongest drivers (positive or negative)
        feature_importance['Abs_SHAP'] = feature_importance['SHAP_Value'].abs()
        feature_importance = feature_importance.sort_values(by='Abs_SHAP', ascending=False)
        
        # Extract top 5 drivers
        top_positive_drivers = feature_importance[feature_importance['SHAP_Value'] > 0].head(3)
        top_negative_drivers = feature_importance[feature_importance['SHAP_Value'] < 0].head(3)
        
        explanation_data = {
            "borrower_index": borrower_index,
            "default_probability": float(prediction),
            "risk_factors_increasing_default": top_positive_drivers[['Feature', 'Value', 'SHAP_Value']].to_dict(orient='records'),
            "mitigating_factors_decreasing_default": top_negative_drivers[['Feature', 'Value', 'SHAP_Value']].to_dict(orient='records')
        }
        
        return explanation_data

if __name__ == "__main__":
    explainer = ModelExplainer()
    
    # 1. Global Explainability
    explainer.generate_global_explanations()
    
    # 2. Local Explainability (Example for Borrower at index 0)
    print("\n--- Example Local Explanation for Borrower 0 ---")
    local_exp = explainer.explain_borrower(0)
    print(f"Default Probability: {local_exp['default_probability']:.2%}")
    print("\nTop Factors Increasing Risk:")
    for factor in local_exp['risk_factors_increasing_default']:
        print(f"- {factor['Feature']} (Value: {factor['Value']:.2f}) -> SHAP: +{factor['SHAP_Value']:.4f}")
        
    print("\nTop Factors Decreasing Risk:")
    for factor in local_exp['mitigating_factors_decreasing_default']:
        print(f"- {factor['Feature']} (Value: {factor['Value']:.2f}) -> SHAP: {factor['SHAP_Value']:.4f}")
