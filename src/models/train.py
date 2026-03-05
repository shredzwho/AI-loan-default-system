import pandas as pd
import numpy as np
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report
import time

class ModelTrainer:
    def __init__(self, processed_data_path="data/processed/", models_path="src/models/saved_models/"):
        self.processed_data_path = processed_data_path
        self.models_path = models_path
        os.makedirs(self.models_path, exist_ok=True)
        
        self.models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
            "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42, n_jobs=-1)
        }
        self.results = []

    def load_data(self):
        train_path = os.path.join(self.processed_data_path, 'train_processed.csv')
        test_path = os.path.join(self.processed_data_path, 'test_processed.csv')
        
        if not os.path.exists(train_path) or not os.path.exists(test_path):
            raise FileNotFoundError("Processed datasets not found. Run preprocess.py first.")
            
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
        
        X_train = train_df.drop('loan_status', axis=1)
        y_train = train_df['loan_status']
        X_test = test_df.drop('loan_status', axis=1)
        y_test = test_df['loan_status']
        
        return X_train, X_test, y_train, y_test

    def train_and_evaluate(self):
        print("Loading processed data...")
        X_train, X_test, y_train, y_test = self.load_data()
        
        print(f"Training on {X_train.shape[0]} samples, testing on {X_test.shape[0]} samples...\n")
        
        for name, model in self.models.items():
            print(f"--- Training {name} ---")
            start_time = time.time()
            
            # Train
            model.fit(X_train, y_train)
            train_time = time.time() - start_time
            
            # Predict
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else [0]*len(y_test)
            
            # Evaluate
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred)
            rec = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            roc_auc = roc_auc_score(y_test, y_pred_proba)
            
            self.results.append({
                "Model": name,
                "Accuracy": f"{acc:.4f}",
                "Precision": f"{prec:.4f}",
                "Recall": f"{rec:.4f}",
                "F1-Score": f"{f1:.4f}",
                "ROC-AUC": f"{roc_auc:.4f}",
                "Train Time (s)": f"{train_time:.2f}"
            })
            
            # Save model
            model_filename = os.path.join(self.models_path, f"{name.replace(' ', '_').lower()}.pkl")
            joblib.dump(model, model_filename)
            print(f"Saved {name} to {model_filename}\n")
            
        self.display_results()

    def display_results(self):
        results_df = pd.DataFrame(self.results)
        print("="*80)
        print("MODEL COMPARISON REPORT")
        print("="*80)
        print(results_df.to_string(index=False))
        print("="*80)
        
        # Save results to CSV for reference
        results_df.to_csv(os.path.join(self.models_path, 'model_comparison.csv'), index=False)
        print("\nResults saved to model_comparison.csv")
        
        # Identify the best model based on ROC-AUC (common for imbalanced classification like loan default)
        best_model = results_df.loc[results_df['ROC-AUC'].astype(float).idxmax()]
        print(f"\n🏆 Best Model based on ROC-AUC: {best_model['Model']} (ROC-AUC: {best_model['ROC-AUC']})")

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train_and_evaluate()
