# AI-Based Loan Default Intelligence System

An end-to-end Machine Learning and Generative AI system to predict loan defaults, explain risk factors, and provide actionable insights through a Streamlit Dashboard.

## 🚀 Quick Start (Hackathon Setup)

### 1. Environment Setup
Create a virtual environment and install the dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Dataset Acquisition
We have provided a script that will automatically generate a highly realistic synthetic dataset (10,000 records) to get you started immediately without needing to download external data. Run:
```bash
python src/data/load_data.py
```
*Note: If you wish to use a real dataset (e.g., LendingClub from Kaggle), place the CSV file in `data/raw/loan_data.csv` before running the pipeline.*

### 3. Pipeline Execution (To be implemented)
- **Preprocess & Feature Engineering**: `python src/features/build_features.py`
- **Model Training**: `python src/models/train.py`
- **Explainability**: `python src/models/explain.py`

### 4. Run Dashboard (To be implemented)
```bash
streamlit run app/main.py
```

## 📁 Project Structure
```text
AI-loan/
├── api/                  # FastAPI Deployment
├── app/                  # Streamlit application
├── data/                 
│   ├── raw/              # Original dataset (e.g., loan_data.csv)
│   └── processed/        # Cleaned and engineered features
├── notebooks/            # Jupyter notebooks for EDA and experimentation
├── src/                  # Core source code
│   ├── api/              # LLM integration (Gemini/Groq)
│   ├── data/             # Data loading scripts
│   ├── features/         # Preprocessing and Feature Engineering
│   └── models/           # Training and Explainability (SHAP) scripts
├── requirements.txt      # Python dependencies
└── README.md             # This file
```
