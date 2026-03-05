import streamlit as st
import pandas as pd
import numpy as np
import os
import sys
import matplotlib.pyplot as plt

# Add src to path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.models.explain import ModelExplainer
from src.api.llm_explainer import DefaultExplainerLLM

# Set page config
st.set_page_config(
    page_title="AI Loan Intelligence System",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for UI improvement
st.markdown("""
<style>
    .metric-card {
        background-color: #1e1e1e;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
    }
    .high-risk { color: #ff4b4b; font-weight: bold; font-size: 24px;}
    .med-risk { color: #ffa500; font-weight: bold; font-size: 24px;}
    .low-risk { color: #00fa9a; font-weight: bold; font-size: 24px;}
</style>
""", unsafe_allow_html=True)

@st.cache_resource
def load_systems():
    try:
        explainer = ModelExplainer(
            model_path="src/models/saved_models/xgboost.pkl",
            data_path="data/processed/test_processed.csv"
        )
        llm = DefaultExplainerLLM()
        return explainer, llm
    except Exception as e:
        st.error(f"Initialization Error: Ensure you have run preprocessing and training first.\n{e}")
        st.stop()

explainer, llm = load_systems()

def main():
    st.title("💸 AI-Based Loan Default Intelligence System")
    st.markdown("---")
    
    # Sidebar
    st.sidebar.header("Applicant Selection")
    
    # Let user pick an applicant from the test set
    max_idx = len(explainer.X_test) - 1
    applicant_id = st.sidebar.slider("Select Applicant ID (Test Set Index)", 0, max_idx, 0)
    
    st.sidebar.markdown("---")
    st.sidebar.info(
        "**Hackathon Demo Info:**\n"
        "This selector picks a borrower from the preprocessed test dataset. "
        "The model predicts probability of default, SHAP explains *why*, "
        "and GenAI translates it into English."
    )
    
    # Main Content Area
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Applicant Profile Data")
        borrower_data = explainer.X_test.iloc[[applicant_id]].T
        borrower_data.columns = ['Value']
        st.dataframe(borrower_data.style.format("{:.2f}"), height=500)

    with col2:
        st.subheader("Intelligence Report")
        
        # 1. Get Prediction & Explainability
        with st.spinner("Analyzing Risk Profile..."):
            local_exp = explainer.explain_borrower(applicant_id)
            prob = local_exp['default_probability'] * 100
            
            # Risk level categorization
            if prob > 50:
                risk_class, risk_text = "high-risk", "HIGH RISK"
            elif prob > 20:
                risk_class, risk_text = "med-risk", "MODERATE RISK"
            else:
                risk_class, risk_text = "low-risk", "LOW RISK"

            st.markdown(f"""
            <div class="metric-card">
                <h3>Predicted Default Probability</h3>
                <div class="{risk_class}">{prob:.1f}% ({risk_text})</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        
        # 2. GenAI Analyst Summary
        st.subheader("🤖 GenAI Analyst Summary")
        with st.spinner("Generating natural language insights via LLM..."):
            # Using st.info for a prominent display box
            explanation = llm.generate_explanation(local_exp)
            st.info(explanation)
            
        st.markdown("<br>", unsafe_allow_html=True)
            
        # 3. SHAP Feature Importance Plot
        st.subheader("📊 Quantifiable Risk Factors (SHAP)")
        
        # Create a horizontal bar chart of the top features manually using Matplotlib
        all_features = local_exp['risk_factors_increasing_default'] + local_exp['mitigating_factors_decreasing_default']
        names = [f['Feature'] for f in all_features]
        vals = [f['SHAP_Value'] for f in all_features]
        colors = ['red' if x > 0 else 'green' for x in vals]
        
        fig, ax = plt.subplots(figsize=(8, 4))
        ax.barh(names, vals, color=colors)
        ax.axvline(0, color='white', linestyle='--', linewidth=1)
        ax.set_xlabel("SHAP Value (Impact on Default Risk)")
        ax.set_title("Top Feature Contributions")
        # Invert y-axis to have the highest risk at the top
        plt.gca().invert_yaxis()
        
        st.pyplot(fig)

if __name__ == "__main__":
    main()
