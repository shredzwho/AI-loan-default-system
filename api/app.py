from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import sys
import os

# Add src to path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.models.explain import ModelExplainer
from src.api.llm_explainer import DefaultExplainerLLM

app = FastAPI(
    title="AI Loan Default Intelligence API",
    description="API for predicting loan defaults, explaining the factors via SHAP, and generating a text summary with GenAI.",
    version="1.0.0"
)

# Load systems at startup
try:
    explainer = ModelExplainer(
        model_path="src/models/saved_models/xgboost.pkl",
        data_path="data/processed/test_processed.csv"
    )
    llm = DefaultExplainerLLM()
except Exception as e:
    print(f"Warning: Models not fully initialized. {e}")

class BorrowerRequest(BaseModel):
    applicant_id: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Loan Default Intelligence API"}

@app.post("/analyze_borrower")
def analyze_borrower(request: BorrowerRequest):
    """
    Analyzes a borrower from the preprocessed test set.
    """
    try:
        # 1. Ensure valid ID
        if request.applicant_id < 0 or request.applicant_id >= len(explainer.X_test):
            raise HTTPException(status_code=400, detail="Invalid applicant_id. Out of bounds.")
            
        # 2. Get the explanation from the Explainability Module (SHAP + Predict)
        explanation_data = explainer.explain_borrower(request.applicant_id)
        
        # 3. Generate Natural Language summary via GenAI Module
        narrative = llm.generate_explanation(explanation_data)
        
        # 4. Construct Response
        response = {
            "applicant_id": request.applicant_id,
            "prediction_metrics": {
                "default_probability": round(explanation_data['default_probability'], 4),
                "risk_category": "High" if explanation_data['default_probability'] > 0.50 else "Moderate" if explanation_data['default_probability'] > 0.20 else "Low"
            },
            "top_risk_factors": explanation_data['risk_factors_increasing_default'],
            "top_mitigating_factors": explanation_data['mitigating_factors_decreasing_default'],
            "genai_narrative": narrative
        }
        
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
