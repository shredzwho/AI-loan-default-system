import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
import joblib

class DataPreprocessor:
    def __init__(self, raw_data_path="data/raw/loan_data.csv", processed_data_path="data/processed/"):
        self.raw_data_path = raw_data_path
        self.processed_data_path = processed_data_path
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
        # Ensure processed data directory exists
        os.makedirs(self.processed_data_path, exist_ok=True)

    def load_raw_data(self) -> pd.DataFrame:
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Raw data not found at {self.raw_data_path}. Run load_data.py first.")
        return pd.read_csv(self.raw_data_path)

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Imputes missing values.
        Numeric columns: Median strategies
        Categorical columns: Mode strategies (if applicable)
        """
        print("Handling missing values...")
        df_clean = df.copy()
        for col in df_clean.columns:
            if df_clean[col].isnull().sum() > 0:
                if df_clean[col].dtype in ['float64', 'int64']:
                    # Fill numeric missing values with the median to be robust against outliers
                    median_val = df_clean[col].median()
                    df_clean[col] = df_clean[col].fillna(median_val)
                else:
                    # Fill categorical missing values with the mode
                    mode_val = df_clean[col].mode()[0]
                    df_clean[col] = df_clean[col].fillna(mode_val)
        return df_clean

    def encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Label Encodes categorical variables.
        """
        print("Encoding categorical variables...")
        df_encoded = df.copy()
        
        categorical_cols = df_encoded.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
            # Save encoder for future use (e.g., in FastAPI inference)
            self.label_encoders[col] = le
            
        # Save encoders
        joblib.dump(self.label_encoders, os.path.join(self.processed_data_path, 'label_encoders.pkl'))
        
        return df_encoded

    def preprocess(self) -> tuple:
        """
        Main preprocessing pipeline:
        1. Load data
        2. Impute missing values
        3. Feature scaling
        4. Train/Test split
        5. SMOTE for class imbalance
        """
        # 1. Load Data
        df = self.load_raw_data()
        
        # 2. Impute missing values
        df = self.handle_missing_values(df)
        
        # 3. Categorical encoding
        df = self.encode_categorical_features(df)
        
        # Separate Features (X) and Target (y)
        # Note: 'loan_status' is 1 for Default, 0 for Fully Paid
        X = df.drop('loan_status', axis=1)
        y = df['loan_status']
        
        # 4. Train/Test Split (80% train, 20% test, with stratification to preserve target distribution)
        print("Splitting data into train and test sets...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # 5. Handle Imbalanced Data using SMOTE on the training set ONLY.
        # This prevents the model from being biased towards the majority class (non-defaulters).
        print("Applying SMOTE to handle imbalanced classes in the training set...")
        smote = SMOTE(random_state=42)
        X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
        print(f"Original Training Class Distribution:\n{y_train.value_counts()}")
        print(f"SMOTE Training Class Distribution:\n{y_train_smote.value_counts()}")
        
        # 6. Feature Scaling (StandardScaler)
        # We fit the scaler strongly on training data and transform both train and test data
        print("Scaling numerical features...")
        X_train_scaled = pd.DataFrame(self.scaler.fit_transform(X_train_smote), columns=X.columns)
        X_test_scaled = pd.DataFrame(self.scaler.transform(X_test), columns=X.columns)
        
        # Save the fitted scaler for inference later
        joblib.dump(self.scaler, os.path.join(self.processed_data_path, 'scaler.pkl'))
        
        # Optional: Save processed datasets
        X_train_scaled['loan_status'] = y_train_smote
        X_test_scaled['loan_status'] = y_test.values
        
        X_train_scaled.to_csv(os.path.join(self.processed_data_path, 'train_processed.csv'), index=False)
        X_test_scaled.to_csv(os.path.join(self.processed_data_path, 'test_processed.csv'), index=False)
        print("Preprocessing complete. Processed files saved.")

        return X_train_scaled.drop('loan_status', axis=1), X_test_scaled.drop('loan_status', axis=1), y_train_smote, y_test

if __name__ == "__main__":
    preprocessor = DataPreprocessor()
    X_train, X_test, y_train, y_test = preprocessor.preprocess()
