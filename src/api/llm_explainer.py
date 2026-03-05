import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables (e.g., GEMINI_API_KEY from a .env file if it exists)
load_dotenv()

class DefaultExplainerLLM:
    def __init__(self):
        # Assumes GEMINI_API_KEY is set in environment variables
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use a fast, capable model for generating text
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            print("WARNING: GEMINI_API_KEY not found in environment. Mocking LLM response.")
            self.model = None

    def _construct_prompt(self, explanation_data: Dict[str, Any]) -> str:
        """
        Creates a structured prompt mapping SHAP data to natural language for the LLM.
        """
        prob = explanation_data['default_probability'] * 100
        risk_level = "High" if prob > 50 else "Moderate" if prob > 20 else "Low"
        
        inc_factors = "\n".join([f"- {f['Feature']} (Value: {f['Value']:.2f}): Increased risk score by {f['SHAP_Value']:.4f}" 
                                 for f in explanation_data['risk_factors_increasing_default']])
        
        dec_factors = "\n".join([f"- {f['Feature']} (Value: {f['Value']:.2f}): Decreased risk score by {abs(f['SHAP_Value']):.4f}" 
                                 for f in explanation_data['mitigating_factors_decreasing_default']])
        
        prompt = f"""
You are an expert financial AI assistant. Your job is to explain a machine learning model's loan default prediction to a loan officer in clear, professional, concise, and non-technical language.

The model predicts that this applicant has a **{prob:.1f}% probability of defaulting** on their loan.
This is considered a **{risk_level} Risk**.

Here are the top factors that INCREASED the applicant's risk of default (Negative factors for the applicant):
{inc_factors}

Here are the top factors that DECREASED the applicant's risk of default (Positive factors for the applicant):
{dec_factors}

Please provide a 3-4 sentence summary explaining:
1. The overall risk assessment.
2. The primary reasons behind this risk score based *only* on the strongest factors provided above.
3. A brief, actionable recommendation for the loan officer (e.g., "approve", "reject", or "requires manual review of [specific feature]").

Keep the tone objective and professional. Do not use terms like "SHAP values" or "coefficients" – translate them into business impact (e.g., "The applicant's high debt-to-income ratio significantly increased their risk profile").
"""
        return prompt

    def generate_explanation(self, explanation_data: Dict[str, Any]) -> str:
        """
        Takes the SHAP explanation dictionary and returns a natural language summary.
        """
        prompt = self._construct_prompt(explanation_data)
        
        if not self.model:
            # Fallback for hackathon demo if no API key is set
            prob = explanation_data['default_probability'] * 100
            return f"[MOCK LLM RESPONSE]\nBased on the model, there is a {prob:.1f}% risk of default. The primary risk factor is {explanation_data['risk_factors_increasing_default'][0]['Feature']}. Manual review suggested."

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating explanation: {str(e)}"

if __name__ == "__main__":
    # Example test data matching the output structure from src/models/explain.py
    sample_shap_data = {
        "borrower_index": 105,
        "default_probability": 0.78,
        "risk_factors_increasing_default": [
            {'Feature': 'dti_ratio', 'Value': 0.45, 'SHAP_Value': 0.34},
            {'Feature': 'num_late_payments', 'Value': 3.0, 'SHAP_Value': 0.21}
        ],
        "mitigating_factors_decreasing_default": [
            {'Feature': 'annual_income', 'Value': 95000, 'SHAP_Value': -0.12}
        ]
    }
    
    llm = DefaultExplainerLLM()
    explanation = llm.generate_explanation(sample_shap_data)
    
    print("--- GenAI Narrative Explanation ---")
    print(explanation)
