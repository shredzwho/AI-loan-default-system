# AI-Loan Default Intelligence System
*An enterprise-grade Machine Learning & Generative AI Command Center for predicting loan defaults, explaining SHAP risk factors, and providing actionable insights.*

![AI Loan Dashboard](https://img.shields.io/badge/Next.js-React-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![AI](https://img.shields.io/badge/Groq-Llama_3-purple) ![ML](https://img.shields.io/badge/XGBoost-SMOTE-orange)

## 🌟 Overview
The AI-Loan System has evolved from a basic predictive model into a comprehensive "Command Center" dashboard. It orchestrates 5 distinct intelligence layers simultaneously:
1. **Explainable ML:** Core default probability powered by XGBoost and SHAP value extraction.
2. **Trust Graph Scorer:** GNN penalty simulator evaluating Employer Industry Risk.
3. **Behavioral Stress Predictor:** Time-series analysis charting spending volatility and utility lags to determine a 'Risk Window'.
4. **Fraud vs. Default Matrix:** OSINT intent scaling mapping borrowers into a 2x2 Risk Classification Grid.
5. **AI Loan Negotiator:** Recursive DTI optimization to auto-calculate alternative loan terms to save risky deals.
    
Furthermore, the architecture utilizes **Dual-Layer GenAI (Powered by Groq & Llama)** to auto-generate human-readable Executive Risk Narratives and Actionable Health Coach "Path to Approval" checklists based purely on the math.

## 🚀 Quick Start

### 1. Prerequisites
You need Python 3.9+ and Node.js v18+.
You also need a **Groq API Key** for the GenAI features to work.

Create a `.env` file in the root directory and add your key:
```env
GROQ_API_KEY="your_api_key_here"
```
*(If you do not provide an API key, the system will fall back to using Mock GenAI text).*

### 2. Environment & Pipeline Setup
Create the Python virtual environment and generate the initial ML models.
```bash
# 1. Setup Python Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Generate Synthetic Data & Train the XGBoost Pipeline
# This will generate 1,000 deep-featured rows, scale them, apply SMOTE, and train the models.
python src/data/load_data.py
python src/features/build_features.py
python src/features/preprocess.py
python src/models/train.py
```

### 3. Run the Command Center Stack
You can start both the Next.js frontend and the FastAPI backend simultaneously using the provided shell script:
```bash
# Ensure you have executed the pipeline steps above first!
# Ensure execute permissions: chmod +x run.sh
./run.sh
```

**Access the application at:** `http://localhost:3000`

## 📁 Project Structure
```text
AI-loan/
├── api/                  # FastAPI Deployment Engine (app.py)
├── frontend/             # Next.js React Dashboard (Tailwind CSS, Recharts)
├── data/                 # Raw and Preprocessed CSVs + Saved Label Encoders
├── src/                  
│   ├── api/              # The 5 Core AI Intelligence Rule Engines
│   ├── data/             # Synthetic Data Generator
│   ├── features/         # Preprocessing and Feature Engineering (SMOTE)
│   └── models/           # XGBoost Training and SHAP Explainability
├── requirements.txt      # Python dependencies
├── run.sh                # Master Execution Script
├── README.md             # This file
└── DOCUMENTATION.md      # Deep-dive System Architecture Docs
```

## 📖 Learn More
For a deep dive into how the multi-layered orchestrator, the recursive AI Negotiator, and the Dual-Layer GenAI systems work, please read the [DOCUMENTATION.md](./DOCUMENTATION.md).
