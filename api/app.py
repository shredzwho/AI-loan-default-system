from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import pandas as pd
import sys
import os
import joblib

# Add src to path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.models.explain import ModelExplainer
from src.api.llm_explainer import DefaultExplainerLLM
from src.api.stress_predictor import StressPredictor
from src.api.negotiator import LoanNegotiator
from src.api.trust_graph import TrustGraphScorer
from src.api.fraud_detector import FraudDetector

app = FastAPI(
    title="AI Loan Default Intelligence API",
    description="API for predicting loan defaults, explaining the factors via SHAP, and generating a text summary with GenAI.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load systems at startup
explainer = None
llm = None
stress_predictor = None
negotiator = None
trust_graph = None
fraud_detector = None
label_encoders = None
try:
    explainer = ModelExplainer(
        model_path="src/models/saved_models/xgboost.pkl",
        data_path="data/processed/test_processed.csv"
    )
    llm = DefaultExplainerLLM()
    stress_predictor = StressPredictor()
    negotiator = LoanNegotiator()
    trust_graph = TrustGraphScorer()
    fraud_detector = FraudDetector()
    label_encoders = joblib.load(os.path.join("data/processed", "label_encoders.pkl"))
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
    if not explainer or not llm or not stress_predictor or not negotiator or not trust_graph or not fraud_detector:
        raise HTTPException(status_code=503, detail="Machine Learning models are not fully initialized. Ensure you have run train.py first.")

    try:
        # 1. Ensure valid ID
        if request.applicant_id < 0 or request.applicant_id >= len(explainer.X_test):
            raise HTTPException(status_code=400, detail="Invalid applicant_id. Out of bounds.")
            
        # 2. Get the explanation from the Explainability Module (SHAP + Base Risk)
        explanation_data = explainer.explain_borrower(request.applicant_id)
        raw_borrower_data = explainer.X_test.iloc[request.applicant_id].to_dict()
        
        # Decode categorical variables for UI and downstream engines
        if label_encoders:
            for col, le in label_encoders.items():
                if col in raw_borrower_data:
                    # ML outputs floats, so cast to int before inverse transform
                    val = int(raw_borrower_data[col])
                    if val == -1:
                        raw_borrower_data[col] = "Unknown"
                    else:
                        raw_borrower_data[col] = le.inverse_transform([val])[0]
        base_probability = explanation_data['default_probability']
        
        # 3. Trust Graph: Adjust probability based on Employer node flags
        graph_data = trust_graph.evaluate_graph_risk(raw_borrower_data, base_probability)
        adjusted_probability = graph_data['adjusted_default_probability']
        
        # 4. Financial Stress Predictor: Trajectory and Score
        stress_data = stress_predictor.analyze_stress(raw_borrower_data)
        
        # 5. Fraud Detector: 2x2 Risk Classification (Intent vs Ability)
        fraud_data = fraud_detector.evaluate_fraud_risk(raw_borrower_data)
        matrix_position = fraud_detector.generate_matrix_position(fraud_data['fraud_intent_category'], adjusted_probability)
        fraud_data['matrix_position'] = matrix_position
        
        # 6. AI Negotiator: DTI Optimization for high-risk clients
        negotiation_data = negotiator.negotiate(raw_borrower_data, adjusted_probability)
        
        # 7. GenAPI Explainer & Health Coach Recourse
        # Update the explanation probability to the new adjusted one for the LLM context
        explanation_data['default_probability'] = adjusted_probability
        genai_result = llm.generate_explanation(explanation_data)
        health_coach_plan = llm.generate_health_coach_plan(explanation_data)
        
        # 8. Document Verification (Mocked for dashboard parity)
        # We use the applicant_id as a seed to make it consistent
        seed = request.applicant_id
        document_verification = {
            "aadhar_verified": (seed % 2 == 0),
            "pan_verified": (seed % 3 != 0),
            "salary_slips_verified": (seed % 5 != 0),
            "bank_statements_verified": (seed % 7 == 0)
        }

        # 9. Construct Command Center Master Payload
        response = {
            "applicant_id": request.applicant_id,
            "prediction_metrics": {
                "base_probability": round(base_probability, 4),
                "adjusted_probability": round(adjusted_probability, 4),
                "risk_category": "High" if adjusted_probability > 0.50 else "Moderate" if adjusted_probability > 0.20 else "Low"
            },
            "shap_explanation": {
                "top_risk_factors": explanation_data['risk_factors_increasing_default'],
                "top_mitigating_factors": explanation_data['mitigating_factors_decreasing_default']
            },
            "trust_graph_analysis": graph_data,
            "financial_stress_analysis": stress_data,
            "fraud_matrix_analysis": fraud_data,
            "negotiation_alternatives": negotiation_data,
            "document_verification": document_verification,
            "genai_insights": {
                "narrative": genai_result["narrative"],
                "positive_indicators": genai_result["positive_indicators"],
                "risk_drivers": genai_result["risk_drivers"],
                "health_coach_plan": health_coach_plan
            }
        }
        
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/analyze_borrower")
async def websocket_analyze_borrower(websocket: WebSocket):
    await websocket.accept()
    if not explainer or not llm or not stress_predictor or not negotiator or not trust_graph or not fraud_detector:
        await websocket.send_json({"type": "error", "message": "ML models not fully initialized."})
        await websocket.close()
        return

    try:
        data = await websocket.receive_json()
        applicant_id = int(data.get("applicant_id", -1))
        
        if applicant_id < 0 or applicant_id >= len(explainer.X_test):
            await websocket.send_json({"type": "error", "message": "Invalid applicant_id. Out of bounds."})
            await websocket.close()
            return

        # --- STEP 1: FAST DETERMINISTIC MODELS ---
        explanation_data = explainer.explain_borrower(applicant_id)
        raw_borrower_data = explainer.X_test.iloc[applicant_id].to_dict()
        
        if label_encoders:
            for col, le in label_encoders.items():
                if col in raw_borrower_data:
                    val = int(raw_borrower_data[col])
                    if val == -1:
                        raw_borrower_data[col] = "Unknown"
                    else:
                        raw_borrower_data[col] = le.inverse_transform([val])[0]
                    
        base_probability = explanation_data['default_probability']
        graph_data = trust_graph.evaluate_graph_risk(raw_borrower_data, base_probability)
        adjusted_probability = graph_data['adjusted_default_probability']
        stress_data = stress_predictor.analyze_stress(raw_borrower_data)
        
        fraud_data = fraud_detector.evaluate_fraud_risk(raw_borrower_data)
        matrix_position = fraud_detector.generate_matrix_position(fraud_data['fraud_intent_category'], adjusted_probability)
        fraud_data['matrix_position'] = matrix_position
        
        negotiation_data = negotiator.negotiate(raw_borrower_data, adjusted_probability)
        
        partial_response = {
            "type": "partial",
            "data": {
                "applicant_id": applicant_id,
                "prediction_metrics": {
                    "base_probability": round(base_probability, 4),
                    "adjusted_probability": round(adjusted_probability, 4),
                    "risk_category": "High" if adjusted_probability > 0.50 else "Moderate" if adjusted_probability > 0.20 else "Low"
                },
                "shap_explanation": {
                    "top_risk_factors": explanation_data['risk_factors_increasing_default'],
                    "top_mitigating_factors": explanation_data['mitigating_factors_decreasing_default']
                },
                "trust_graph_analysis": graph_data,
                "financial_stress_analysis": stress_data,
                "fraud_matrix_analysis": fraud_data,
                "negotiation_alternatives": negotiation_data,
            }
        }
        
        # Stream the 80% UI payload instantly 
        await websocket.send_json(partial_response)
        
        # --- STEP 2: SLOW GENERATIVE AI (YIELD EXECUTION) ---
        # Run synchronous Groq calls in executor to avoid blocking the event loop
        explanation_data['default_probability'] = adjusted_probability
        
        loop = asyncio.get_event_loop()
        genai_result = await loop.run_in_executor(None, llm.generate_explanation, explanation_data)
        health_coach_plan = await loop.run_in_executor(None, llm.generate_health_coach_plan, explanation_data)
        
        # Document Verification (Mocked for dashboard parity)
        seed = applicant_id
        document_verification = {
            "aadhar_verified": (seed % 2 == 0),
            "pan_verified": (seed % 3 != 0),
            "salary_slips_verified": (seed % 5 != 0),
            "bank_statements_verified": (seed % 7 == 0)
        }

        complete_response = {
            "type": "complete",
            "data": {
                **partial_response["data"],
                "document_verification": document_verification,
                "genai_insights": {
                    "narrative": genai_result["narrative"],
                    "positive_indicators": genai_result["positive_indicators"],
                    "risk_drivers": genai_result["risk_drivers"],
                    "health_coach_plan": health_coach_plan
                }
            }
        }
        
        # Stream the 100% finished payload 
        await websocket.send_json(complete_response)
        
    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
    finally:
        # Keep connection open or close depending on architecture. We'll close after one full cycle to mimic request/response, but cleanly.
        try:
             await websocket.close()
        except Exception:
             pass
